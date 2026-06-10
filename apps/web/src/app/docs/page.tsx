import { redirect } from "next/navigation";

const DOCS_URL =
  process.env.NEXT_PUBLIC_GITHUB_REPO != null
    ? `${process.env.NEXT_PUBLIC_GITHUB_REPO}/tree/main/docs`
    : "https://github.com/DevomB/X-Post-Creator/tree/main/docs";

export default function DocsPage() {
  redirect(DOCS_URL);
}
