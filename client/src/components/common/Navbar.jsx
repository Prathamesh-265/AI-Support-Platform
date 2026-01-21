import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bot, LogOut, Shield, MessageSquare } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const NavLink = ({ to, active, icon: Icon, children }) => {
  return (
    <Link
      to={to}
      className={[
        "flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition",
        active
          ? "bg-white/10 text-white border border-white/10"
          : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent",
      ].join(" ")}
    >
      <Icon size={18} />
      <span className="hidden sm:inline">{children}</span>
    </Link>
  );
};

export default function Navbar() {
  const { token, user, setToken, setUser } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    navigate("/login");
  };

  const isChat = pathname.startsWith("/chat");
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
       
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-[87px] flex items-center justify-between gap-4">
          {/* Brand */}
          <Link to="/chat" className="flex items-center gap-3 min-w-[220px]">
            <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
              <Bot size={20} className="text-sky-300" />
            </div>

            <div className="leading-tight">
              <div className="text-[15px] font-semibold text-slate-100">
                AI Support
              </div>
              <div className="text-xs text-slate-400 hidden sm:block mt-0.5">
                Customer Support Assistant Platform
              </div>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-2">
            {token ? (
              <>
                <NavLink to="/chat" active={isChat} icon={MessageSquare}>
                  Chat
                </NavLink>

                {user?.role === "admin" && (
                  <NavLink to="/admin" active={isAdmin} icon={Shield}>
                    Admin
                  </NavLink>
                )}

                {/* Logout */}
                <button
                  onClick={logout}
                  className="ml-1 rounded-2xl px-4 py-2.5 text-sm font-medium bg-white/10 border border-white/10 hover:bg-white/15 transition flex items-center gap-2"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  className="rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/5 transition"
                  to="/login"
                >
                  Login
                </Link>

                <Link
                  className="rounded-2xl px-4 py-2.5 text-sm font-semibold bg-white text-slate-950 hover:bg-white/90 transition"
                  to="/register"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
