import { useState, useEffect } from "react";
import { Pencil, Trash2, Search } from "lucide-react";
import Pagination from "../../components/Pagination";
import AddSignatoryModal from "../../components/AddSignatoryModal";
import EditSignatoryModal from "../../components/EditSignatoryModal";
import DeleteSignatoryModal from "../../components/DeleteSignatoryModal";
import { saveActivityLog } from "../../utils/activityLogs";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState(null);
  const [selectedSignatory, setSelectedSignatory] = useState(null);
  const [departments, setDepartments] = useState([]);

  //Fetch all departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/signatories/departments`);
        const data = await res.json();
        setDepartments(data);
      } catch (err) {
        console.error("Failed to load departments:", err);
      }
    };

    fetchDepartments();
  }, []);

  const filtered = data.filter((row) =>
    row.department.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  //Fetch all signatories
  useEffect(() => {
    const fetchSignatories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/signatories`);
        const data = await res.json();

        setData(
          data.map((item) => ({
            signatory_id: item.signatory_id,
            dept_id: item.dept_id,
            department: item.dept_name,
            position: item.position || "",
            head: item.head_name,
          })),
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchSignatories();
  }, []);

  //Fetch add signatory
  const handleAddSignatory = async (signatory) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/signatories/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dept_name: signatory.dept_name,
          dept_full_name: signatory.dept_full_name,
          head_name: signatory.head_name,
          position: signatory.position,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add signatory");
      }

      setData((prev) => [
        {
          signatory_id: data.signatory_id,
          dept_id: data.dept_id,
          department: signatory.dept_name.toUpperCase(),
          head: signatory.head_name,
          position: signatory.position,
        },
        ...prev,
      ]);

      setDepartments((prev) => [
        ...prev,
        {
          dept_id: data.dept_id,
          dept_name: signatory.dept_name.toUpperCase(),
          dept_full_name: signatory.dept_full_name,
        },
      ]);

      setShowAddModal(false);
      setPage(1);

      try {
        const deptAcronym = signatory.dept_name.toUpperCase().trim();
        const pos = (signatory.position || "").trim();
        const fullName = (signatory.dept_full_name || "").trim();
        await saveActivityLog({
          action: "Added Signatory",
          details: `Added signatory "${signatory.head_name}" (${pos || "—"}) for department ${deptAcronym} — ${fullName}.`,
        });
      } catch (logErr) {
        console.error("Failed to save activity log:", logErr);
      }
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };

  const handleEditClick = (signatory, idx) => {
    setSelectedSignatory({ ...signatory });
    setEditIdx(idx);
    setShowEditModal(true);
  };

  //Fetch update signatory
  const handleEditSave = async (updated) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/signatories/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signatory_id: selectedSignatory.signatory_id,
          dept_id: updated.dept_id,
          position: updated.position,
          head_name: updated.head,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      const previousHead = selectedSignatory.head;
      const previousDept = selectedSignatory.department;
      const newDept =
        departments.find((d) => d.dept_id == updated.dept_id)?.dept_name || "";

      setData((prev) =>
        prev.map((item) =>
          item.signatory_id === selectedSignatory.signatory_id
            ? {
                ...item,
                dept_id: updated.dept_id,
                department: newDept,
                position: updated.position,
                head: updated.head,
              }
            : item,
        ),
      );

      setShowEditModal(false);
      setSelectedSignatory(null);

      try {
        const didChangeHead = previousHead !== updated.head;

        // Only log Department Head changes.
        if (didChangeHead) {
          const departmentName = newDept || previousDept || "Unknown";
          await saveActivityLog({
            action: "Updated Signatory",
            details: `Changed Department Head for Department "${departmentName}" from "${previousHead}" to "${updated.head}".`,
          });
        }
      } catch (logErr) {
        console.error("Failed to save activity log:", logErr);
      }
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };

  //Fetch delete signatory
  const handleDeleteSignatory = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/signatories/delete/${selectedDelete.signatory_id}`,
        {
          method: "DELETE",
        },
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      const deleted = { ...selectedDelete };

      setData((prev) =>
        prev.filter((item) => item.signatory_id !== deleted.signatory_id),
      );

      setShowDeleteModal(false);
      setSelectedDelete(null);

      try {
        await saveActivityLog({
          action: "Removed Signatory",
          details: `Removed signatory "${deleted.head}" (${deleted.position || "—"}) from department "${deleted.department}".`,
        });
      } catch (logErr) {
        console.error("Failed to save activity log:", logErr);
      }
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setEditIdx(null);
    setSelectedSignatory(null);
  };

  const handleDeleteClick = (row) => {
    setSelectedDelete(row);
    setShowDeleteModal(true);
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
          departments={departments}
        />
        <EditSignatoryModal
          isOpen={showEditModal}
          signatory={selectedSignatory}
          onClose={handleEditClose}
          onSave={handleEditSave}
          departments={departments}
        />
        <DeleteSignatoryModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedDelete(null);
          }}
          selectedSignatory={selectedDelete}
          onConfirm={handleDeleteSignatory}
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
                  Position
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
                    colSpan={4}
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
                      <td className="px-6 py-4 text-center">
                        {row.department || ""}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.head || ""}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.position || ""}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            className="text-blue-600 hover:text-blue-800 transition"
                            title="Edit"
                            onClick={() => handleEditClick(row, globalIdx)}
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            className="text-red-600 hover:text-red-800 transition"
                            title="Delete"
                            onClick={() => handleDeleteClick(row)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
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
