import { useState } from "react";
import { Search, Check, X } from "lucide-react";
import AdminAccounts from "./AdminAccounts";
import AddUserModal from "../../components/AddUser";

const initialEmployees = [
  { bioId: "OMA1101", name: "Juan", department: "OMA1" },
  { bioId: "OMA1102", name: "Jake", department: "OMA1" },
  { bioId: "OMA1103", name: "Justine", department: "OMA1" },
  { bioId: "OMA1104", name: "Jacob", department: "OMA1" },
  { bioId: "OMA1105", name: "Jasper", department: "OMA1" },
];

const admins = [
  { bioId: "ADM1001", name: "Admin1", department: "IT" },
  { bioId: "ADM1002", name: "Admin2", department: "HR" },
];

function EmployeeAccounts() {
  const [activeTab, setActiveTab] = useState("admins");
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState(initialEmployees);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const data = activeTab === "admins" ? admins : employees;
  const filtered = data.filter((row) =>
    row.name.toLowerCase().includes(search.toLowerCase()) ||
    row.bioId.toLowerCase().includes(search.toLowerCase()) ||
    row.department.toLowerCase().includes(search.toLowerCase())
  );

  // Approve/Reject handlers
  const handleApprove = (bioId) => {
    setEmployees((prev) => prev.filter((emp) => emp.bioId !== bioId));
  };
  const handleReject = (bioId) => {
    setEmployees((prev) => prev.filter((emp) => emp.bioId !== bioId));
  };

  const handleAddUser = (newEmployee) => {
    setEmployees((prev) => [...prev, newEmployee]);
  };

  return (
    <div className="relative bg-surface w-full text-theme p-2 pt-2 overflow-y-hidden">
      <div className="p-1 md:p-5 md:mt-0">
        <div className="flex flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Accounts</h1>
        </div>
        <div className="flex gap-8 border-b border-gray-200 mb-4 relative">
          {["admins", "employees"].map((tab) => (
            <button
              key={tab}
              className={`relative pb-2 px-1 font-medium transition-colors duration-200 cursor-pointer focus:outline-none
                ${activeTab === tab ? "text-blue-600" : "text-gray-500 hover:text-blue-600"}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span
                className={`absolute left-0 -bottom-0.5 w-full h-0.5 rounded bg-blue-600 transition-all duration-300
                  ${activeTab === tab ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`}
                style={{ transformOrigin: "left" }}
              />
            </button>
          ))}
        </div>
        <div className="min-h-[500px] transition-all duration-300">
          {activeTab === "admins" ? (
            <AdminAccounts />
          ) : (
            <div className="mx-6">
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search User"
                    value={search}
                    onChange={e => {
                      setSearch(e.target.value);
                    }}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div
                  className="px-5 py-1.5 rounded-lg font-medium flex items-center gap-2 invisible select-none"
                  style={{ width: 140, height: 70 }}
                >
                  <span>Add User</span>
                </div>
              </div>
              <AddUserModal open={isModalOpen} setOpen={setIsModalOpen} onAddUser={handleAddUser} />
              <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="text-center px-6 py-4 font-semibold">BIO ID</th>
                      <th className="text-center px-6 py-4 font-semibold">Name</th>
                      <th className="text-center px-6 py-4 font-semibold">Department</th>
                      <th className="text-center px-6 py-4 font-semibold">Approve/Reject</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No results found.</td>
                      </tr>
                    ) : (
                      filtered.map((row, idx) => (
                        <tr key={row.bioId} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="text-center px-6 py-4 font-semibold">{row.bioId}</td>
                          <td className="text-center px-6 py-4">{row.name}</td>
                          <td className="text-center px-6 py-4">{row.department}</td>
                          <td className="text-center px-6 py-4">
                            <div className="flex justify-center gap-3">
                              <button
                                className="flex items-center justify-center gap-1 px-2.5 py-1 rounded-full bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-150 text-sm"
                                title="Approve"
                                onClick={() => handleApprove(row.bioId)}
                                aria-label="Approve"
                              >
                                <Check className="w-5 h-5" />
                                <span className="hidden sm:inline">Approve</span>
                              </button>
                              <button
                                className="flex items-center justify-center gap-1 px-2.5 py-1 rounded-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200 transition-all duration-150 text-sm"
                                title="Reject"
                                onClick={() => handleReject(row.bioId)}
                                aria-label="Reject"
                              >
                                <X className="w-5 h-5" />
                                <span className="hidden sm:inline">Reject</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeAccounts;
