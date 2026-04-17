import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Search } from "lucide-react";
import Pagination from "../../components/Pagination";
import { fetchActivityLogs } from "../../utils/activityLogs";
import { isSuperAdmin } from "../../utils/roles";

const PAGE_SIZE = 10;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function LogsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    // Activity Logs role check (superadmin only).
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/current-user`, {
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok && data.user) {
          setUserRole(data.user.role);
        }
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      } finally {
        setIsCheckingRole(false);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    // Activity Logs fetch.
    const loadLogs = async () => {
      try {
        setError("");
        const data = await fetchActivityLogs();
        setLogs(data);
      } catch (err) {
        console.error("Failed to load activity logs:", err);
        setError("Failed to load activity logs.");
      }
    };

    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return logs;
    }

    return logs.filter((log) =>
      [
        log.created_at,
        log.username,
        log.action_performed,
        log.action_details,
        log.target_bio_id,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchText),
    );
  }, [logs, search]);

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);
  const paginatedLogs = filteredLogs.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  // Wait for the current user role before checking access.
  if (isCheckingRole) {
    return <div className="p-6 text-gray-600">Loading...</div>;
  }

  // Redirect users who are not superadmin.
  if (!isSuperAdmin(userRole)) {
    return <Navigate to="/admin/home" replace />;
  }

  return (
    <div className="relative bg-surface w-full text-theme p-2 pt-2 overflow-y-hidden">
      <div className="p-1 md:p-5 md:mt-0">
        {/* Page Header */}
        <div className="flex flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Activity Logs
          </h1>
        </div>

        {/* Search */}
        <div className="flex flex-row md:items-center justify-between gap-4 mb-4">
          <div className="relative w-full max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Search by user, action..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600">{error}</p>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left w-52  px-6 py-3 font-semibold">Timestamp</th>
                <th className="text-left w-24  pl-3 pr-4 py-3 font-semibold">User</th>
                <th className="text-left pl-3 pr-6 py-3 font-semibold">Action</th>
                <th className="text-left px-6 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No logs found.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log, index) => (
                  <tr
                    key={log.activity_id}
                    className={`border-t ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="w-52 px-6 py-4 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="w-24 pl-3 pr-4 py-4 whitespace-nowrap">
                      {log.username}
                    </td>
                    <td className="pl-3 pr-6 py-4">{log.action_performed}</td>
                    <td className="px-6 py-4">{log.action_details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}

export default LogsPage;