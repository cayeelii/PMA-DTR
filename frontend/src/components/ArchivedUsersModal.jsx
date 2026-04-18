import { useEffect, useMemo, useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import Pagination from "./Pagination";
import { formatRoleLabel } from "../utils/roles";

const PAGE_SIZE = 10;

function ArchivedUsersModal({
  isOpen,
  onClose,
  users,
  error,
  actionUserId,
  onRestore,
  variant = "employee",
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setPage(1);
    }
  }, [isOpen]);

  const filteredUsers = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) return users;

    return users.filter((user) => {
      const fields =
        variant === "employee"
          ? [user.username, user.bio_id, user.dept_name]
          : [user.username, user.role];

      return fields
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(searchText),
        );
    });
  }, [users, search, variant]);

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  if (!isOpen) return null;

  const isEmployee = variant === "employee";
  const columnCount = isEmployee ? 4 : 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-5xl relative animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Archived</h2>
            <p className="text-sm text-gray-500">
              {isEmployee
                ? "Review and restore archived employee accounts."
                : "Review and restore archived admin accounts."}
            </p>
          </div>
          <button
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6 gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div className="bg-gray-100 text-gray-700 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap">
              {users.length} archived
            </div>
          </div>

          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200 max-h-[55vh] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  {isEmployee ? (
                    <>
                      <th className="text-center px-6 py-4 font-semibold">
                        BIO ID
                      </th>
                      <th className="text-center px-6 py-4 font-semibold">
                        Name
                      </th>
                      <th className="text-center px-6 py-4 font-semibold">
                        Department
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="text-center px-6 py-4 font-semibold">
                        Username
                      </th>
                      <th className="text-center px-6 py-4 font-semibold">
                        Role
                      </th>
                      <th className="text-center px-6 py-4 font-semibold">
                        Archived On
                      </th>
                    </>
                  )}
                  <th className="text-center px-6 py-4 font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columnCount}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      {isEmployee
                        ? "No archived employee accounts found."
                        : "No archived admin accounts found."}
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user, idx) => (
                    <tr
                      key={user.user_id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {isEmployee ? (
                        <>
                          <td className="text-center px-6 py-4 font-semibold">
                            {user.bio_id}
                          </td>
                          <td className="text-center px-6 py-4">
                            {user.username}
                          </td>
                          <td className="text-center px-6 py-4">
                            {user.dept_name || "-"}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="text-center px-6 py-4 font-semibold">
                            {user.username}
                          </td>
                          <td className="text-center px-6 py-4">
                            {formatRoleLabel(user.role)}
                          </td>
                          <td className="text-center px-6 py-4">
                            {user.created_at
                              ? user.created_at.split("T")[0]
                              : "-"}
                          </td>
                        </>
                      )}
                      <td className="text-center px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            className="flex items-center justify-center gap-1 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-150 text-sm disabled:opacity-50"
                            title="Restore"
                            onClick={() => onRestore(user)}
                            aria-label="Restore"
                            disabled={actionUserId === user.user_id}
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span className="hidden sm:inline">Restore</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArchivedUsersModal;
