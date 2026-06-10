import { createHash, randomBytes } from "crypto";
import type { XCredentials } from "../config.js";

const X_AUTHORIZE_URL = "https://x.com/i/oauth2/authorize";
const X_TOKEN_URL = "https://api.x.com/2/oauth2/token";
const X_USER_URL = "https://api.x.com/2/users/me";
const X_REVOKE_URL = "https://api.x.com/2/oauth2/revoke";

import type { XTokenResponse, XUserResponse } from "./types.js";

export const X_SCOPES = [
  "tweet.read",
  "tweet.write",
  "users.read",
  "offline.access",
].join(" ");

export function generatePkce(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256")
    .update(verifier)
    .digest("base64url");
  return { verifier, challenge };
}

export function buildAuthorizeUrl(
  credentials: XCredentials,
  params: {
    state: string;
    codeChallenge: string;
  }
): string {
  if (!credentials.callbackUrl) {
    throw new Error("X callback URL is not configured");
  }

  const url = new URL(X_AUTHORIZE_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", credentials.clientId);
  url.searchParams.set("redirect_uri", credentials.callbackUrl);
  url.searchParams.set("scope", X_SCOPES);
  url.searchParams.set("state", params.state);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

function basicAuth(credentials: XCredentials): string {
  return Buffer.from(
    `${credentials.clientId}:${credentials.clientSecret}`
  ).toString("base64");
}

export async function exchangeCodeForTokens(
  credentials: XCredentials,
  code: string,
  codeVerifier: string
): Promise<XTokenResponse> {
  if (!credentials.callbackUrl) {
    throw new Error("X callback URL is not configured");
  }

  const response = await fetch(X_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth(credentials)}`,
    },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      redirect_uri: credentials.callbackUrl,
      code_verifier: codeVerifier,
      client_id: credentials.clientId,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`X token exchange failed: ${response.status} ${text}`);
  }

  return response.json() as Promise<XTokenResponse>;
}

export async function fetchXUser(accessToken: string): Promise<XUserResponse> {
  const response = await fetch(`${X_USER_URL}?user.fields=username,name`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`X user fetch failed: ${response.status} ${text}`);
  }

  return response.json() as Promise<XUserResponse>;
}

export async function revokeAccessToken(
  credentials: XCredentials,
  token: string
): Promise<void> {
  const body = new URLSearchParams({
    token,
    token_type_hint: "access_token",
  });

  await fetch(X_REVOKE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth(credentials)}`,
    },
    body,
  }).catch(() => null);
}

export { needsTokenRefresh, tokenExpiresAt } from "@postwave/shared";
