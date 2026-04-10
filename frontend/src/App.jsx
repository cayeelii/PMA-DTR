import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SidebarLayout from "./components/Sidebar.jsx";

import LoginPage from "./pages/Login"; 
import HomePage from "./pages/Home";
import DTRPage from "./pages/DTRManagement.jsx";
import MaintenancePage from "./pages/Maintenance";
import LogsPage from "./pages/Logs";
import SignatoriesPage from "./pages/Signatories";
import AccountsPage from "./pages/Accounts";
import ChangePasswordPage from "./pages/ChangePassword.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

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
                <Route path="/change-password" element={<ChangePasswordPage />} />
                
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