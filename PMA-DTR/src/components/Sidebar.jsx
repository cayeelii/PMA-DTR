import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  FileText,
  Settings,
  ClipboardList,
  PenLine,
  Users,
  UserCircle,
  LogOut,
} from "lucide-react";

const SidebarLayout = ({ children }) => {
  const [open] = useState(true); // you can add toggle later

  const baseClass =
    "flex items-center gap-4 px-3 py-2 rounded-lg transition";
  const activeClass = "text-[#FFDD00] bg-white/10";
  const inactiveClass = "text-white hover:bg-white/10";

  return (
    <div className="flex min-h-screen">
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
              src="/pma-logo.png"
              alt="Logo"
              className={`${open ? "w-24" : "w-12"} transition-all`}
            />
          </div>

          {/* NAV LINKS */}
          <nav className="flex-1 px-2">
            <ul className="space-y-3">
              <li>
                <NavLink
                  to="/"
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
          <div className="mt-auto border-t border-white/10 pt-4 flex items-center justify-between px-3">
            <div className="flex items-center gap-3">
              <UserCircle size={28} />
              {open && <span className="text-lg">Juan</span>}
            </div>

            {open && (
              <button className="hover:text-red-400 transition">
                <LogOut size={20} />
              </button>
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