import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Layouts
import AdminLayout from "./layout/AdminSidebar.jsx";
import EmployeeLayout from "./layout/EmployeeSidebar.jsx";

// Admin Pages
import LoginPage from "./pages/admin/Login";
import HomePage from "./pages/admin/Home";
import DTRPage from "./pages/admin/dtr/DTRManagement.jsx";
import MaintenancePage from "./pages/admin/Maintenance";
import LogsPage from "./pages/admin/Logs";
import SignatoriesPage from "./pages/admin/Signatories";
import AccountsPage from "./pages/admin/Accounts";
import ChangePasswordPage from "./pages/admin/ChangePassword.jsx";

// Employee Pages
import EmployeeLoginPage from "./pages/employee/EmployeeLogin.jsx";
import EmployeeRegisterPage from "./pages/employee/EmployeeRegister.jsx";
import EmployeeHomePage from "./pages/employee/EmployeeHome.jsx";
import EmployeeProfilePage from "./pages/employee/EmployeeProfile.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/employee-login" element={<EmployeeLoginPage />} />
        <Route path="/employee-register" element={<EmployeeRegisterPage />} />

        {/* Employee App */}
        <Route path="/employee/*" element={<EmployeeLayout />}>
          <Route index element={<Navigate to="/employee/home" />} />
          <Route path="home" element={<EmployeeHomePage />} />
          <Route path="employee-profile" element={<EmployeeProfilePage />} />
        </Route>

        {/* Admin App */}
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/home" />} />
          <Route path="home" element={<HomePage />} />
          <Route path="dtr" element={<DTRPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="signatories" element={<SignatoriesPage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
