import { NavLink } from "react-router-dom";
import { Home, FileText, Settings, ClipboardList, PenLine, Users } from "lucide-react";

const NavLinks = ({ open, setIsOpen }) => (
  <ul className="space-y-3 mt-6">

    {/* Home */}
    <li>
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex items-center gap-4 p-2 rounded-md transition ${
            isActive
              ? "bg-blue-800 text-yellow-400"
              : "text-gray-300 hover:bg-blue-700 hover:text-white"
          }`
        }
      >
        <Home size={20} />
        {open && <span>Home</span>}
      </NavLink>
    </li>

    {/* DTR */}
    <li>
      <NavLink to="/dtr" className={({ isActive }) =>
        `flex items-center gap-4 p-2 rounded-md transition ${
          isActive ? "bg-blue-800 text-yellow-400" : "text-gray-300 hover:bg-blue-700 hover:text-white"
        }`
      }>
        <FileText size={20} />
        {open && <span>DTR</span>}
      </NavLink>
    </li>

    {/* Maintenance */}
    <li>
      <NavLink to="/maintenance" className={({ isActive }) =>
        `flex items-center gap-4 p-2 rounded-md transition ${
          isActive ? "bg-blue-800 text-yellow-400" : "text-gray-300 hover:bg-blue-700 hover:text-white"
        }`
      }>
        <Settings size={20} />
        {open && <span>Maintenance</span>}
      </NavLink>
    </li>

    {/* Logs */}
    <li>
      <NavLink to="/logs" className={({ isActive }) =>
        `flex items-center gap-4 p-2 rounded-md transition ${
          isActive ? "bg-blue-800 text-yellow-400" : "text-gray-300 hover:bg-blue-700 hover:text-white"
        }`
      }>
        <ClipboardList size={20} />
        {open && <span>Logs</span>}
      </NavLink>
    </li>

    <hr className="border-gray-700 my-3" />

    {/* Signatories */}
    <li>
      <NavLink to="/signatories" className={({ isActive }) =>
        `flex items-center gap-4 p-2 rounded-md transition ${
          isActive ? "bg-blue-800 text-yellow-400" : "text-gray-300 hover:bg-blue-700 hover:text-white"
        }`
      }>
        <PenLine size={20} />
        {open && <span>Signatories</span>}
      </NavLink>
    </li>

    {/* Accounts */}
    <li>
      <NavLink to="/accounts" className={({ isActive }) =>
        `flex items-center gap-4 p-2 rounded-md transition ${
          isActive ? "bg-blue-800 text-yellow-400" : "text-gray-300 hover:bg-blue-700 hover:text-white"
        }`
      }>
        <Users size={20} />
        {open && <span>Accounts</span>}
      </NavLink>
    </li>

  </ul>
);

export default NavLinks;