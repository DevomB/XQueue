"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const GITHUB_URL =
  process.env.NEXT_PUBLIC_GITHUB_REPO ?? "https://github.com";

const RELEASES_URL = `${GITHUB_URL}/releases`;

export function SiteHeaderNav() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/#features", label: "Features" },
    { href: "/#ways-to-run", label: "Get started" },
    { href: "/#faq", label: "FAQ" },
    { href: "/docs", label: "Docs" },
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
        <a href={RELEASES_URL} target="_blank" rel="noopener noreferrer">
          <Button size="sm">Download</Button>
        </a>
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
            <a
              href={RELEASES_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
            >
              <Button size="sm" className="w-full">
                Download
              </Button>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
