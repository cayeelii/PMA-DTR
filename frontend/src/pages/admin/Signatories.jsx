import { useState } from "react";
import { PenLine, Search } from "lucide-react";
const mockData = Array(15).fill({ department: "", head: "" });
const PAGE_SIZE = 5;
function SignatoriesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editIdx, setEditIdx] = useState(null);
  const [editDept, setEditDept] = useState("");
  const [editHead, setEditHead] = useState("");
  const [data, setData] = useState(mockData);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDept, setNewDept] = useState("");
  const [newHead, setNewHead] = useState("");
  const filtered = data.filter((row) => row.department.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAddSignatory = () => {
    if (newDept.trim() && newHead.trim()) {
      setData([{ department: newDept, head: newHead }, ...data]);
      setShowAddModal(false);
      setNewDept("");
      setNewHead("");
      setPage(1);
    }
  };

  return (
    <div className="relative bg-surface w-full text-theme p-2 pt-2 overflow-y-hidden">
      <div className="p-1 md:p-5 md:mt-0">
        <div className="flex flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Signatories</h1>
        </div>
        <div className="flex flex-row md:items-center justify-between gap-4 mb-4">
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
          <button
            className="bg-amber-400 hover:bg-amber-500 text-gray-900 px-3 py-1 rounded-lg font-medium shadow flex items-center gap-2"
            onClick={() => setShowAddModal(true)}
          >
            <span className="text-xl">+</span> Add Signatory
          </button>
        </div>
        {/* Add Signatory Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 w-full max-w-md relative animate-fadeIn">
              <h2 className="text-2xl font-semibold mb-4">Add Signatory</h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Department</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                  value={newDept}
                  onChange={e => setNewDept(e.target.value)}
                  placeholder="Enter department"
                  autoFocus
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-1">Department Head</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                  value={newHead}
                  onChange={e => setNewHead(e.target.value)}
                  placeholder="Enter department head"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
                  onClick={() => { setShowAddModal(false); setNewDept(""); setNewHead(""); }}
                >Cancel</button>
                <button
                  className="bg-amber-400 hover:bg-amber-500 text-gray-900 px-4 py-2 rounded font-semibold"
                  onClick={handleAddSignatory}
                  disabled={!newDept.trim() || !newHead.trim()}
                >Add</button>
              </div>
            </div>
          </div>
        )}
        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-center px-8 py-3 font-semibold">Department</th>
                <th className="text-center px-12 py-3 font-semibold">Department Head</th>
                <th className="text-center px-12 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No results found.</td>
                </tr>
              ) : (
                paginated.map((row, idx) => {
                  const globalIdx = (page - 1) * PAGE_SIZE + idx;
                  return (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4">
                        {editIdx === globalIdx ? (
                          <input
                            className="px-2 py-1 w-32 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                            value={editDept}
                            onChange={e => setEditDept(e.target.value)}
                          />
                        ) : (
                          row.department || ""
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editIdx === globalIdx ? (
                          <input
                            className="px-2 py-1 w-32 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                            value={editHead}
                            onChange={e => setEditHead(e.target.value)}
                          />
                        ) : (
                          row.head || ""
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {editIdx === globalIdx ? (
                          <>
                            <button
                              style={{ backgroundColor: '#142050' }}
                              className="hover:bg-blue-900 text-white px-3 py-1 rounded w-16 mr-2"
                              onClick={() => {
                                const newData = [...data];
                                newData[globalIdx] = { department: editDept, head: editHead };
                                setData(newData);
                                setEditIdx(null);
                              }}
                            >Save</button>
                            <button
                              className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 rounded w-16"
                              onClick={() => setEditIdx(null)}
                            >Cancel</button>
                          </>
                        ) : (
                          <button
                            className="hover:text-blue-600"
                            title="Edit"
                            onClick={() => {
                              setEditIdx(globalIdx);
                              setEditDept(row.department);
                              setEditHead(row.head);
                            }}
                          >
                            <PenLine className="w-5 h-5 inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
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