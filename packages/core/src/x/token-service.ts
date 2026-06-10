import { needsTokenRefresh, tokenExpiresAt } from "@postwave/shared";
import type { XCredentials } from "../config.js";
import type { TokenStore } from "../ports.js";
import { refreshAccessToken } from "./client.js";
import { revokeAccessToken as revokeOAuthToken } from "./oauth-flow.js";

export type TokenServiceDeps = {
  tokenStore: TokenStore;
  credentials: XCredentials;
  encrypt: (plaintext: string) => string;
  decrypt: (ciphertext: string) => string;
};

export type TokenService = {
  getValidAccessToken: () => Promise<string>;
  saveTokens: (params: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    scopes: string;
    xUserId?: string;
    xUsername?: string;
  }) => Promise<void>;
  disconnect: () => Promise<void>;
};

export function createTokenService(deps: TokenServiceDeps): TokenService {
  let inFlight: Promise<string> | null = null;

  async function loadAccessToken(): Promise<string> {
    const stored = await deps.tokenStore.getTokens();
    if (!stored) {
      throw new Error("No X account connected");
    }

    let accessToken = deps.decrypt(stored.accessTokenEnc);
    let refreshToken = deps.decrypt(stored.refreshTokenEnc);

    if (!needsTokenRefresh(stored.tokenExpiresAt)) {
      return accessToken;
    }

    const tokens = await refreshAccessToken(deps.credentials, refreshToken);
    accessToken = tokens.access_token;
    if (tokens.refresh_token) {
      refreshToken = tokens.refresh_token;
    }

    await deps.tokenStore.saveTokens({
      accessTokenEnc: deps.encrypt(accessToken),
      refreshTokenEnc: deps.encrypt(refreshToken),
      tokenExpiresAt: tokenExpiresAt(tokens.expires_in),
      scopes: tokens.scope ?? stored.scopes,
      xUserId: stored.xUserId,
      xUsername: stored.xUsername,
    });

    return accessToken;
  }

  return {
    async getValidAccessToken(): Promise<string> {
      if (inFlight) {
        return inFlight;
      }

      inFlight = loadAccessToken().finally(() => {
        inFlight = null;
      });

      return inFlight;
    },

    async saveTokens(params) {
      await deps.tokenStore.saveTokens({
        accessTokenEnc: deps.encrypt(params.accessToken),
        refreshTokenEnc: deps.encrypt(params.refreshToken),
        tokenExpiresAt: tokenExpiresAt(params.expiresIn),
        scopes: params.scopes,
        xUserId: params.xUserId,
        xUsername: params.xUsername,
      });
    },

    async disconnect() {
      const stored = await deps.tokenStore.getTokens();
      if (stored) {
        const accessToken = deps.decrypt(stored.accessTokenEnc);
        await revokeOAuthToken(deps.credentials, accessToken);
      }
      await deps.tokenStore.clear();
    },
  };
}
