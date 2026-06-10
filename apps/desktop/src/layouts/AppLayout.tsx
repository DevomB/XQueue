import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { isIpcConnected } from "@/lib/ipc";

const tabs = [
  { to: "/queue", label: "Queue" },
  { to: "/compose", label: "Compose" },
  { to: "/settings", label: "Settings" },
];

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-beam">PostWave</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs",
                isIpcConnected()
                  ? "bg-emerald-900/50 text-emerald-300"
                  : "bg-zinc-800 text-zinc-500"
              )}
            >
              {isIpcConnected() ? "Daemon" : "Mock"}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[220px_1fr]">
        <aside>
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sky-500/15 text-sky-400"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  )
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
