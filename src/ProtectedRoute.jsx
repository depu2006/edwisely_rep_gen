import { Navigate } from "react-router-dom";
import { getCurrentUser } from "./auth";

export default function ProtectedRoute({ children, role }) {
  const user = getCurrentUser();

  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
}