import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Home,
  FileText,
  ClipboardList,
  UserCircle,
  LogOut,
  MoreVertical,
} from "lucide-react";

import { formatRoleLabel } from "../utils/roles";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function EmployeeSidebar() {
  const [open] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const [username, setUsername] = useState("Guest");
  const [userRole, setUserRole] = useState("");

  const navigate = useNavigate();

  const baseClass = "flex items-center gap-4 px-3 py-2 rounded-lg transition";
  const activeClass = "text-[#FFDD00] bg-white/10";
  const inactiveClass = "text-white hover:bg-white/10";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/current-user`, {
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok && data.user) {
          setUsername(data.user.username);
          setUserRole(data.user.role);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      window.location.href = "/employee-login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
              {/* HOME */}
              <li>
                <NavLink
                  to="/employee/employee-home"
                  className={({ isActive }) =>
                    `${baseClass} ${isActive ? activeClass : inactiveClass}`
                  }
                >
                  <Home size={22} />
                  {open && <span className="text-lg">Home</span>}
                </NavLink>
              </li>

              {/* DTR */}
              <li>
                <NavLink
                  to="/employee/employee-dtr"
                  className={({ isActive }) =>
                    `${baseClass} ${isActive ? activeClass : inactiveClass}`
                  }
                >
                  <FileText size={22} />
                  {open && <span className="text-lg">DTR</span>}
                </NavLink>
              </li>

              {/* PROFILE */}
              <li>
                <NavLink
                  to="/employee/employee-profile"
                  className={({ isActive }) =>
                    `${baseClass} ${isActive ? activeClass : inactiveClass}`
                  }
                >
                  <UserCircle size={22} />
                  {open && <span className="text-lg">Profile</span>}
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
                    <span className="text-lg">{username}</span>
                    <div className="text-sm text-gray-300">
                      {formatRoleLabel(userRole)}
                    </div>
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

            {/* DROPDOWN */}
            {showDropdown && open && (
              <div className="absolute bottom-full right-0 mb-2 bg-white text-black rounded shadow-lg p-2 w-48">
                <button
                  className="block w-full text-left px-3 py-2 text-lg text-red-500 hover:bg-red-50 rounded"
                  onClick={() => {
                    handleLogout();
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
        <Outlet />
      </main>
    </div>
  );
}
