import { prisma } from "@/lib/db";
import { decrypt, encrypt } from "@/lib/encryption";
import {
  needsTokenRefresh,
  refreshAccessToken,
  tokenExpiresAt,
} from "@/lib/x/oauth";

export async function saveXAccountTokens(params: {
  userId: string;
  xUserId: string;
  xUsername: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  scopes: string;
}) {
  const data = {
    xUsername: params.xUsername,
    accessTokenEnc: encrypt(params.accessToken),
    refreshTokenEnc: encrypt(params.refreshToken),
    tokenExpiresAt: tokenExpiresAt(params.expiresIn),
    scopes: params.scopes,
  };

  return prisma.xAccount.upsert({
    where: {
      userId_xUserId: {
        userId: params.userId,
        xUserId: params.xUserId,
      },
    },
    create: {
      userId: params.userId,
      xUserId: params.xUserId,
      ...data,
    },
    update: data,
  });
}

export async function getValidAccessToken(
  xAccountId: string
): Promise<string> {
  const account = await prisma.xAccount.findUniqueOrThrow({
    where: { id: xAccountId },
  });

  let accessToken = decrypt(account.accessTokenEnc);
  let refreshToken = decrypt(account.refreshTokenEnc);

  if (needsTokenRefresh(account.tokenExpiresAt)) {
    const tokens = await refreshAccessToken(refreshToken);
    accessToken = tokens.access_token;
    if (tokens.refresh_token) {
      refreshToken = tokens.refresh_token;
    }

    await prisma.xAccount.update({
      where: { id: xAccountId },
      data: {
        accessTokenEnc: encrypt(accessToken),
        refreshTokenEnc: encrypt(refreshToken),
        tokenExpiresAt: tokenExpiresAt(tokens.expires_in),
        scopes: tokens.scope ?? account.scopes,
      },
    });
  }

  return accessToken;
}

export async function disconnectXAccount(userId: string, xAccountId: string) {
  const account = await prisma.xAccount.findFirst({
    where: { id: xAccountId, userId },
  });
  if (!account) {
    throw new Error("X account not found");
  }
  await prisma.xAccount.delete({ where: { id: xAccountId } });
}
