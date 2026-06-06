import { readFile } from "fs/promises";
import path from "path";

const LEGAL_FILES = ["terms.md", "privacy.md", "acceptable-use.md", "security.md"];

const CONTACT_EMAIL = "Devom.b@yahoo.com";

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
        return `<h1>${linkify(escape(line.slice(2)))}</h1>`;
      }
      if (line.startsWith("## ")) {
        return `<h2>${linkify(escape(line.slice(3)))}</h2>`;
      }
      if (line.startsWith("- ")) {
        return `<li>${linkify(escape(line.slice(2)))}</li>`;
      }
      if (line.match(/^\d+\.\s/)) {
        return `<li>${linkify(escape(line.replace(/^\d+\.\s/, "")))}</li>`;
      }
      if (!line.trim()) return "";
      return `<p>${linkify(escape(line))}</p>`;
    })
    .filter(Boolean)
    .join("\n");
}

function linkify(text: string): string {
  if (text.includes(CONTACT_EMAIL)) {
    return text.replace(
      CONTACT_EMAIL,
      `<a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>`
    );
  }
  return text;
}

function escape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
