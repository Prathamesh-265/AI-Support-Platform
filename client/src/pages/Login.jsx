import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth.api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    
    if (!form.email.trim() || !form.password.trim()) {
      setErr("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      if (!res.success) throw new Error(res.message);

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      navigate("/chat");
    } catch (e) {
      const apiMsg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Login failed";

      const cleanMsg =
        apiMsg.toLowerCase().includes("invalid credentials") ||
        apiMsg.toLowerCase().includes("invalid password") ||
        apiMsg.toLowerCase().includes("invalid email")
          ? "Invalid email or password."
          : apiMsg;

      setErr(cleanMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-bg min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md surface-2 p-6">
        <h1 className="text-xl font-semibold">Login</h1>
        <p className="text-sm text-slate-400 mt-1">
          Sign in to access your support chat.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            name="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-2xl px-4 py-3 bg-white/5 border border-white/10 outline-none focus:border-sky-400/40 focus:ring-4 focus:ring-sky-500/10 text-sm"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <input
  name="password"
  type="password"
  autoComplete="current-password"
  className="w-full rounded-2xl px-4 py-3 bg-white/5 border border-white/10 outline-none focus:border-sky-400/40 focus:ring-4 focus:ring-sky-500/10 text-sm"
  placeholder="Password"
  value={form.password}
  onChange={handleChange}
/>


          {err && (
            <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {err}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-2xl px-4 py-3 bg-white text-slate-950 font-semibold hover:bg-white/90 disabled:opacity-50 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-slate-400 mt-4">
          New user?{" "}
          <Link to="/register" className="text-white underline underline-offset-4">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
