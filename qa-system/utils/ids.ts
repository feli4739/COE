export function makeRunId(date = new Date()): string {
  const iso = date.toISOString().replace(/[:.]/g, "-");
  return `run-${iso}`;
}

export function makePersonSeed(): string {
  return `QA-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}
