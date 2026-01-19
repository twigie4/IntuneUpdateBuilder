export type ParsedKb = {
  digits: string | null;
  normalized: string | null;
};

const kbPattern = /kb\s*[-:]?\s*(\d{6,8})/i;
const fallbackPattern = /(\d{6,8})/;

export function parseKb(input: string): ParsedKb {
  const trimmed = input.trim();
  if (!trimmed) {
    return { digits: null, normalized: null };
  }

  const kbMatch = trimmed.match(kbPattern) ?? trimmed.match(fallbackPattern);
  const digits = kbMatch?.[1] ?? null;

  return {
    digits,
    normalized: digits ? `KB${digits}` : null
  };
}

export function runParseKbTests(): { name: string; pass: boolean }[] {
  const cases = [
    { name: "KB5031234", input: "KB5031234", expected: "KB5031234" },
    { name: "5031234", input: "5031234", expected: "KB5031234" },
    {
      name: "Filename",
      input: "windows11.0-kb5031234-x64.msu",
      expected: "KB5031234"
    },
    {
      name: "URL",
      input: "https://example.com/updates/windows11.0-kb5031234-x64.msu",
      expected: "KB5031234"
    }
  ];

  return cases.map((testCase) => {
    const result = parseKb(testCase.input).normalized;
    return {
      name: testCase.name,
      pass: result === testCase.expected
    };
  });
}
