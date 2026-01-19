export type ScriptOptions = {
  kbDigits: string;
  kbId: string;
  minBuild?: number | null;
  arch: "auto" | "x64" | "arm64";
  requireClient: boolean;
  notApplicableIfInstalled: boolean;
};

export function getInstallScript({ kbDigits, kbId }: ScriptOptions): string {
  return `# Install.ps1 - Pattern C (KB-based, no MSU upload)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$kbDigits = "${kbDigits}"
$kbId = "${kbId}"

$msuFiles = Get-ChildItem -Path $scriptDir -Filter "*.msu" -File -ErrorAction SilentlyContinue
if (-not $msuFiles) {
  Write-Output "No .msu file found in $scriptDir"
  exit 1
}

$matching = $msuFiles | Where-Object { $_.Name -match $kbDigits }
$target = if ($matching) { $matching[0] } else { $msuFiles[0] }

$wusaPath = if ([Environment]::Is64BitOperatingSystem -and -not [Environment]::Is64BitProcess) {
  Join-Path $env:WINDIR "Sysnative\\wusa.exe"
} else {
  Join-Path $env:WINDIR "System32\\wusa.exe"
}

Write-Output "Installing $($target.Name) via $wusaPath"
$process = Start-Process -FilePath $wusaPath -ArgumentList "`"$($target.FullName)`" /quiet /norestart" -Wait -PassThru
$exitCode = $process.ExitCode

$successCodes = 0, 3010, 2359302
if ($successCodes -contains $exitCode) {
  Write-Output "$kbId installation complete with exit code $exitCode"
  exit 0
}

Write-Output "$kbId installation failed with exit code $exitCode"
exit $exitCode
`;
}

export function getUninstallScript({ kbDigits, kbId }: ScriptOptions): string {
  return `# Uninstall.ps1 - Pattern C (KB-based, no MSU upload)
$kbDigits = "${kbDigits}"
$kbId = "${kbId}"

$wusaPath = if ([Environment]::Is64BitOperatingSystem -and -not [Environment]::Is64BitProcess) {
  Join-Path $env:WINDIR "Sysnative\\wusa.exe"
} else {
  Join-Path $env:WINDIR "System32\\wusa.exe"
}

Write-Output "Uninstalling $kbId via $wusaPath"
$process = Start-Process -FilePath $wusaPath -ArgumentList "/uninstall /kb:$kbDigits /quiet /norestart" -Wait -PassThru
$exitCode = $process.ExitCode

$successCodes = 0, 3010, 2359302
if ($successCodes -contains $exitCode) {
  Write-Output "$kbId uninstall complete with exit code $exitCode"
  exit 0
}

Write-Output "$kbId uninstall failed with exit code $exitCode"
exit $exitCode
`;
}

export function getDetectScript({ kbId }: ScriptOptions): string {
  return `# Detect.ps1 - Pattern C (KB-based)
$kbId = "${kbId}"

try {
  Get-HotFix -Id $kbId -ErrorAction Stop | Out-Null
  Write-Output "$kbId installed"
  exit 0
} catch {
  exit 1
}
`;
}

export function getRequirementScript({
  kbId,
  minBuild,
  arch,
  requireClient,
  notApplicableIfInstalled
}: ScriptOptions): string {
  const minBuildLine =
    minBuild && minBuild > 0
      ? `if ($osBuild -lt ${minBuild}) { exit 1 }`
      : "# No minimum build configured";

  const archCheck =
    arch === "auto"
      ? "# Architecture auto-detect: no restriction"
      : `if ($deviceArch -ne \"${arch}\") { exit 1 }`;

  const clientCheck = requireClient
    ? `if ($osInfo.ProductType -ne 1) { exit 1 }`
    : "# Server OS allowed";

  const installedCheck = notApplicableIfInstalled
    ? `try {
  Get-HotFix -Id $kbId -ErrorAction Stop | Out-Null
  exit 1
} catch {
  # Not installed
}`
    : "# Already-installed check disabled";

  return `# Requirement.ps1 - Pattern C (KB-based)
$kbId = "${kbId}"

$osInfo = Get-CimInstance -ClassName Win32_OperatingSystem
$osBuild = [int]$osInfo.BuildNumber

${clientCheck}

$deviceArch = if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64" -or $env:PROCESSOR_ARCHITEW6432 -eq "ARM64") {
  "arm64"
} elseif ($env:PROCESSOR_ARCHITECTURE -eq "AMD64" -or $env:PROCESSOR_ARCHITEW6432 -eq "AMD64") {
  "x64"
} else {
  "x86"
}

${archCheck}

${minBuildLine}

${installedCheck}

exit 0
`;
}
