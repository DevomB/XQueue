import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { buildAuthorizeUrl, generatePkce } from "@/lib/x/oauth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL));
  }

  const { verifier, challenge } = generatePkce();
  const state = randomBytes(16).toString("hex");

  const cookieStore = await cookies();
  cookieStore.set("x_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  cookieStore.set("x_oauth_verifier", verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  cookieStore.set("x_oauth_user", session.user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const url = buildAuthorizeUrl({ state, codeChallenge: challenge });
  return NextResponse.redirect(url);
}
