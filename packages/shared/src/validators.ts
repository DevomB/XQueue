import { z } from "zod";
import { MAX_TWEET_LENGTH } from "./plans.js";

const IANA_TIMEZONE_REGEX = /^[A-Za-z_]+\/[A-Za-z_]+$/;

export const timezoneSchema = z
  .string()
  .min(1)
  .refine(
    (tz) => {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return true;
      } catch {
        return IANA_TIMEZONE_REGEX.test(tz);
      }
    },
    { message: "Invalid IANA timezone" }
  );

export const postTextSchema = z
  .string()
  .trim()
  .min(1, "Post text is required")
  .max(MAX_TWEET_LENGTH, `Post must be ${MAX_TWEET_LENGTH} characters or less`);

export const scheduledPostInputSchema = z.object({
  text: postTextSchema,
  scheduledAt: z.coerce.date().optional(),
  timezone: timezoneSchema.default("UTC"),
  mediaUrls: z.array(z.string().url()).max(4).default([]),
});

export type ScheduledPostInput = z.infer<typeof scheduledPostInputSchema>;

export const bulkImportLineSchema = z.object({
  text: postTextSchema,
  scheduledAt: z.coerce.date().optional(),
  lineNumber: z.number().int().positive(),
  raw: z.string(),
});
