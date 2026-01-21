import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ProtectedRoute({ children, requireRole }) {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="glass rounded-2xl shadow-soft px-6 py-4 text-slate-200">
          Loading...
        </div>
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;
  if (requireRole && user?.role !== requireRole) return <Navigate to="/chat" replace />;

  return children;
}
