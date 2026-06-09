const X_TOKEN_URL = "https://api.x.com/2/oauth2/token";
const X_TWEETS_URL = "https://api.x.com/2/tweets";
const X_MEDIA_UPLOAD_URL = "https://upload.twitter.com/1.1/media/upload.json";

type XTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
};

export { needsTokenRefresh, tokenExpiresAt } from "@postwave/shared";

export async function refreshAccessToken(
  refreshToken: string
): Promise<XTokenResponse> {
  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("X OAuth is not configured");
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const response = await fetch(X_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
    }),
  });

  if (!response.ok) {
    throw new Error(`X token refresh failed: ${response.status}`);
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
  const base64 = buffer.toString("base64");

  const initBody = new URLSearchParams({
    command: "INIT",
    total_bytes: String(buffer.length),
    media_type: mimeType,
    media_category: "tweet_image",
  });

  const initRes = await fetch(X_MEDIA_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: initBody,
  });

  if (!initRes.ok) throw new Error(`Media INIT failed: ${initRes.status}`);
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
    throw new Error(`Media APPEND failed: ${appendRes.status}`);
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
    throw new Error(`Media FINALIZE failed: ${finalizeRes.status}`);
  }

  return mediaId;
}

export function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}
