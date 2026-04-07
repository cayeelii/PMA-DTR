import Pagination from "../../components/Pagination";
import { useState, useEffect } from "react";
import { Search, Pencil, Archive } from "lucide-react";
import AddUserModal from "../../components/AddUser";
import EditAdminModal from "../../components/EditAdmin";
import ArchiveAdminModal from "../../components/ArchiveAdmin";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PAGE_SIZE = 20;

function AdminAccounts() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/admins`);
        const data = await res.json();

        const formatted = data.map((u) => ({
          timestamp: u.created_at.split("T")[0],
          user: u.username,
          role: u.role,
        }));

        setUsers(formatted);
      } catch (err) {
        console.error("Failed to fetch admins:", err);
      }
    };

    fetchAdmins();
  }, []);

  const filtered = users.filter((row) =>
    row.user.toLowerCase().includes(search.toLowerCase()),
  );

  //Fetch add admin
  const handleAddUser = async (newUser) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newUser.username,
          password: newUser.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      const refresh = await fetch(`${API_BASE_URL}/api/users/admins`);
      const refreshedData = await refresh.json();

      const formatted = refreshedData.map((u) => ({
        timestamp: u.created_at ? u.created_at.split("T")[0] : "-",
        user: u.username,
        role: u.role,
      }));

      setUsers(formatted);
      setPage(1);
    } catch (err) {
      console.error(err);
      alert("Failed to add admin");
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleArchive = (user) => {
    setSelectedUser(user);
    setIsArchiveOpen(true);
  };

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="relative bg-surface w-full text-theme p-2 pt-2 overflow-y-hidden">
      <div className="p-1 md:p-5 md:mt-0">
        <div className="flex flex-row md:items-center justify-between mb-6 gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search User"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <button
            className="bg-amber-400 hover:bg-amber-500 text-gray-900 px-5 py-1.5 rounded-lg font-medium shadow flex items-center gap-2"
            onClick={() => setIsAddOpen(true)}
          >
            <span>Add User</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200 mt-10">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-center px-6 py-4 font-semibold">
                  Timestamp Created
                </th>
                <th className="text-center px-6 py-4 font-semibold">User</th>
                <th className="text-center px-6 py-4 font-semibold">Role</th>
                <th className="text-center px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No results found.
                  </td>
                </tr>
              ) : (
                paginated.map((row, index) => (
                  <tr
                    key={index}
                    className={`border-t ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition`}
                  >
                    <td className="text-center px-6 py-4">{row.timestamp}</td>
                    <td className="text-center px-6 py-4">{row.user}</td>
                    <td className="text-center px-6 py-4">{row.role}</td>
                    <td className="text-center px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <button
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="Edit"
                          onClick={() => handleEdit(row)}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 transition"
                          title="Archive"
                          onClick={() => handleArchive(row)}
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

        {/* Pagination Controls */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

        <AddUserModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onAddUser={handleAddUser}
          roleOptions={["Admin"]}
        />

        <EditAdminModal
          isOpen={isEditOpen}
          user={selectedUser}
          onClose={() => setIsEditOpen(false)}
        />

        <ArchiveAdminModal
          isOpen={isArchiveOpen}
          user={selectedUser}
          onClose={() => setIsArchiveOpen(false)}
          onConfirm={() => {
            console.log("Archived", selectedUser);
            setIsArchiveOpen(false);
          }}
        />
      </div>
    </div>
  );
}

export default AdminAccounts;
