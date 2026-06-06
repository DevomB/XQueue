import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeCodeForTokens,
  fetchXUser,
} from "@/lib/x/oauth";
import { saveXAccountTokens } from "@/lib/x/token-store";

export async function GET(request: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${appUrl}/dashboard/settings?x_error=${encodeURIComponent(error)}`
    );
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("x_oauth_state")?.value;
  const verifier = cookieStore.get("x_oauth_verifier")?.value;
  const userId = cookieStore.get("x_oauth_user")?.value;

  cookieStore.delete("x_oauth_state");
  cookieStore.delete("x_oauth_verifier");
  cookieStore.delete("x_oauth_user");

  if (!code || !state || !verifier || !userId || state !== savedState) {
    return NextResponse.redirect(
      `${appUrl}/dashboard/settings?x_error=invalid_oauth_state`
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code, verifier);
    if (!tokens.refresh_token) {
      throw new Error("No refresh token received");
    }

    const xUser = await fetchXUser(tokens.access_token);
    await saveXAccountTokens({
      userId,
      xUserId: xUser.data.id,
      xUsername: xUser.data.username,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      scopes: tokens.scope,
    });

    return NextResponse.redirect(
      `${appUrl}/dashboard/settings?x_connected=1`
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "oauth_failed";
    return NextResponse.redirect(
      `${appUrl}/dashboard/settings?x_error=${encodeURIComponent(message)}`
    );
  }
}
