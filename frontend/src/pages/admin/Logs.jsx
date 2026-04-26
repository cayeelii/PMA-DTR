import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { Search, ChevronDown, ChevronRight, X } from "lucide-react";
import Pagination from "../../components/Pagination";
import {
  fetchActivityLogs,
  fetchActivityLogFilters,
} from "../../utils/activityLogs";
import { isSuperAdmin } from "../../utils/roles";

const PAGE_SIZE = 10;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DEFAULT_FILTERS = {
  search: "",
  action: "",
  userId: "",
  from: "",
  to: "",
};

// Parse structured action_details
function parseStructuredDetails(actionDetails) {
  if (!actionDetails || typeof actionDetails !== "string") return null;
  const trimmed = actionDetails.trim();
  if (!trimmed.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && Array.isArray(parsed.changes)) return parsed;
    return null;
  } catch {
    return null;
  }
}

// Formats Date to "hh:mm AM/PM"; "—" if empty.
function formatTimeAmPm(value) {
  if (!value) return "—";
  const str = String(value);
  const match = str.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return str;
  let hour = parseInt(match[1], 10);
  const minute = match[2];
  if (Number.isNaN(hour)) return str;
  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${String(hour).padStart(2, "0")}:${minute} ${suffix}`;
}

function DtrChangesPanel({ payload }) {
  const { changes = [] } = payload || {};
  return (
    <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-left px-3 py-2 font-semibold">Employee</th>
            <th className="text-left px-3 py-2 font-semibold">Date</th>
            <th className="text-left px-3 py-2 font-semibold">Field</th>
            <th className="text-left px-3 py-2 font-semibold">Old</th>
            <th className="text-left px-3 py-2 font-semibold">New</th>
          </tr>
        </thead>
        <tbody>
          {changes.map((change, idx) => (
            <tr key={idx} className="border-t border-gray-100">
              <td className="px-3 py-2 whitespace-nowrap">
                {change.name || "—"}
                <span className="ml-1 text-gray-400">
                  ({change.bio_id})
                </span>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">{change.date}</td>
              <td className="px-3 py-2 whitespace-nowrap font-mono text-[11px]">
                {change.field}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-red-600">
                {formatTimeAmPm(change.old_time)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-green-700 font-semibold">
                {formatTimeAmPm(change.new_time)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LogDetailsCell({ actionDetails }) {
  const [open, setOpen] = useState(false);
  const structured = parseStructuredDetails(actionDetails);

  if (!structured) {
    return <span>{actionDetails}</span>;
  }

  return (
    <div>
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-0.5 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          {open ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          {open ? "Hide changes" : "View changes"}
          <span className="text-gray-400 font-normal">
            ({structured.changes.length})
          </span>
        </button>
        <span className="text-gray-700">{structured.summary}</span>
      </div>
      {open && <DtrChangesPanel payload={structured} />}
    </div>
  );
}

function LogsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [debouncedFilters, setDebouncedFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(PAGE_SIZE);

  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [availableActions, setAvailableActions] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);

  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  const abortRef = useRef(null);

  // Activity Logs role check (superadmin only).
  useEffect(() => {
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

  // Load dropdown options
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const data = await fetchActivityLogFilters();
        setAvailableActions(data.actions || []);
        setAvailableUsers(data.users || []);
      } catch (err) {
        console.error("Failed to load filter options:", err);
      }
    };
    loadFilters();
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);
    return () => clearTimeout(handle);
  }, [filters]);

  useEffect(() => {
    setPage(1);
  }, [debouncedFilters]);

  // Fetch logs on page
  useEffect(() => {
    const controller = new AbortController();
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = controller;

    const loadLogs = async () => {
      try {
        setIsLoading(true);
        setError("");
        const data = await fetchActivityLogs(
          { ...debouncedFilters, page, pageSize },
          { signal: controller.signal },
        );
        setLogs(data.items || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Failed to load activity logs:", err);
        setError("Failed to load activity logs.");
        setLogs([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();

    return () => controller.abort();
  }, [page, pageSize, debouncedFilters]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const hasActiveFilters = useMemo(
    () =>
      Object.entries(filters).some(
        ([, v]) => String(v || "").trim().length > 0,
      ),
    [filters],
  );

  // Wait for the current user role before checking access.
  if (isCheckingRole) {
    return <div className="p-6 text-gray-600">Loading...</div>;
  }

  // Redirect users who are not superadmin.
  if (!isSuperAdmin(userRole)) {
    return <Navigate to="/admin/home" replace />;
  }

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  return (
    <div className="relative min-h-0 w-full bg-surface p-2 pt-2 text-theme">
      <div className="p-1 md:p-5 md:mt-0">
        {/* Page Header */}
        <div className="flex flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Activity Logs
          </h1>
          <div className="text-xs text-gray-500">
            {isLoading
              ? "Loading..."
              : total === 0
                ? "No results"
                : `Showing ${rangeStart}–${rangeEnd} of ${total.toLocaleString()}`}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
          <div className="flex flex-wrap items-end gap-3">
            {/* Search */}
            <div className="flex flex-col min-w-[220px] flex-1">
              <label className="text-[11px] font-semibold text-gray-500 mb-1">
                Search
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search user, action, details..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  className="pl-9 pr-3 py-2 w-full text-sm border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
            </div>

            {/* Action */}
            <div className="flex flex-col min-w-[160px]">
              <label className="text-[11px] font-semibold text-gray-500 mb-1">
                Action
              </label>
              <select
                value={filters.action}
                onChange={(e) => updateFilter("action", e.target.value)}
                className="py-2 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
              >
                <option value="">All actions</option>
                {availableActions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* User */}
            <div className="flex flex-col min-w-[160px]">
              <label className="text-[11px] font-semibold text-gray-500 mb-1">
                User
              </label>
              <select
                value={filters.userId}
                onChange={(e) => updateFilter("userId", e.target.value)}
                className="py-2 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
              >
                <option value="">All users</option>
                {availableUsers.map((u) => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.username}
                  </option>
                ))}
              </select>
            </div>

            {/* Date range (From / To side-by-side) */}
            <div className="flex items-end gap-2">
              <div className="flex flex-col">
                <label
                  htmlFor="logs-from-date"
                  className="text-[11px] font-semibold text-gray-500 mb-1"
                >
                  From
                </label>
                <input
                  id="logs-from-date"
                  type="date"
                  value={filters.from}
                  max={filters.to || undefined}
                  onChange={(e) => updateFilter("from", e.target.value)}
                  className="py-2 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="logs-to-date"
                  className="text-[11px] font-semibold text-gray-500 mb-1"
                >
                  To
                </label>
                <input
                  id="logs-to-date"
                  type="date"
                  value={filters.to}
                  min={filters.from || undefined}
                  onChange={(e) => updateFilter("to", e.target.value)}
                  className="py-2 px-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
              >
                <X className="w-3.5 h-3.5" />
                Clear filters
              </button>
            </div>
          )}
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-left w-52 px-6 py-3 font-semibold">
                  Timestamp
                </th>
                <th className="text-left w-24 pl-3 pr-4 py-3 font-semibold">
                  User
                </th>
                <th className="text-left pl-3 pr-6 py-3 font-semibold">
                  Action
                </th>
                <th className="text-left px-6 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    {isLoading ? "Loading..." : "No logs found."}
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
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
                    <td className="px-6 py-4">
                      <LogDetailsCell actionDetails={log.action_details} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

export default LogsPage;