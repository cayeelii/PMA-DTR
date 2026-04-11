import Pagination from "../../components/Pagination";
const PAGE_SIZE = 20;
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import AdminAccounts from "./AdminAccounts";
import AddEmployeeModal from "../../components/AddEmployee";
import PendingEmployeesModal from "../../components/PendingEmployeesModal";
import { saveActivityLog } from "../../utils/activityLogs";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function EmployeeAccounts() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("admins");
  const [search, setSearch] = useState("");
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [approvedEmployees, setApprovedEmployees] = useState([]);
  const [employeeError, setEmployeeError] = useState("");
  const [actionUserId, setActionUserId] = useState(null);
  const [isPendingOpen, setIsPendingOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [departments, setDepartments] = useState([]);

  const fetchPendingEmployees = async () => {
    setEmployeeError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/pending`);
      const data = await response.json();

      if (!response.ok) {
        setEmployeeError(data.error || "Failed to load pending employees.");
        return;
      }

      setPendingEmployees(data);
    } catch {
      setEmployeeError("Unable to connect to server.");
    }
  };

  const fetchApprovedEmployees = async () => {
    setEmployeeError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/employees/approved`);
      const data = await response.json();

      if (!response.ok) {
        setEmployeeError(data.error || "Failed to load approved employees.");
        return;
      }

      setApprovedEmployees(data);
    } catch {
      setEmployeeError("Unable to connect to server.");
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/signatories/departments`);
      const data = await response.json();

      if (!response.ok) {
        console.error(data.error || "Failed to load departments.");
        return;
      }

      setDepartments(data);
    } catch (err) {
      console.error("Failed to load departments:", err);
    }
  };

  useEffect(() => {
    fetchPendingEmployees();
    fetchApprovedEmployees();
    fetchDepartments();
  }, []);

  const filteredApprovedEmployees = approvedEmployees.filter((employee) =>
    employee.username.toLowerCase().includes(search.toLowerCase()) ||
      String(employee.bio_id).toLowerCase().includes(search.toLowerCase()) ||
      employee.dept_name.toLowerCase().includes(search.toLowerCase()),
  );
  const handleApprove = async (employee) => {
    const userId = employee.user_id;
    setActionUserId(userId);
    setEmployeeError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/approve/${userId}`,
        {
          method: "PATCH",
        },
      );
      const data = await response.json();
      if (!response.ok) {
        setEmployeeError(data.error || "Failed to approve employee.");
        return;
      }
      setPendingEmployees((prev) =>
        prev.filter((employee) => employee.user_id !== userId),
      );
      setApprovedEmployees((prev) => [
        { ...employee, status: "approved" },
        ...prev,
      ]);
      try {
        // Activity Log for account approval.
        await saveActivityLog({
          action: "Approved Employee Account",
          details: `Approved employee account for ${employee.username} from ${employee.dept_name} (BIO ID: ${employee.bio_id}).`,
          targetBioId: employee.bio_id || null,
        });
      } catch (err) {
        console.error("Failed to save activity log:", err);
      }
    } catch {
      setEmployeeError("Unable to connect to server.");
    } finally {
      setActionUserId(null);
    }
  };

  const handleReject = async (employee) => {
    const userId = employee.user_id;
    setActionUserId(userId);
    setEmployeeError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/reject/${userId}`,
        {
          method: "PATCH",
        },
      );
      const data = await response.json();

      if (!response.ok) {
        setEmployeeError(data.error || "Failed to reject employee.");
        return;
      }

      setPendingEmployees((prev) =>
        prev.filter((employee) => employee.user_id !== userId),
      );
      try {
        // Activity Log for account rejection
        await saveActivityLog({
          action: "Rejected Employee Account",
          details: `Rejected employee account for ${employee.username} from ${employee.dept_name} (BIO ID: ${employee.bio_id}).`,
          targetBioId: employee.bio_id || null,
        });
      } catch (err) {
        console.error("Failed to save activity log:", err);
      }
    } catch {
      setEmployeeError("Unable to connect to server.");
    } finally {
      setActionUserId(null);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredApprovedEmployees.length / PAGE_SIZE);
  const paginatedApprovedEmployees = filteredApprovedEmployees.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [search, activeTab]);

  const openPendingModal = async () => {
    setIsPendingOpen(true);
    await fetchPendingEmployees();
  };

  const handleAddEmployee = async (newUser) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newUser.username,
          bio_id: newUser.bio_id,
          password: newUser.password,
          department: newUser.department,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add employee.");
      }

      await fetchPendingEmployees();
      setIsAddOpen(false);
      alert(data.message || "Employee added successfully.");
    } catch (err) {
      console.error(err);
      throw new Error(err.message || "Failed to add employee.");
    }
  };

  return (
    <div className="relative bg-surface w-full text-theme p-2 pt-2 overflow-y-hidden">
      <div className="p-1 md:p-5 md:mt-0">
        <div className="flex flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Accounts
          </h1>
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
            <div className="ml-10 md:ml-7">
              <div className="mt-8" />
              <div className="flex justify-between items-center mb-6 gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search Employee"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <button
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                    onClick={openPendingModal}
                  >
                    Pending ({pendingEmployees.length})
                  </button>
                  <button
                    className="bg-amber-400 hover:bg-amber-500 text-gray-900 px-5 py-1.5 rounded-lg font-medium shadow flex items-center gap-2"
                    onClick={() => setIsAddOpen(true)}
                  >
                    <span>Add User</span>
                  </button>
                </div>
              </div>
              {employeeError && (
                <p className="mb-4 text-sm text-red-600">{employeeError}</p>
              )}
              <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="text-center px-6 py-4 font-semibold">
                        BIO ID
                      </th>
                      <th className="text-center px-6 py-4 font-semibold">
                        Name
                      </th>
                      <th className="text-center px-6 py-4 font-semibold">
                        Department
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedApprovedEmployees.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          No approved employees found.
                        </td>
                      </tr>
                    ) : (
                      paginatedApprovedEmployees.map((employee, idx) => (
                        <tr
                          key={employee.user_id}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="text-center px-6 py-4 font-semibold">
                            {employee.bio_id}
                          </td>
                          <td className="text-center px-6 py-4">
                            {employee.username}
                          </td>
                          <td className="text-center px-6 py-4">
                            {employee.dept_name}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-center">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </div>
          )}
        </div>

        <PendingEmployeesModal
          isOpen={isPendingOpen}
          onClose={() => setIsPendingOpen(false)}
          employees={pendingEmployees}
          employeeError={employeeError}
          actionUserId={actionUserId}
          onApprove={handleApprove}
          onReject={handleReject}
        />

        <AddEmployeeModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onAddUser={handleAddEmployee}
          departmentOptions={departments.map((dept) => dept.dept_name)}
        />
      </div>
    </div>
  );
}

export default EmployeeAccounts;
