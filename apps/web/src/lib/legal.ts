import { readFile } from "fs/promises";
import path from "path";

const LEGAL_FILES = ["terms.md", "privacy.md", "acceptable-use.md", "security.md"];

export async function loadLegalDoc(name: string): Promise<string> {
  if (!LEGAL_FILES.includes(name)) {
    throw new Error("Unknown legal document");
  }

  const filePath = path.join(process.cwd(), "content", "legal", name);
  return readFile(filePath, "utf-8");
}

export function markdownToHtml(md: string): string {
  return md
    .split("\n")
    .map((line) => {
      if (line.startsWith("# ")) {
        return `<h1 class="text-3xl font-bold mb-6">${escape(line.slice(2))}</h1>`;
      }
      if (line.startsWith("## ")) {
        return `<h2 class="text-xl font-semibold mt-8 mb-3">${escape(line.slice(3))}</h2>`;
      }
      if (line.startsWith("- ")) {
        return `<li class="ml-4">${escape(line.slice(2))}</li>`;
      }
      if (!line.trim()) return "<br />";
      return `<p class="mb-3 text-zinc-600 dark:text-zinc-400">${escape(line)}</p>`;
    })
    .join("\n");
}

function escape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
