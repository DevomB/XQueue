import { postTextSchema } from "./validators.js";

export type ParsedBulkLine = {
  lineNumber: number;
  raw: string;
  text: string;
  scheduledAt?: Date;
  isDraft: boolean;
  error?: string;
};

const DATETIME_PREFIX =
  /^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2})\s*\|\s*(.+)$/;

export function parseBulkPaste(
  input: string,
  timezone: string
): ParsedBulkLine[] {
  const lines = input.split(/\r?\n/);
  const results: ParsedBulkLine[] = [];

  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1;
    const raw = lines[i];
    const trimmed = raw.trim();

    if (!trimmed) continue;

    const match = trimmed.match(DATETIME_PREFIX);

    if (!match) {
      const textResult = postTextSchema.safeParse(trimmed);
      if (!textResult.success) {
        results.push({
          lineNumber,
          raw,
          text: trimmed,
          isDraft: true,
          error: textResult.error.errors[0]?.message ?? "Invalid post text",
        });
        continue;
      }
      results.push({
        lineNumber,
        raw,
        text: textResult.data,
        isDraft: true,
      });
      continue;
    }

    const [, datePart, timePart, textPart] = match;
    const textResult = postTextSchema.safeParse(textPart.trim());

    if (!textResult.success) {
      results.push({
        lineNumber,
        raw,
        text: textPart.trim(),
        isDraft: false,
        error: textResult.error.errors[0]?.message ?? "Invalid post text",
      });
      continue;
    }

    const scheduledAt = parseLocalDatetime(datePart, timePart, timezone);
    if (!scheduledAt) {
      results.push({
        lineNumber,
        raw,
        text: textResult.data,
        isDraft: false,
        error: "Invalid date or time format",
      });
      continue;
    }

    if (scheduledAt <= new Date()) {
      results.push({
        lineNumber,
        raw,
        text: textResult.data,
        scheduledAt,
        isDraft: false,
        error: "Scheduled time must be in the future",
      });
      continue;
    }

    results.push({
      lineNumber,
      raw,
      text: textResult.data,
      scheduledAt,
      isDraft: false,
    });
  }

  return results;
}

function parseLocalDatetime(
  datePart: string,
  timePart: string,
  timezone: string
): Date | null {
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  if (
    !year ||
    !month ||
    !day ||
    hour === undefined ||
    minute === undefined ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  const probe = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  let utc = Date.UTC(year, month - 1, day, hour, minute);
  for (let i = 0; i < 3; i++) {
    const parts = formatter.formatToParts(new Date(utc));
    const get = (type: string) =>
      Number(parts.find((p) => p.type === type)?.value);
    const tzYear = get("year");
    const tzMonth = get("month");
    const tzDay = get("day");
    const tzHour = get("hour");
    const tzMinute = get("minute");

    const diffMinutes =
      (year - tzYear) * 525600 +
      (month - tzMonth) * 43200 +
      (day - tzDay) * 1440 +
      (hour - tzHour) * 60 +
      (minute - tzMinute);

    if (diffMinutes === 0) break;
    utc += diffMinutes * 60 * 1000;
  }

  const result = new Date(utc);
  if (Number.isNaN(result.getTime())) return null;
  if (probe.getFullYear() !== year) return null;
  return result;
}
