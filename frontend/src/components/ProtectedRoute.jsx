import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (user === null)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3F0]" data-testid="auth-loading">
        <Loader2 className="h-6 w-6 animate-spin text-[#C17D59]" />
      </div>
    );
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}
