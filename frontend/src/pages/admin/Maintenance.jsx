import Pagination from "../../components/Pagination";
import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import RemoveMaintenanceModal from "../../components/RemoveMaintenanceModal";
import MaintenanceModal from "../../components/MaintenanceModal";
import { saveActivityLog } from "../../utils/activityLogs";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PAGE_SIZE = 20;

function MaintenancePage() {
  const [page, setPage] = useState(1);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, mode: "" });
  const [rows, setRows] = useState([]);
  const [removeModal, setRemoveModal] = useState({ isOpen: false, rowId: null });

  // FETCH FROM DATABASE
  useEffect(() => {
    fetchMaintenance();
  }, []);

  const formatToDisplayDate = (dateStr) => {
    if (!dateStr) return "";

    if (typeof dateStr === "string" && dateStr.includes("-")) {
      const [year, month, day] = dateStr.split("T")[0].split("-");
      return `${month}-${day}-${year.slice(-2)}`;
    }

    return dateStr;
  };

  const fetchMaintenance = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/maintenance`);
      const data = await res.json();

      setRows(
        data.map((item) => ({
          id: item.setting_id,
          date: formatToDisplayDate(item.config_date),
          rawDate: item.config_date,
          remarks: item.category,
        }))
      );
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // ADD HOLIDAY / HALF-DAY
  const handleAddEntry = async (newEntry) => {
    try {
      let category;
      if (modalConfig.mode === "holiday") {
        category = "Holiday";
      } else {
        category = "Half-day";
      }
      const action =
        modalConfig.mode === "holiday" ? "Added holiday" : "Added half day";

      const payload =
        modalConfig.mode === "holiday"
          ? {
              date: newEntry.date,
              category,
              am_in: newEntry.am_in,
              am_out: newEntry.am_out,
              pm_in: newEntry.pm_in,
              pm_out: newEntry.pm_out,
            }
          : { date: newEntry.date, category };

      const res = await fetch(`${API_BASE_URL}/api/maintenance/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("RESPONSE:", data);

      if (!res.ok) {
        throw new Error(data.message || "Failed to add");
      }

      // Audit log
      const logDate = data.date || newEntry.date;
      saveActivityLog({
        action,
        details: `Added ${category} on ${logDate}.`,
      }).catch((logErr) =>
        console.error("Activity log failed:", logErr.message)
      );

      await fetchMaintenance(); // IMPORTANT: wait
      setModalConfig({ isOpen: false, mode: "" });

    } catch (err) {
      console.error("error",err.message);
    }
  };


  // DELETE ENTRY
  const handleRemoveClick = (id) => {
    setRemoveModal({ isOpen: true, rowId: id });
  };

  const confirmRemove = async () => {
    try {
      const target = rows.find((r) => r.id === removeModal.rowId);

      const res = await fetch(
        `${API_BASE_URL}/api/maintenance/${removeModal.rowId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      // Audit log
      if (target) {
        const remarks = String(target.remarks ?? "").trim().toLowerCase();
        const isHoliday = remarks === "holiday";
        const isHalfDay = remarks.includes("half-day");
        const action = isHoliday
          ? "Removed holiday"
          : isHalfDay
            ? "Removed half day"
            : "Removed maintenance entry";
        saveActivityLog({
          action,
          details: `Removed ${target.remarks} on ${target.rawDate}.`,
        }).catch((logErr) =>
          console.error("Activity log failed:", logErr.message)
        );
      }

      setRemoveModal({ isOpen: false, rowId: null });

      fetchMaintenance();

    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const openModal = (mode) => {
    setModalConfig({ isOpen: true, mode: mode });
  };

  const closeModal = () => {
    setModalConfig({ isOpen: false, mode: "" });
  };

  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const paginated = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="relative bg-surface w-full text-theme p-2 pt-2 overflow-y-hidden">
      <div className="p-1 md:p-5 md:mt-0">

        {/* HEADER */}
        <div className="flex flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Maintenance
          </h1>
        </div>

        {/* BUTTONS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg md:text-xl font-semibold">
            Holidays and Half-Days
          </h2>

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

        {/* TABLE  */}
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
                <tr
                  key={row.id}
                  className={`border-t ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition`}
                >
                  <td className="text-center px-8 py-3">
                    {row.date}
                  </td>

                  <td className="text-center px-10 py-3">
                    {row.remarks}
                  </td>

                  <td className="px-6 py-3 text-center">
                    <button
                      onClick={() => handleRemoveClick(row.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center mt-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>

        {/* MODAL */}
        {modalConfig.isOpen && (
          <MaintenanceModal
            mode={modalConfig.mode}
            onClose={closeModal}
            onAdd={handleAddEntry}
          />
        )}

        {/* REMOVE MODAL */}
        <RemoveMaintenanceModal
          isOpen={removeModal.isOpen}
          onClose={() =>
            setRemoveModal({ isOpen: false, rowId: null })
          }
          onConfirm={confirmRemove}
          entry={rows.find((r) => r.id === removeModal.rowId)}
        />
      </div>
    </div>
  );
}

export default MaintenancePage;