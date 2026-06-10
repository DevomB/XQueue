import { readFile } from "fs/promises";
import type { XCredentials } from "../config.js";
import type { XTokenResponse } from "./types.js";

const X_TOKEN_URL = "https://api.x.com/2/oauth2/token";
const X_TWEETS_URL = "https://api.x.com/2/tweets";
const X_MEDIA_UPLOAD_URL = "https://upload.twitter.com/1.1/media/upload.json";

export { needsTokenRefresh, tokenExpiresAt } from "@postwave/shared";

function basicAuth(credentials: XCredentials): string {
  return Buffer.from(
    `${credentials.clientId}:${credentials.clientSecret}`
  ).toString("base64");
}

export async function refreshAccessToken(
  credentials: XCredentials,
  refreshToken: string
): Promise<XTokenResponse> {
  const response = await fetch(X_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth(credentials)}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: credentials.clientId,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    const error = new Error(
      `X token refresh failed: ${response.status} ${text}`
    ) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return response.json() as Promise<XTokenResponse>;
}

export async function createTweet(
  accessToken: string,
  text: string,
  mediaIds?: string[]
): Promise<{ data: { id: string } }> {
  const body: { text: string; media?: { media_ids: string[] } } = { text };
  if (mediaIds?.length) {
    body.media = { media_ids: mediaIds };
  }

  const response = await fetch(X_TWEETS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(
      `X tweet create failed: ${response.status} ${errorText}`
    ) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return response.json() as Promise<{ data: { id: string } }>;
}

export async function uploadMediaFromBuffer(
  accessToken: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const base64 = buffer.toString("base64");

  const initRes = await fetch(X_MEDIA_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      command: "INIT",
      total_bytes: String(buffer.length),
      media_type: mimeType,
      media_category: "tweet_image",
    }),
  });

  if (!initRes.ok) {
    const error = new Error(`Media INIT failed: ${initRes.status}`) as Error & {
      status?: number;
    };
    error.status = initRes.status;
    throw error;
  }

  const { media_id_string: mediaId } = (await initRes.json()) as {
    media_id_string: string;
  };

  const appendRes = await fetch(X_MEDIA_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      command: "APPEND",
      media_id: mediaId,
      segment_index: "0",
      media_data: base64,
    }),
  });

  if (!appendRes.ok) {
    const error = new Error(`Media APPEND failed: ${appendRes.status}`) as Error & {
      status?: number;
    };
    error.status = appendRes.status;
    throw error;
  }

  const finalizeRes = await fetch(X_MEDIA_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ command: "FINALIZE", media_id: mediaId }),
  });

  if (!finalizeRes.ok) {
    const error = new Error(
      `Media FINALIZE failed: ${finalizeRes.status}`
    ) as Error & { status?: number };
    error.status = finalizeRes.status;
    throw error;
  }

  return mediaId;
}

export async function uploadMediaFromPath(
  accessToken: string,
  filePath: string,
  mimeType: string
): Promise<string> {
  const buffer = await readFile(filePath);
  return uploadMediaFromBuffer(accessToken, buffer, mimeType);
}

export async function uploadMediaFromUrl(
  accessToken: string,
  imageUrl: string
): Promise<string> {
  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) {
    throw new Error(`Failed to fetch image: ${imageRes.status}`);
  }
  const buffer = Buffer.from(await imageRes.arrayBuffer());
  const mimeType = imageRes.headers.get("content-type") ?? "image/jpeg";
  return uploadMediaFromBuffer(accessToken, buffer, mimeType);
}

export function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}
