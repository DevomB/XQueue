import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { loadLegalDoc, markdownToHtml } from "@/lib/legal";

type Props = {
  doc: string;
  title: string;
  description: string;
};

export async function LegalPage({ doc, title, description }: Props) {
  const content = await loadLegalDoc(doc);
  const updatedMatch = content.match(/\*\*Last updated:\*\*\s*(.+)/);
  const lastUpdated = updatedMatch?.[1] ?? "June 5, 2026";

  return (
    <div className="min-h-screen bg-zinc-950">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <Link
          href="/"
          className="text-sm text-zinc-500 transition-colors hover:text-sky-400"
        >
          ← Back to home
        </Link>
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 md:p-10">
          <p className="text-xs font-medium uppercase tracking-widest text-sky-400">
            Legal
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">{description}</p>
          <p className="mt-1 text-xs text-zinc-600">
            Last updated: {lastUpdated}
          </p>
          <div
            className="legal-content mt-10 border-t border-zinc-800 pt-10"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
          />
        </div>
        <p className="mt-8 text-center text-sm text-zinc-500">
          Questions?{" "}
          <a
            href="mailto:Devom.b@yahoo.com"
            className="text-sky-400 hover:underline"
          >
            Devom.b@yahoo.com
          </a>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
