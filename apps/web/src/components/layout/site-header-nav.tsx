"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const GITHUB_URL =
  process.env.NEXT_PUBLIC_GITHUB_REPO ?? "https://github.com";

type Props = {
  isLoggedIn: boolean;
};

export function SiteHeaderNav({ isLoggedIn }: Props) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/#features", label: "Features" },
    { href: "/#deploy", label: "Self-host" },
    { href: "/#faq", label: "FAQ" },
    { href: GITHUB_URL, label: "GitHub", external: true },
  ];

  return (
    <>
      <nav className="hidden items-center gap-5 text-sm sm:flex">
        {links.map((link) =>
          link.external ? (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              className="text-zinc-400 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          )
        )}
        {isLoggedIn ? (
          <Link href="/dashboard">
            <Button size="sm">Dashboard</Button>
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="text-zinc-400 transition-colors hover:text-white"
            >
              Log in
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </>
        )}
      </nav>

      <button
        type="button"
        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white sm:hidden"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-16 border-b border-zinc-800 bg-zinc-950 p-4 sm:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 text-zinc-300"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="py-2 text-zinc-300"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
            {isLoggedIn ? (
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)}>
                  <Button size="sm" className="w-full">
                    Get started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
