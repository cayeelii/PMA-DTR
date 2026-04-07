import { useState } from "react";
import { Pencil, Search } from "lucide-react";
import Pagination from "../../components/Pagination";
import AddSignatoryModal from "../../components/AddSignatoryModal";
import EditSignatoryModal from "../../components/EditSignatoryModal";
// Start with an empty table
const PAGE_SIZE = 20;
function SignatoriesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editIdx, setEditIdx] = useState(null);
  const [editDept, setEditDept] = useState("");
  const [editHead, setEditHead] = useState("");
  const [data, setData] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSignatory, setSelectedSignatory] = useState(null);
  const filtered = data.filter((row) =>
    row.department.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAddSignatory = (signatory) => {
    setData(prev => [signatory, ...prev]);
    setShowAddModal(false);
    setPage(1);
  };

  const handleEditClick = (signatory, idx) => {
    setSelectedSignatory({ ...signatory });
    setEditIdx(idx);
    setShowEditModal(true);
  };

  const handleEditSave = (updatedSignatory) => {
    const newData = [...data];
    newData[editIdx] = updatedSignatory;
    setData(newData);
    setShowEditModal(false);
    setEditIdx(null);
    setSelectedSignatory(null);
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setEditIdx(null);
    setSelectedSignatory(null);
  };

  return (
    <div className="relative bg-surface w-full text-theme p-2 pt-2 overflow-y-hidden">
      <div className="p-1 md:p-5 md:mt-0">
        <div className="flex flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Signatories
          </h1>
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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          <button
            className="bg-amber-400 hover:bg-amber-500 text-gray-900 px-5 py-1.5 rounded-lg font-medium shadow flex items-center gap-2"
            onClick={() => setShowAddModal(true)}
          >
            <span>Add Signatory</span>
          </button>
        </div>

        {/* Add Signatory Modal */}
        <AddSignatoryModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddSignatory}
        />
        <EditSignatoryModal
          isOpen={showEditModal}
          signatory={selectedSignatory}
          onClose={handleEditClose}
          onSave={handleEditSave}
        />
        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-center px-8 py-3 font-semibold">
                  Department
                </th>
                <th className="text-center px-12 py-3 font-semibold">
                  Department Head
                </th>
                <th className="text-center px-12 py-3 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No results found.
                  </td>
                </tr>
              ) : (
                paginated.map((row, idx) => {
                  const globalIdx = (page - 1) * PAGE_SIZE + idx;
                  return (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4">
                        {row.department || ""}
                      </td>
                      <td className="px-6 py-4">
                        {row.head || ""}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="Edit"
                          onClick={() => handleEditClick(row, globalIdx)}
                        >
                          <Pencil size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
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

export default SignatoriesPage;
