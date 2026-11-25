import { NavLink, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, logout } from "../api/auth";
import Logo from "./Logo";
import { PlusIcon, LogOutIcon } from "./Icons";

export default function AppShell({ children, width = "max-w-6xl" }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    retry: false,
  });
  const user = data?.user;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      queryClient.clear();
      navigate("/");
    }
  };

  return (
    <div className="forge-backdrop min-h-screen">
      <header className="sticky top-0 z-30 border-b border-ink-700/70 bg-ink-950/85 backdrop-blur">
        <div className={`mx-auto flex h-16 items-center gap-6 px-5 ${width}`}>
          <Logo to="/chains" />
          <nav className="flex items-center gap-1 text-sm">
            <NavLink
              to="/chains"
              end
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  isActive ? "bg-ink-800 text-sand-50" : "text-sand-400 hover:text-sand-50"
                }`
              }
            >
              Workflows
            </NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/chains/new" className="btn btn-primary btn-sm">
              <PlusIcon width={14} height={14} />
              <span className="hidden sm:inline">New workflow</span>
            </Link>
            {user && (
              <div className="flex items-center gap-2 border-l border-ink-700 pl-3">
                <span
                  className="grid h-8 w-8 place-items-center rounded-full bg-ink-700 text-xs font-semibold uppercase text-ember-300"
                  title={user.email}
                >
                  {user.name?.[0] || "?"}
                </span>
                <span className="hidden max-w-[10rem] truncate text-sm text-sand-200 md:inline">
                  {user.name}
                </span>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm" title="Log out" aria-label="Log out">
                  <LogOutIcon />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className={`mx-auto px-5 py-10 ${width}`}>{children}</main>
    </div>
  );
}
