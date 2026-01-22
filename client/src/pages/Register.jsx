import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/auth.api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuth();

  const [mode, setMode] = useState("user");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    adminSecret: "",
  });

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  
  const DEMO_ADMIN_SECRET = "prathamesh_admin_2026";

 
  const [copied, setCopied] = useState(false);

 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(DEMO_ADMIN_SECRET);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setErr("Failed to copy admin secret. Please copy manually.");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    
    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      setErr("Please fill all required fields.");
      return;
    }

    if (mode === "admin" && !form.adminSecret.trim()) {
      setErr("Admin secret is required for admin registration.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        role: mode,
      };

      if (mode === "admin") payload.adminSecret = form.adminSecret.trim();

      const res = await registerUser(payload);
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
        "Registration failed";

      const msgLower = apiMsg.toLowerCase();
      let cleanMsg = apiMsg;

      if (msgLower.includes("email already")) {
        cleanMsg = "This email is already registered. Please login instead.";
      } else if (msgLower.includes("admin secret")) {
        cleanMsg = "Invalid admin secret. Please check and try again.";
      } else if (msgLower.includes("all fields are required")) {
        cleanMsg = "Please fill all required fields.";
      }

      setErr(cleanMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-bg min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md surface-2 p-6">
        <h1 className="text-xl font-semibold">Create account</h1>
        <p className="text-sm text-slate-400 mt-1">
          Choose account type and register.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/5 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setMode("user");
              setForm((prev) => ({ ...prev, adminSecret: "" }));
            }}
            className={[
              "rounded-2xl px-4 py-2 text-sm font-medium transition",
              mode === "user"
                ? "bg-white text-slate-950"
                : "text-slate-300 hover:text-white",
            ].join(" ")}
          >
            User
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("admin");
              
             
            }}
            className={[
              "rounded-2xl px-4 py-2 text-sm font-medium transition",
              mode === "admin"
                ? "bg-white text-slate-950"
                : "text-slate-300 hover:text-white",
            ].join(" ")}
          >
            Admin
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <input
            name="username"
            autoComplete="username"
            className="w-full rounded-2xl px-4 py-3 bg-white/5 border border-white/10 outline-none focus:border-sky-400/40 focus:ring-4 focus:ring-sky-500/10 text-sm"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
          />

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
            autoComplete="new-password"
            className="w-full rounded-2xl px-4 py-3 bg-white/5 border border-white/10 outline-none focus:border-sky-400/40 focus:ring-4 focus:ring-sky-500/10 text-sm"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          
          {mode === "admin" && (
            <div className="space-y-2">
              <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-100">
                      Demo Admin Secret
                    </div>
                    
                  </div>

                  <button
                    type="button"
                    onClick={copySecret}
                    className="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold bg-white/10 border border-white/10 hover:bg-white/15 transition"
                  >
                    {copied ? "Copied ✅" : "Copy"}
                  </button>
                </div>

                <div className="mt-3 rounded-xl px-3 py-2 text-xs font-mono bg-black/30 border border-white/10 text-slate-200 overflow-x-auto">
                  {DEMO_ADMIN_SECRET}
                </div>
              </div>

              <input
                name="adminSecret"
                type="password"
                autoComplete="off"
                className="w-full rounded-2xl px-4 py-3 bg-white/5 border border-white/10 outline-none focus:border-emerald-400/40 focus:ring-4 focus:ring-emerald-500/10 text-sm"
                placeholder="Admin Secret"
                value={form.adminSecret}
                onChange={handleChange}
              />

              <p className="text-xs text-slate-500 leading-relaxed">
                Tip: Leave it as default for demo or replace with your own secret.
              </p>
            </div>
          )}

          {err && (
            <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {err}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-2xl px-4 py-3 bg-white text-slate-950 font-semibold hover:bg-white/90 disabled:opacity-50 transition"
          >
            {loading
              ? "Creating..."
              : mode === "admin"
              ? "Create admin account"
              : "Create user account"}
          </button>
        </form>

        <p className="text-sm text-slate-400 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-white underline underline-offset-4">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
