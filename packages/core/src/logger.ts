type LogFields = Record<string, unknown>;

function write(
  level: "info" | "warn" | "error",
  message: string,
  fields?: LogFields
): void {
  const line = JSON.stringify({
    level,
    message,
    ...fields,
    ts: new Date().toISOString(),
  });

  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.log(line);
}

export function logInfo(message: string, fields?: LogFields): void {
  write("info", message, fields);
}

export function logWarn(message: string, fields?: LogFields): void {
  write("warn", message, fields);
}

export function logError(message: string, fields?: LogFields): void {
  write("error", message, fields);
}
