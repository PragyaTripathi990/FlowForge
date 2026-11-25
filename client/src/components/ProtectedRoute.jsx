import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../api/auth";
import { LogoMark } from "./Logo";

export default function ProtectedRoute({ children }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="forge-backdrop grid min-h-screen place-items-center">
        <div className="flex animate-pulse items-center gap-3 text-sand-400">
          <LogoMark size={24} />
          <span className="text-sm">Loading your workspace…</span>
        </div>
      </div>
    );
  }

  if (error || !data?.user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
