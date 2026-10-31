import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/AuthContext";
import ThemeToggle from "@/components/portfolio/ThemeToggle";

export const Route = createFileRoute("/_authed/admin")({
  head: () => ({ meta: [{ title: "Portfolio dashboard" }] }),
  component: AdminLayout,
});

const TABS = [
  { to: "/admin", label: "Intro video" },
  { to: "/admin/projects", label: "Projects" },
  { to: "/admin/covers", label: "Project covers" },
  { to: "/admin/videos", label: "Project videos" },
  { to: "/admin/drawings", label: "Drawings" },
  { to: "/admin/cv", label: "CV" },
  { to: "/admin/sections", label: "Section details" },
  { to: "/admin/files", label: "Project files" },
];

function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="shell flex h-16 items-center justify-between gap-4 md:h-20">
          <span className="font-display text-[13px] font-bold uppercase tracking-[0.18em]">
            Portfolio dashboard
          </span>
          <div className="flex items-center gap-2">
            <ThemeToggle className="h-auto w-auto p-2" />
            <Link
              to="/"
              className="border border-foreground/25 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              View site
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="border border-foreground/25 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-border">
        <div className="no-scrollbar shell flex gap-6 overflow-x-auto py-3">
          {TABS.map((tab) => (
            <Link
              key={tab.to}
              to={tab.to}
              activeOptions={{ exact: true }}
              className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em] text-primary" }}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <main className="shell py-10 md:py-14">
        {user && user.role !== "admin" ? (
          <p className="max-w-[54ch] text-sm leading-relaxed text-muted-foreground">
            This dashboard is limited to the portfolio owner. You are signed in as {user.email}.
          </p>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}