import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { apiErr } from "@/lib/api";
import { Loader2, ArrowLeft } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      setError(apiErr(err.response?.data?.detail) || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E6E6F] text-brand-text flex flex-col font-sans">
      <div className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-text text-sm" data-testid="back-home">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="font-display text-4xl">CK Studio</div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-bronze mt-2">Trainer Portal</p>
          </div>
          <form onSubmit={submit} data-testid="login-form" className="space-y-5 bg-[#2A8687] border border-brand-line p-8">
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-brand-muted">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                data-testid="login-email"
                className="w-full mt-2 bg-[#1E6E6F] border border-brand-line px-4 py-3 text-brand-text focus:border-brand-bronze focus:outline-none" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-brand-muted">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                data-testid="login-password"
                className="w-full mt-2 bg-[#1E6E6F] border border-brand-line px-4 py-3 text-brand-text focus:border-brand-bronze focus:outline-none" />
            </div>
            {error && <p className="text-sm text-red-400" data-testid="login-error">{error}</p>}
            <button type="submit" disabled={loading} data-testid="login-submit"
              className="w-full bg-brand-bronze text-brand-bg py-3.5 font-medium hover:bg-brand-text transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
