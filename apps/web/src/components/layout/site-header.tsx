import Link from "next/link";
import { auth } from "@/lib/auth";
import { BrandLogo } from "@/components/layout/brand-logo";
import { SiteHeaderNav } from "@/components/layout/site-header-nav";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <BrandLogo />
        <SiteHeaderNav isLoggedIn={!!session} />
      </div>
    </header>
  );
}
