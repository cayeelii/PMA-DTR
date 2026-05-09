import Pagination from "../../components/Pagination";
import { useEffect, useState } from "react";
import { Search, Archive } from "lucide-react";
import AddSupervisorModal from "../../components/AddSupervisor";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PAGE_SIZE = 20;

function SupervisorAccounts() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [supervisors, setSupervisors] = useState([]);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState([]);
  const [isAddSupervisorOpen, setIsAddSupervisorOpen] = useState(false);

  //Fetch supervisors
  const fetchSupervisors = async () => {
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/supervisors`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load supervisors.");
        return;
      }

      setSupervisors(data);
    } catch {
      setError("Unable to connect to server.");
    }
  };

  useEffect(() => {
    fetchSupervisors();
  }, []);

  //Fetch add supervisor
  const handleAddSupervisor = async (newUser) => {
    const response = await fetch(`${API_BASE_URL}/api/users/add-supervisor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(newUser),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to add supervisor");
    }

    fetchSupervisors();
    return data;
  };

  //Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/signatories/departments`,
      );
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
    fetchDepartments();
  }, []);

  const filteredSupervisors = supervisors.filter((supervisor) =>
    supervisor.username.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredSupervisors.length / PAGE_SIZE);

  const paginatedSupervisors = filteredSupervisors.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="ml-10 md:ml-7">
      <div className="mt-8" />
      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

          <input
            type="text"
            placeholder="Search Supervisor"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <button
          className="bg-amber-400 hover:bg-amber-500 text-gray-900 px-5 py-1.5 rounded-lg font-medium shadow flex items-center gap-2"
          onClick={() => setIsAddSupervisorOpen(true)}
        >
          <span>Add User</span>
        </button>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-center px-6 py-4 font-semibold">BIO ID</th>
              <th className="text-center px-6 py-4 font-semibold">Name</th>
              <th className="text-center px-6 py-4 font-semibold">
                Department
              </th>
              <th className="text-center px-6 py-4 font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedSupervisors.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No supervisors found.
                </td>
              </tr>
            ) : (
              paginatedSupervisors.map((supervisor, idx) => (
                <tr
                  key={supervisor.user_id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="text-center px-6 py-4 font-semibold">
                    {supervisor.bio_id}
                  </td>

                  <td className="text-center px-6 py-4">
                    {supervisor.username}
                  </td>

                  <td className="text-center px-6 py-4">
                    {supervisor.dept_name}
                  </td>

                  <td className="text-center px-6 py-4">
                    <div className="flex justify-center">
                      <button
                        className="text-red-600 hover:text-red-800 transition"
                        title="Archive"
                        onClick={() => handleArchive(supervisor)}
                      >
                        <Archive size={18} />
                      </button>
                    </div>
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
        <AddSupervisorModal
          isOpen={isAddSupervisorOpen}
          onClose={() => setIsAddSupervisorOpen(false)}
          onAddUser={handleAddSupervisor}
          departmentOptions={departments.map((dept) => dept.dept_name)}
        />
      </div>
    </div>
  );
}

export default SupervisorAccounts;
