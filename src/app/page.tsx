"use client";

import { useMemo, useState } from "react";
import JSZip from "jszip";
import { parseKb } from "../lib/parseKb";
import {
  getDetectScript,
  getInstallScript,
  getRequirementScript,
  getUninstallScript
} from "../lib/scripts";

const tabs = ["Install.ps1", "Uninstall.ps1", "Detect.ps1", "Requirement.ps1"];

export default function Home() {
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [minBuild, setMinBuild] = useState<string>("");
  const [arch, setArch] = useState<"auto" | "x64" | "arm64">("auto");
  const [requireClient, setRequireClient] = useState(true);
  const [notApplicableInstalled, setNotApplicableInstalled] = useState(false);

  const parsed = useMemo(() => parseKb(input), [input]);

  const scripts = useMemo(() => {
    if (!parsed.digits || !parsed.normalized) {
      return null;
    }

    const options = {
      kbDigits: parsed.digits,
      kbId: parsed.normalized,
      minBuild: minBuild ? Number(minBuild) : null,
      arch,
      requireClient,
      notApplicableIfInstalled: notApplicableInstalled
    };

    return {
      install: getInstallScript(options),
      uninstall: getUninstallScript(options),
      detect: getDetectScript(options),
      requirement: getRequirementScript(options)
    };
  }, [parsed, minBuild, arch, requireClient, notApplicableInstalled]);

  const activeScript = useMemo(() => {
    if (!scripts) {
      return "";
    }

    switch (activeTab) {
      case "Install.ps1":
        return scripts.install;
      case "Uninstall.ps1":
        return scripts.uninstall;
      case "Detect.ps1":
        return scripts.detect;
      case "Requirement.ps1":
        return scripts.requirement;
      default:
        return "";
    }
  }, [activeTab, scripts]);

  const copyScript = async () => {
    if (!activeScript) {
      return;
    }
    await navigator.clipboard.writeText(activeScript);
  };

  const downloadZip = async () => {
    if (!scripts || !parsed.normalized) {
      return;
    }

    const zip = new JSZip();
    zip.file("Install.ps1", scripts.install);
    zip.file("Uninstall.ps1", scripts.uninstall);
    zip.file("Detect.ps1", scripts.detect);
    zip.file("Requirement.ps1", scripts.requirement);

    const content = await zip.generateAsync({ type: "blob" });
    const blobUrl = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${parsed.normalized}-Pattern-C-scripts.zip`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <main>
      <header>
        <h1>Intune Update Builder</h1>
        <p>
          Generate Intune Win32 PowerShell scripts for KB-based Windows Updates
          (Pattern C, no MSU upload).
        </p>
      </header>

      <section className="section">
        <label className="label" htmlFor="kb-input">
          Paste KB number, MSU filename, path, or URL
        </label>
        <textarea
          id="kb-input"
          placeholder="Example: windows11.0-kb5031234-x64.msu"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <div className="inline" style={{ marginTop: 12 }}>
          <span className="badge">
            Parsed KB: {parsed.normalized ?? "Not found"}
          </span>
          <span className="badge">Digits: {parsed.digits ?? "-"}</span>
        </div>
      </section>

      <section className="section grid grid-two">
        <div>
          <h2>Requirement settings</h2>
          <div className="grid" style={{ marginTop: 12 }}>
            <div>
              <label className="label" htmlFor="min-build">
                Minimum OS build (optional)
              </label>
              <input
                id="min-build"
                type="number"
                min={0}
                placeholder="e.g. 22621"
                value={minBuild}
                onChange={(event) => setMinBuild(event.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="arch">
                Expected architecture
              </label>
              <select
                id="arch"
                value={arch}
                onChange={(event) =>
                  setArch(event.target.value as "auto" | "x64" | "arm64")
                }
              >
                <option value="auto">Auto</option>
                <option value="x64">x64 only</option>
                <option value="arm64">arm64 only</option>
              </select>
            </div>
            <label className="inline">
              <input
                type="checkbox"
                checked={requireClient}
                onChange={(event) => setRequireClient(event.target.checked)}
              />
              Require Windows client OS
            </label>
            <label className="inline">
              <input
                type="checkbox"
                checked={notApplicableInstalled}
                onChange={(event) =>
                  setNotApplicableInstalled(event.target.checked)
                }
              />
              Return not applicable if KB already installed
            </label>
          </div>
        </div>
        <div>
          <h2>Current settings</h2>
          <div className="kv" style={{ marginTop: 12 }}>
            <div>
              <strong>KB:</strong> {parsed.normalized ?? "-"}
            </div>
            <div>
              <strong>Minimum build:</strong> {minBuild || "None"}
            </div>
            <div>
              <strong>Architecture:</strong> {arch}
            </div>
            <div>
              <strong>Client OS only:</strong> {requireClient ? "Yes" : "No"}
            </div>
            <div>
              <strong>Not applicable if installed:</strong>{" "}
              {notApplicableInstalled ? "Yes" : "No"}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="inline" style={{ justifyContent: "space-between" }}>
          <h2>Scripts</h2>
          <div className="inline">
            <button
              className="secondary"
              onClick={copyScript}
              disabled={!activeScript}
            >
              Copy {activeTab}
            </button>
            <button onClick={downloadZip} disabled={!scripts}>
              Download ZIP
            </button>
          </div>
        </div>
        <div className="tabs" style={{ marginTop: 12 }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab ${tab === activeTab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        {activeScript ? (
          <pre>{activeScript}</pre>
        ) : (
          <div className="notice">
            Enter a KB number above to generate scripts.
          </div>
        )}
      </section>

      <section className="section">
        <h2>Intune settings summary</h2>
        <p style={{ marginTop: 8 }}>
          Use the Intune Win32 app workflow with PowerShell script installer and
          uninstaller. Set the install command to run Install.ps1 and the
          uninstall command to run Uninstall.ps1. Add Detect.ps1 as a custom
          detection rule and Requirement.ps1 as a custom requirement script.
          Package only the scripts (Pattern C) and keep your MSU hosted
          separately.
        </p>
        <div className="notice" style={{ marginTop: 12 }}>
          Scripts are generated client-side only; no MSU upload or API calls are
          performed.
        </div>
      </section>

      <div className="footer">
        <p>
          Tip: place the target .msu file in the same folder as Install.ps1
          before packaging into a Win32 app.
        </p>
      </div>
    </main>
  );
}
