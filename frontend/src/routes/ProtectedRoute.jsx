import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, user, loading }) => {
  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
