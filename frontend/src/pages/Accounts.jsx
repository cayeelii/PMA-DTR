import { useState } from "react";
import { Delete, PenLine, KeyRound, Trash, Search } from "lucide-react";
const mockData = Array(15).fill({ department: "", head: "" });
const PAGE_SIZE = 5;


function AccountsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const filtered = mockData.filter((row) =>
    row.department.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);


  return (
    <div className="min-h-screen bg-[#ECEEF3] p-8">
  {/* Title only */}
  <div className="mb-6">
    <h1 className="text-3xl font-bold">Accounts</h1>
  </div>

  {/* Search + Button aligned */}
  <div className="flex justify-between items-center mb-4">
    <div className="relative w-64">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Search className="w-5 h-5" />
      </span>
      <input
        type="text"
        placeholder="Search User"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
      />
    </div>

    <button className="bg-[#FEAF01] text-black font-medium px-4 py-2 rounded flex items-center gap-2 hover:bg-[#ffc940] transition">
      <span className="text-xl">+</span> Add User
    </button>
  </div>


      <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
        <table className="min-w-full border rounded-lg">
          <thead className="bg-[#E5E7EB] border-b border-gray-400">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">
                Timestamp Created
              </th>
              <th className="px-6 py-3 text-left font-semibold">User</th>
              <th className="px-6 py-3 text-left font-semibold">Role</th>
              <th className="px-6 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="[&>tr:last-child]:border-b-0">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No results found.
                </td>
              </tr>
            ) : (
              paginated.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-200 even:bg-[#E5E7EB] hover:bg-gray-100 transition-colors duration-150">
                  <td className="px-6 py-4">{row.timestamp}</td>
                  <td className="px-6 py-4">{row.user}</td>
                  <td className="px-6 py-4">{row.role}</td>
                  <td className="px-6 py-4">
                    <button className="hover:text-blue-600" title="Edit">
                      <PenLine className="w-5 h-5 inline" />
                    </button>
                    <button className="hover:text-gray-600" title="Reset">
                      <KeyRound className="w-5 h-5 inline" />
                    </button>
                    <button className="hover:text-red-600" title="Delete">
                      <Trash className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


export default AccountsPage;



