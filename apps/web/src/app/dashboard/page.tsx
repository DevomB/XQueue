import Link from "next/link";
import { requireUser } from "@/lib/user";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { formatInTimezone } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();

  const [upcoming, publishedCount, scheduledCount] = await Promise.all([
    prisma.scheduledPost.findMany({
      where: {
        userId: user.id,
        status: "SCHEDULED",
        scheduledAt: { gte: new Date() },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    prisma.scheduledPost.count({
      where: { userId: user.id, status: "PUBLISHED" },
    }),
    prisma.scheduledPost.count({
      where: { userId: user.id, status: "SCHEDULED" },
    }),
  ]);

  const xConnected = user.xAccounts.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Welcome back. Your queue runs even when this tab is closed.
        </p>
      </div>

      {!xConnected && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
          <p className="font-medium text-amber-900 dark:text-amber-200">
            Connect your X account to start scheduling
          </p>
          <Link href="/dashboard/settings" className="mt-2 inline-block">
            <Button size="sm">Connect X</Button>
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Scheduled" value={String(scheduledCount)} />
        <Stat label="Published" value={String(publishedCount)} />
        <Stat
          label="X account"
          value={xConnected ? `@${user.xAccounts[0].xUsername}` : "Not connected"}
        />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Next scheduled</h2>
          <Link href="/dashboard/queue">
            <Button variant="secondary" size="sm">
              View queue
            </Button>
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-zinc-500">No upcoming posts scheduled.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((post) => (
              <div
                key={post.id}
                className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <p className="text-sm">{post.text}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {post.scheduledAt
                    ? formatInTimezone(post.scheduledAt, user.timezone)
                    : "—"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Link href="/dashboard/queue">
          <Button>Bulk paste queue</Button>
        </Link>
        <Link href="/dashboard/compose">
          <Button variant="secondary">Compose one</Button>
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
