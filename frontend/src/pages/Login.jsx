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
    <div className="min-h-screen bg-[#FFFFFF] text-[#0B3B4A] flex flex-col font-body">
      <div className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 text-[#4A5B60] hover:text-[#0FB6C4] text-sm transition-colors" data-testid="back-home">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="font-display text-5xl tracking-[-0.02em] text-[#0B3B4A]">K<span className="italic text-[#0FB6C4]">P</span> Studio</div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#0FB6C4] mt-2">Trainer Portal</p>
          </div>
          <form onSubmit={submit} data-testid="login-form" className="space-y-5 bg-white border border-[#D6EEF1] rounded-2xl p-8 shadow-sm">
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-[#4A5B60]">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                data-testid="login-email"
                className="w-full mt-2 bg-[#ECFDFF] border border-[#D6EEF1] rounded-lg px-4 py-3 text-[#0B3B4A] focus:border-[#0FB6C4] focus:outline-none focus:ring-2 focus:ring-[#0FB6C4]/25 transition-colors" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-[#4A5B60]">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                data-testid="login-password"
                className="w-full mt-2 bg-[#ECFDFF] border border-[#D6EEF1] rounded-lg px-4 py-3 text-[#0B3B4A] focus:border-[#0FB6C4] focus:outline-none focus:ring-2 focus:ring-[#0FB6C4]/25 transition-colors" />
            </div>
            {error && <p className="text-sm text-red-600" data-testid="login-error">{error}</p>}
            <button type="submit" disabled={loading} data-testid="login-submit"
              className="w-full bg-[#0FB6C4] text-white py-3.5 rounded-full font-medium tracking-wide hover:bg-[#0C97A3] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
