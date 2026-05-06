import { Navigate } from "react-router-dom";

const PublicRoute = ({ children, user }) => {
  if (user) {
    if (user.role === "admin" || user.role === "superadmin") {
      return <Navigate to="/admin/home" replace />;
    } else if (user.role === "employee") {
      return <Navigate to="/employee/home" replace />;
    }
  }

  return children;
};

export default PublicRoute;
