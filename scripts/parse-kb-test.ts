import { parseKb, runParseKbTests } from "../src/lib/parseKb";

const results = runParseKbTests();
const failures = results.filter((result) => !result.pass);

if (failures.length > 0) {
  console.error("KB parse tests failed:");
  failures.forEach((failure) => {
    console.error(`- ${failure.name}`);
  });
  process.exit(1);
}

const sample = "windows11.0-kb5031234-x64.msu";
const parsed = parseKb(sample);
console.log("All KB parse tests passed.");
console.log(`Sample parse: ${sample} -> ${parsed.normalized}`);
