type LogFields = Record<string, unknown>;

export function logInfo(message: string, fields?: LogFields): void {
  console.log(JSON.stringify({ level: "info", message, ...fields, ts: new Date().toISOString() }));
}

export function logError(message: string, fields?: LogFields): void {
  console.error(JSON.stringify({ level: "error", message, ...fields, ts: new Date().toISOString() }));
}

export function logWarn(message: string, fields?: LogFields): void {
  console.warn(JSON.stringify({ level: "warn", message, ...fields, ts: new Date().toISOString() }));
}
