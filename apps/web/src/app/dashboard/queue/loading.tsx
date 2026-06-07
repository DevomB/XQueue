function QueueSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-8 w-32 rounded bg-zinc-800" />
      <div className="h-40 rounded-xl bg-zinc-900" />
      <div className="h-64 rounded-xl bg-zinc-900" />
    </div>
  );
}

export default function QueueLoading() {
  return <QueueSkeleton />;
}
