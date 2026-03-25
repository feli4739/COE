export interface Logger {
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
}

function format(level: string, message: string, data?: unknown): string {
  const ts = new Date().toISOString();
  const suffix = data === undefined ? "" : ` ${JSON.stringify(data)}`;
  return `[QA][${level}][${ts}] ${message}${suffix}`;
}

export const logger: Logger = {
  info(message, data) {
    console.log(format("INFO", message, data));
  },
  warn(message, data) {
    console.warn(format("WARN", message, data));
  },
  error(message, data) {
    console.error(format("ERROR", message, data));
  },
};
