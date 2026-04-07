import Pagination from "../../components/Pagination";
const PAGE_SIZE = 20;
import { useState } from "react";
import { Trash2 } from "lucide-react";
import RemoveMaintenanceModal from "../../components/RemoveMaintenanceModal";
import MaintenanceModal from "../../components/MaintenanceModal"; 

function MaintenancePage() {
  const [page, setPage] = useState(1);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, mode: "" });
  const [rows, setRows] = useState([
    { id: 1, date: "01/01/26", remarks: "Holiday" },
    { id: 2, date: "02/13/26", remarks: "Half-day" },
    { id: 3, date: "02/17/26", remarks: "Holiday" },
  ]);
  const [removeModal, setRemoveModal] = useState({ isOpen: false, rowId: null });


  const handleRemoveClick = (id) => {
    setRemoveModal({ isOpen: true, rowId: id });
  };

  const confirmRemove = () => {
    setRows(rows.filter((row) => row.id !== removeModal.rowId));
    setRemoveModal({ isOpen: false, rowId: null });
  };

  const openModal = (mode) => {
    setModalConfig({ isOpen: true, mode: mode });
  };

  const closeModal = () => {
    setModalConfig({ isOpen: false, mode: "" });
  };

  const handleAddEntry = (newEntry) => {
    const entryWithId = { 
      ...newEntry, 
      id: Date.now(), 
      remarks: modalConfig.mode === "holiday" ? "Holiday" : "Half-day" 
    };
    setRows((prev) => [...prev, entryWithId]);
  };

  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const paginated = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="relative bg-surface w-full text-theme p-2 pt-2 overflow-y-hidden">
      <div className="p-1 md:p-5 md:mt-0">
        <div className="flex flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Maintenance</h1>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg md:text-xl font-semibold">Holidays and Half-Days</h2>
          <div className="flex gap-3">
            <button 
              onClick={() => openModal("holiday")}
              className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium shadow"
            >
              Add Holiday
            </button>
            <button
              onClick={() => openModal("half-day")}
              className="bg-amber-400 hover:bg-amber-500 text-gray-900 px-4 py-2 rounded-lg font-medium shadow"
            >
              Add Half-day
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-center px-8 py-3 font-semibold">Date</th>
                <th className="text-center px-10 py-3 font-semibold">Remarks</th>
                <th className="text-center px-11 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((row, index) => (
                <tr key={row.id} className={`border-t ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition`}>
                  <td className="text-center px-8 py-3">{row.date}</td>
                  <td className="text-center px-10 py-3">{row.remarks}</td>
                  <td className="px-6 py-3 text-center">
                    <button onClick={() => handleRemoveClick(row.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </td>
                        <RemoveMaintenanceModal
                          isOpen={removeModal.isOpen}
                          onClose={() => setRemoveModal({ isOpen: false, rowId: null })}
                          onConfirm={confirmRemove}
                          entry={rows.find(r => r.id === removeModal.rowId)}
                        />
                </tr>
              ))}
            </tbody>

          </table>
        </div>
        {/* Pagination Controls */}
        <div className="flex justify-center mt-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>

        {/* Modal Import Name */}
        {modalConfig.isOpen && (
          <MaintenanceModal 
            mode={modalConfig.mode} 
            onClose={closeModal} 
            onAdd={handleAddEntry}
          />
        )}
      </div>
    </div>
  );
}

export default MaintenancePage;