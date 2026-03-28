import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SidebarLayout from "./layout/AdminSidebar.jsx";

import LoginPage from "./pages/admin/Login"; 
import EmployeeLoginPage from "./pages/employee/EmployeeLogin.jsx";
import EmployeeRegisterPage from "./pages/employee/EmployeeRegister.jsx";
import EmployeeHomePage from "./pages/employee/EmployeeHome.jsx";
import HomePage from "./pages/admin/Home";
import DTRPage from "./pages/admin/DTRManagement.jsx";
import MaintenancePage from "./pages/admin/Maintenance";
import LogsPage from "./pages/admin/Logs";
import SignatoriesPage from "./pages/admin/Signatories";
import AccountsPage from "./pages/admin/Accounts";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/employee-login" element={<EmployeeLoginPage />} />
        <Route path="/employee-register" element={<EmployeeRegisterPage />} />
        <Route path="/employee-home" element={<EmployeeHomePage />} />

        <Route
          path="/*"
          element={
            <SidebarLayout>
              <Routes>
                <Route path="/home" element={<HomePage />} />
                <Route path="/dtr" element={<DTRPage />} />
                <Route path="/maintenance" element={<MaintenancePage />} />
                <Route path="/logs" element={<LogsPage />} />
                <Route path="/signatories" element={<SignatoriesPage />} />
                <Route path="/accounts" element={<AccountsPage />} />
                
                <Route path="/" element={<Navigate to="/home" />} />
              </Routes>
            </SidebarLayout>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;