import { createHash, randomBytes } from "crypto";

const X_AUTHORIZE_URL = "https://x.com/i/oauth2/authorize";
const X_TOKEN_URL = "https://api.x.com/2/oauth2/token";
const X_USER_URL = "https://api.x.com/2/users/me";

export const X_SCOPES = [
  "tweet.read",
  "tweet.write",
  "users.read",
  "offline.access",
].join(" ");

export type XTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

export type XUserResponse = {
  data: {
    id: string;
    username: string;
    name: string;
  };
};

export function generatePkce(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256")
    .update(verifier)
    .digest("base64url");
  return { verifier, challenge };
}

export function buildAuthorizeUrl(params: {
  state: string;
  codeChallenge: string;
}): string {
  const clientId = process.env.X_CLIENT_ID;
  const redirectUri = process.env.X_CALLBACK_URL;
  if (!clientId || !redirectUri) {
    throw new Error("X OAuth is not configured");
  }

  const url = new URL(X_AUTHORIZE_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", X_SCOPES);
  url.searchParams.set("state", params.state);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<XTokenResponse> {
  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  const redirectUri = process.env.X_CALLBACK_URL;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("X OAuth is not configured");
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const body = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
    client_id: clientId,
  });

  const response = await fetch(X_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`X token exchange failed: ${response.status} ${text}`);
  }

  return response.json() as Promise<XTokenResponse>;
}

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

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
  });

  const response = await fetch(X_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`X token refresh failed: ${response.status} ${text}`);
  }

  return response.json() as Promise<XTokenResponse>;
}

export async function fetchXUser(accessToken: string): Promise<XUserResponse> {
  const response = await fetch(
    `${X_USER_URL}?user.fields=username,name`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`X user fetch failed: ${response.status} ${text}`);
  }

  return response.json() as Promise<XUserResponse>;
}

export function tokenExpiresAt(expiresInSeconds: number): Date {
  return new Date(Date.now() + expiresInSeconds * 1000);
}

export function needsTokenRefresh(expiresAt: Date, bufferMinutes = 5): boolean {
  return expiresAt.getTime() <= Date.now() + bufferMinutes * 60 * 1000;
}
