import { useMemo, useState } from "react";
import { Search } from "lucide-react";

const PAGE_SIZE = 5;

const mockLogs = [
  {
    id: 1,
    timestamp: "Mar 03, 2026 - 10:15 AM",
    user: "Juan",
    action: "Created Holiday Schedule",
    details: "2026-03-15 marked as Holiday",
  },
  {
    id: 2,
    timestamp: "Mar 02, 2026 - 08:01 AM",
    user: "Juan",
    action: "Updated Time In",
    details: "Employee: Jessie Tanongan; Time In changed from 8:20 AM to 8:00 AM",
  },
];

function LogsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredLogs = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return mockLogs;
    }

    return mockLogs.filter((log) =>
      [log.timestamp, log.user, log.action, log.details]
        .join(" ")
        .toLowerCase()
        .includes(searchText)
    );
  }, [search]);
  
  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);
  const paginatedLogs = filteredLogs.slice((page - 1) * PAGE_SIZE,page * PAGE_SIZE);

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
                    key={log.id}
                    className={`border-t ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="w-52 px-6 py-4 whitespace-nowrap">{log.timestamp}</td>
                    <td className="w-24 pl-3 pr-4 py-4 whitespace-nowrap">{log.user}</td>
                    <td className="pl-3 pr-6 py-4">{log.action}</td>
                    <td className="px-6 py-4">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

         {/* Pagination */}
         <div className="flex justify-center items-center mt-4 gap-2">
          <button
            className="flex items-center text-[#3A3D4B] bg-transparent font-medium px-2 py-1 disabled:text-gray-400"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`mx-1 w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold transition ${page === i + 1 ? "bg-[#3A3D4B] text-white" : "bg-[#E0E1E6] text-[#3A3D4B]"}`}
              onClick={() => setPage(i + 1)}
              style={{ boxShadow: page === i + 1 ? "0 0 2px #3A3D4B" : "none" }}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="flex items-center text-[#3A3D4B] bg-transparent font-medium px-2 py-1 disabled:text-gray-400"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(page + 1)}
          >
            Next
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogsPage;