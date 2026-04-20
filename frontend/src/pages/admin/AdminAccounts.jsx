import Pagination from "../../components/Pagination";
import { useState, useEffect } from "react";
import { Search, Pencil, Archive } from "lucide-react";
import AddAdminModal from "../../components/AddAdmin";
import EditAdminModal from "../../components/EditAdmin";
import ArchiveAdminModal from "../../components/ArchiveAdmin";
import ArchivedUsersModal from "../../components/ArchivedUsersModal";
import { saveActivityLog } from "../../utils/activityLogs";
import { formatRoleLabel, isSuperAdmin } from "../../utils/roles";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PAGE_SIZE = 20;

function AdminAccounts() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isArchivedListOpen, setIsArchivedListOpen] = useState(false);
  const [archivedAdmins, setArchivedAdmins] = useState([]);
  const [archiveListError, setArchiveListError] = useState("");
  const [actionUserId, setActionUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  const fetchArchivedAdmins = async () => {
    setArchiveListError("");

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/users/archived?role=admin`,
        { credentials: "include" },
      );
      const data = await res.json();

      if (!res.ok) {
        setArchiveListError(data.error || "Failed to load archived admins.");
        return;
      }

      setArchivedAdmins(data);
    } catch (err) {
      console.error("Failed to fetch archived admins:", err);
      setArchiveListError("Unable to connect to server.");
    }
  };

  useEffect(() => {
    // Load the current session role for add-user permissions.
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/current-user`, {
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok && data.user) {
          setUserRole(data.user.role);
          setCurrentUserId(data.user.user_id);

          // Only super admins can view/restore archived admin accounts.
          if (isSuperAdmin(data.user.role)) {
            await fetchArchivedAdmins();
          }
        }
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    };

    // Load only the admin list allowed for the current role.
    const fetchAdmins = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/admins`, {
          credentials: "include",
        });
        const data = await res.json();

        const formatted = data.map((u) => ({
          user_id: u.user_id,
          timestamp: u.created_at.split("T")[0],
          user: u.username,
          role: u.role,
        }));

        setUsers(formatted);
      } catch (err) {
        console.error("Failed to fetch admins:", err);
      }
    };

    fetchCurrentUser();
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
        credentials: "include",
        body: JSON.stringify({
          username: newUser.username,
          password: newUser.password,
          role: newUser.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      const refresh = await fetch(`${API_BASE_URL}/api/users/admins`, {
        credentials: "include",
      });
      const refreshedData = await refresh.json();

      const formatted = refreshedData.map((u) => ({
        user_id: u.user_id,
        timestamp: u.created_at ? u.created_at.split("T")[0] : "-",
        user: u.username,
        role: u.role,
      }));

      setUsers(formatted);
      setPage(1);
      try {
        const createdRole =
          newUser.role === "superadmin" ? "Super Admin" : "Admin";
        await saveActivityLog({
          action: "Created User",
          details: `Created ${createdRole} user "${newUser.username}".`,
        });
      } catch (err) {
        console.error("Failed to save activity log:", err);
      }
    } catch (err) {
      console.error(err);
      throw new Error(err.message || "Failed to add user");
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

  // Archive the admin: call API, update lists, log the action, close modal.
  const handleArchiveAdmin = async (user) => {
    if (!user) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/users/archive/${user.user_id}`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to archive user.");
        return;
      }

      // Remove from active list.
      setUsers((prev) => prev.filter((u) => u.user_id !== user.user_id));

      if (isSuperAdmin(userRole)) {
        await fetchArchivedAdmins();
      }

      try {
        await saveActivityLog({
          action: "Archived User",
          details: `Archived ${formatRoleLabel(user.role)} user "${user.user}".`,
        });
      } catch (logErr) {
        console.error("Failed to save activity log:", logErr);
      }
    } catch (err) {
      console.error(err);
      alert("Unable to connect to server.");
    } finally {
      setIsArchiveOpen(false);
    }
  };

  const handleRestoreAdmin = async (user) => {
    if (!user) return;

    setActionUserId(user.user_id);
    setArchiveListError("");

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/users/restore/${user.user_id}`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      const data = await res.json();

      if (!res.ok) {
        setArchiveListError(data.error || "Failed to restore user.");
        return;
      }

      setArchivedAdmins((prev) =>
        prev.filter((u) => u.user_id !== user.user_id),
      );

      setUsers((prev) => [
        {
          user_id: user.user_id,
          timestamp: user.created_at ? user.created_at.split("T")[0] : "-",
          user: user.username,
          role: user.role,
        },
        ...prev,
      ]);

      try {
        await saveActivityLog({
          action: "Restored User",
          details: `Restored ${formatRoleLabel(user.role)} user "${user.username}".`,
        });
      } catch (logErr) {
        console.error("Failed to save activity log:", logErr);
      }
    } catch (err) {
      console.error(err);
      setArchiveListError("Unable to connect to server.");
    } finally {
      setActionUserId(null);
    }
  };

  const openArchivedListModal = async () => {
    setIsArchivedListOpen(true);
    await fetchArchivedAdmins();
  };

  // Super admins can create both admin types. Admins can only create admins.
  const roleOptions = isSuperAdmin(userRole)
    ? ["Admin", "Super Admin"]
    : ["Admin"];
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

          <div className="flex items-center gap-4">
            {isSuperAdmin(userRole) && (
              <button
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                onClick={openArchivedListModal}
              >
                Archived ({archivedAdmins.length})
              </button>
            )}
            <button
              className="bg-amber-400 hover:bg-amber-500 text-gray-900 px-5 py-1.5 rounded-lg font-medium shadow flex items-center gap-2"
              onClick={() => setIsAddOpen(true)}
            >
              <span>Add User</span>
            </button>
          </div>
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
                paginated.map((row, index) => {
                  // Only super admins can archive accounts, and never their own.
                  const canArchiveUser =
                    isSuperAdmin(userRole) &&
                    currentUserId !== null &&
                    row.user_id !== currentUserId;

                  return (
                  <tr
                    key={row.user_id}
                    className={`border-t ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition`}
                  >
                    <td className="text-center px-6 py-4">{row.timestamp}</td>
                    <td className="text-center px-6 py-4">{row.user}</td>
                    <td className="text-center px-6 py-4">
                      {formatRoleLabel(row.role)}
                    </td>
                    <td className="text-center px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <button
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="Edit"
                          onClick={() => handleEdit(row)}
                        >
                          <Pencil size={18} />
                        </button>
                        {canArchiveUser && (
                          <button
                            className="text-red-600 hover:text-red-800 transition"
                            title="Archive"
                            onClick={() => handleArchive(row)}
                          >
                            <Archive size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })
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

        <AddAdminModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onAddUser={handleAddUser}
          roleOptions={roleOptions}
        />

        <EditAdminModal
          isOpen={isEditOpen}
          user={selectedUser}
          onClose={() => setIsEditOpen(false)}
          onSave={() => setIsEditOpen(false)}
        />

        <ArchiveAdminModal
          isOpen={isArchiveOpen}
          user={selectedUser}
          onClose={() => setIsArchiveOpen(false)}
          onConfirm={handleArchiveAdmin}
        />

        {isSuperAdmin(userRole) && (
          <ArchivedUsersModal
            isOpen={isArchivedListOpen}
            onClose={() => setIsArchivedListOpen(false)}
            users={archivedAdmins}
            error={archiveListError}
            actionUserId={actionUserId}
            onRestore={handleRestoreAdmin}
            variant="admin"
          />
        )}
      </div>
    </div>
  );
}

export default AdminAccounts;
