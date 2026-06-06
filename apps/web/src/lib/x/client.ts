const X_TWEETS_URL = "https://api.x.com/2/tweets";
const X_MEDIA_UPLOAD_URL = "https://upload.twitter.com/1.1/media/upload.json";

export type CreateTweetResult = {
  data: { id: string; text: string };
};

export async function createTweet(
  accessToken: string,
  text: string,
  mediaIds?: string[]
): Promise<CreateTweetResult> {
  const body: { text: string; media?: { media_ids: string[] } } = { text };
  if (mediaIds && mediaIds.length > 0) {
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

  return response.json() as Promise<CreateTweetResult>;
}

export async function uploadMedia(
  accessToken: string,
  mediaBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const base64 = mediaBuffer.toString("base64");

  const initBody = new URLSearchParams({
    command: "INIT",
    total_bytes: String(mediaBuffer.length),
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

  if (!initRes.ok) {
    throw new Error(`Media INIT failed: ${initRes.status}`);
  }

  const initData = (await initRes.json()) as { media_id_string: string };
  const mediaId = initData.media_id_string;

  const appendBody = new URLSearchParams({
    command: "APPEND",
    media_id: mediaId,
    segment_index: "0",
    media_data: base64,
  });

  const appendRes = await fetch(X_MEDIA_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: appendBody,
  });

  if (!appendRes.ok) {
    throw new Error(`Media APPEND failed: ${appendRes.status}`);
  }

  const finalizeBody = new URLSearchParams({
    command: "FINALIZE",
    media_id: mediaId,
  });

  const finalizeRes = await fetch(X_MEDIA_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: finalizeBody,
  });

  if (!finalizeRes.ok) {
    throw new Error(`Media FINALIZE failed: ${finalizeRes.status}`);
  }

  return mediaId;
}

export function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}
