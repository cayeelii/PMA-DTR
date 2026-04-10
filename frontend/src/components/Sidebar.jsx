import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  FileText,
  Settings,
  ClipboardList,
  PenLine,
  Users,
  UserCircle,
  MoreVertical, 
} from "lucide-react";

const SidebarLayout = ({ children }) => {
  const [open] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false); 
  const navigate = useNavigate(); 

  const baseClass =
    "flex items-center gap-4 px-3 py-2 rounded-lg transition";
  const activeClass = "text-[#FFDD00] bg-white/10";
  const inactiveClass = "text-white hover:bg-white/10";

  return (
<div className="flex h-screen overflow-hidden">
      {/* SIDEBAR */}
      <aside
        className={`bg-[#0F1E4D] text-white transition-all duration-300 ${
          open ? "w-64" : "w-20"
        }`}
      >
        <div className="flex flex-col h-full p-4">
          {/* LOGO */}
          <div className="flex justify-center items-center py-6">
            <img
              src="/pmalogo.png"
              alt="Logo"
              className={`${open ? "w-24" : "w-12"} transition-all`}
            />
          </div>

          {/* NAV LINKS */}
          <nav className="flex-1 px-2">
            <ul className="space-y-2">
              <li>
                <NavLink
                  to="/home"
                  className={({ isActive }) =>
                    `${baseClass} ${
                      isActive ? activeClass : inactiveClass
                    }`
                  }
                >
                  <Home size={22} />
                  {open && <span className="text-lg">Home</span>}
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/dtr"
                  className={({ isActive }) =>
                    `${baseClass} ${
                      isActive ? activeClass : inactiveClass
                    }`
                  }
                >
                  <FileText size={22} />
                  {open && <span className="text-lg">DTR</span>}
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/maintenance"
                  className={({ isActive }) =>
                    `${baseClass} ${
                      isActive ? activeClass : inactiveClass
                    }`
                  }
                >
                  <Settings size={22} />
                  {open && <span className="text-lg">Maintenance</span>}
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/logs"
                  className={({ isActive }) =>
                    `${baseClass} ${
                      isActive ? activeClass : inactiveClass
                    }`
                  }
                >
                  <ClipboardList size={22} />
                  {open && <span className="text-lg">Logs</span>}
                </NavLink>
              </li>

              <hr className="border-white/20 my-4" />

              <li>
                <NavLink
                  to="/signatories"
                  className={({ isActive }) =>
                    `${baseClass} ${
                      isActive ? activeClass : inactiveClass
                    }`
                  }
                >
                  <PenLine size={22} />
                  {open && <span className="text-lg">Signatories</span>}
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/accounts"
                  className={({ isActive }) =>
                    `${baseClass} ${
                      isActive ? activeClass : inactiveClass
                    }`
                  }
                >
                  <Users size={22} />
                  {open && <span className="text-lg">Accounts</span>}
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* USER SECTION */}
          <div className="mt-auto border-t border-white/10 pt-4 px-3 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserCircle size={28} />
                {open && (
                  <div>
                    <span className="text-lg">Juan</span>
                    <div className="text-sm text-gray-300">admin</div>
                  </div>
                )}
              </div>
              {open && (
                <button
                  className="p-1 rounded hover:bg-white/10 hover:text-gray-300 transition"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <MoreVertical size={20} />
                </button>
              )}
            </div>

            {/* Dropdown Menu */}
            {showDropdown && open && (
              <div className="absolute bottom-full right-0 mb-2 bg-white text-black rounded shadow-lg p-2 w-48">
                <button
                  className="block w-full text-left px-3 py-2 text-lg hover:bg-gray-100 rounded"
                  onClick={() => {
                    navigate("/change-password");
                    setShowDropdown(false);
                  }}
                >
                  Change Password
                </button>
                <button
                  className="block w-full text-left px-3 py-2 text-lg text-red-500 hover:bg-red-50 rounded"
                  onClick={() => {
                    console.log("Logout clicked");
                    setShowDropdown(false);
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 bg-[#ECEEF3] p-8">
        {children}
      </main>
    </div>
  );
};

export default SidebarLayout;