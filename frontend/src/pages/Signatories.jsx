import { useState } from "react";
import { PenLine, Search } from "lucide-react";
const mockData = Array(15).fill({ department: "", head: "" });
const PAGE_SIZE = 5;
function SignatoriesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const filtered = mockData.filter((row) => row.department.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#ECEEF3] p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Signatories</h1>
          <button className="bg-[#FEAF01] text-black font-medium px-4 py-2 rounded flex items-center gap-2 hover:bg-[#ffc940] transition">
            <span className="text-xl">+</span> Add Signatory
          </button>
        </div>
        <div className="mb-4">
          <div className="relative w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Search Department"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Department</th>
                <th className="px-6 py-3 text-left font-semibold">Department Head</th>
                <th className="px-6 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No results found.</td>
                </tr>
              ) : (
                paginated.map((row, idx) => (
                  <tr key={idx} className="even:bg-gray-50">
                    <td className="px-6 py-4">{row.department || ""}</td>
                    <td className="px-6 py-4">{row.head || ""}</td>
                    <td className="px-6 py-4">
                      <button className="hover:text-blue-600" title="Edit">
                        <PenLine className="w-5 h-5 inline" />
                      </button>
                    </td>
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

export default SignatoriesPage;