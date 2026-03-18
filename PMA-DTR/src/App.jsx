import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavLinks from "./components/Sidebar.jsx";
import HomePage from "./pages/Home";
import DTRPage from "./pages/DTRPage";
import MaintenancePage from "./pages/Maintenance";
import LogsPage from "./pages/Logs";
import SignatoriesPage from "./pages/Signatories";
import AccountsPage from "./pages/Accounts";

function App() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Router>
      <div className="flex min-h-screen">
        
        {/* Sidebar */}
        <aside className={`bg-blue-900 text-white p-4 transition-all duration-300 ${isOpen ? "w-64" : "w-20"}`}>
          <NavLinks open={isOpen} setIsOpen={setIsOpen} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-100">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dtr" element={<DTRPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/signatories" element={<SignatoriesPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;