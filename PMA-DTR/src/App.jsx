import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SidebarLayout from "./components/Sidebar.jsx";

import HomePage from "./pages/Home";
import DTRPage from "./pages/DTRPage";
import MaintenancePage from "./pages/Maintenance";
import LogsPage from "./pages/Logs";
import SignatoriesPage from "./pages/Signatories";
import AccountsPage from "./pages/Accounts";

function App() {
  return (
    <Router>
      <SidebarLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dtr" element={<DTRPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/signatories" element={<SignatoriesPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
        </Routes>
      </SidebarLayout>
    </Router>
  );
}

export default App;