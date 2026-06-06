import { SiteHeader } from "@/components/layout/site-header";
import { loadLegalDoc, markdownToHtml } from "@/lib/legal";

export default async function AcceptableUsePage() {
  const content = await loadLegalDoc("acceptable-use.md");

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main
        className="prose mx-auto max-w-3xl px-4 py-16 dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
      />
    </div>
  );
}
