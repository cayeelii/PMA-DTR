import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import PublicRoute from "./routes/PublicRoute.jsx";
import { Loader } from "lucide-react";

// Layouts
import AdminLayout from "./layout/AdminSidebar.jsx";
import EmployeeLayout from "./layout/EmployeeSidebar.jsx";

// Admin Pages
import LoginPage from "./pages/admin/Login";
import HomePage from "./pages/admin/Home";
import DTRPage from "./pages/admin/dtr/DTRManagement.jsx";
import MaintenancePage from "./pages/admin/Maintenance";
import SchedulePage from "./pages/admin/Schedule";
import LogsPage from "./pages/admin/Logs";
import SignatoriesPage from "./pages/admin/Signatories";
import AccountsPage from "./pages/admin/Accounts";
import ChangePasswordPage from "./pages/admin/ChangePassword.jsx";

// Employee Pages
import EmployeeLoginPage from "./pages/employee/EmployeeLogin.jsx";
import EmployeeRegisterPage from "./pages/employee/EmployeeRegister.jsx";
import EmployeeHomePage from "./pages/employee/EmployeeHome.jsx";
import EmployeeProfilePage from "./pages/employee/EmployeeProfile.jsx";
import EmployeeChangePasswordPage from "./pages/employee/EmployeeChangePassword.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/auth/current-user`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3 text-gray-600">
          <Loader className="w-8 h-8 animate-spin text-[#0b246a]" />
          <span className="text-sm font-medium">Loading</span>
        </div>
      </div>
    );

  return (
    <Router>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* PUBLIC ROUTES */}
        <Route
          path="/login"
          element={
            <PublicRoute user={user}>
              <LoginPage setUser={setUser} />
            </PublicRoute>
          }
        />

        <Route
          path="/employee-login"
          element={
            <PublicRoute user={user}>
              <EmployeeLoginPage setUser={setUser} />
            </PublicRoute>
          }
        />

        <Route path="/register" element={<EmployeeRegisterPage />} />

        {/* EMPLOYEE ROUTES */}
        <Route
          path="/employee/*"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <EmployeeLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="home" />} />
          <Route path="home" element={<EmployeeHomePage />} />
          <Route path="profile" element={<EmployeeProfilePage />} />
          <Route
            path="employee-change-password"
            element={<EmployeeChangePasswordPage />}
          />
        </Route>

        {/* ADMIN ROUTES */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="home" />} />
          <Route path="home" element={<HomePage />} />
          <Route path="dtr" element={<DTRPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="signatories" element={<SignatoriesPage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
