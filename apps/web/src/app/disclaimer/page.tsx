import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Link href="/" className="text-sm text-sky-400 hover:underline">
          ← Back home
        </Link>
        <h1 className="mt-6 text-3xl font-semibold text-white">Disclaimer</h1>
        <div className="prose prose-invert mt-8 max-w-none space-y-4 text-sm leading-relaxed">
          <p>
            PostWave is open-source software provided <strong>&quot;AS IS&quot;</strong>,
            without warranty of any kind.
          </p>
          <h2 className="text-lg font-medium text-white">Your responsibility</h2>
          <p>
            When you run PostWave — locally or on your own server — you are the
            operator. You are responsible for your deployment, X API credentials,
            scheduled content, API costs, and compliance with X&apos;s terms.
          </p>
          <h2 className="text-lg font-medium text-white">No affiliation</h2>
          <p>
            PostWave is not affiliated with, endorsed by, or sponsored by X Corp.
          </p>
          <h2 className="text-lg font-medium text-white">No guarantees</h2>
          <p>
            The authors make no guarantees about publish timing, uptime, or
            fitness for any particular purpose.
          </p>
          <h2 className="text-lg font-medium text-white">Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, the authors shall not be
            liable for damages arising from use of this software, including
            missed posts, account actions by X, or data loss.
          </p>
          <p className="text-zinc-500">
            Full text:{" "}
            <a
              href={`${process.env.NEXT_PUBLIC_GITHUB_REPO ?? "https://github.com"}/blob/main/DISCLAIMER.md`}
              className="text-sky-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              DISCLAIMER.md on GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
