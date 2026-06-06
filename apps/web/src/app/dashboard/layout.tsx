import Link from "next/link";
import { signOut } from "@/lib/auth";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { UsageMeter } from "@/components/usage-meter";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/dashboard" className="text-xl font-bold">
            XQueue
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[220px_1fr]">
        <aside className="space-y-6">
          <DashboardNav />
          <UsageMeter />
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
