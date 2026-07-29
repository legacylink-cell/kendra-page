import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (user === null)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E1F4F5]" data-testid="auth-loading">
        <Loader2 className="h-6 w-6 animate-spin text-[#1E6E6F]" />
      </div>
    );
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}
