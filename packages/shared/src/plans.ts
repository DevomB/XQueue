export const PLANS = {
  FREE: "FREE",
  PRO: "PRO",
} as const;

export type Plan = (typeof PLANS)[keyof typeof PLANS];

export const PLAN_LIMITS = {
  FREE: {
    postsPerMonth: 10,
    linkPostsPerMonth: 0,
    mediaAllowed: false,
    maxImagesPerPost: 0,
  },
  PRO: {
    postsPerMonth: 150,
    linkPostsPerMonth: 30,
    mediaAllowed: true,
    maxImagesPerPost: 4,
  },
} as const;

export const X_API_COSTS = {
  textPostUsd: 0.015,
  linkPostUsd: 0.2,
} as const;

export const MAX_TWEET_LENGTH = 280;

export const URL_REGEX =
  /https?:\/\/[^\s]+|www\.[^\s]+|\b[a-z0-9-]+\.(com|org|net|io|co|app|dev|xyz|me|tv|gg)(\/[^\s]*)?\b/gi;

export function containsUrl(text: string): boolean {
  return URL_REGEX.test(text);
}

export function resetUrlRegex(): void {
  URL_REGEX.lastIndex = 0;
}

export function isLinkPost(text: string): boolean {
  resetUrlRegex();
  return containsUrl(text);
}
