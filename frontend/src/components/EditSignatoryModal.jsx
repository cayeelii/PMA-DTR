import { useState, useEffect } from "react";

const EditSignatoryModal = ({
  signatory,
  isOpen,
  onClose,
  onSave,
  departments = [],
}) => {
  const [formData, setFormData] = useState({
    signatory_id: "",
    dept_id: "",
    position: "",
    head: "",
  });

  useEffect(() => {
    if (signatory) {
      setFormData({
        signatory_id: signatory.signatory_id,
        dept_id: signatory.dept_id,
        position: signatory.position || "",
        head: signatory.head || "",
      });
    }
  }, [signatory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[440px]">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Edit Signatory</h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Department Dropdown */}
          <div>
            <label className="text-sm font-semibold">Department</label>
            <select
              value={formData.dept_id}
              onChange={(e) =>
                setFormData({ ...formData, dept_id: e.target.value })
              }
              className="w-full border p-2 rounded mt-1"
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.dept_id} value={d.dept_id}>
                  {d.dept_name}
                </option>
              ))}
            </select>
          </div>

          {/* Position Input */}
          <div>
            <label className="text-sm font-semibold">Position</label>
            <input
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              className="w-full border p-2 rounded mt-1"
              placeholder="e.g. Director, Manager"
            />
          </div>

          {/* Head Input */}
          <div>
            <label className="text-sm font-semibold">Department Head</label>
            <input
              value={formData.head}
              onChange={(e) =>
                setFormData({ ...formData, head: e.target.value })
              }
              className="w-full border p-2 rounded mt-1"
            />
          </div>
        </div>

        <div className="p-6 flex gap-3">
          <button onClick={onClose} className="flex-1 border rounded p-2">
            Cancel
          </button>

          <button
            onClick={() => onSave(formData)}
            className="flex-1 bg-blue-600 text-white rounded p-2"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSignatoryModal;
