import React, { useState } from "react";

const AddSignatoryModal = ({ isOpen, onClose, onAdd, departments = [] }) => {
  const [newDept, setNewDept] = useState("");
  const [newDeptFull, setNewDeptFull] = useState("");
  const [newHead, setNewHead] = useState("");
  const [newPosition, setNewPosition] = useState("");

  const handleAdd = () => {
    const dept = newDept.trim();
    const full = newDeptFull.trim();
    const pos = newPosition.trim();
    const head = newHead.trim();

    if (dept && full && head) {
      onAdd({
        dept_name: dept,
        dept_full_name: full,
        position: pos,
        head_name: head,
      });

      setNewDept("");
      setNewDeptFull("");
      setNewPosition("");
      setNewHead("");
    }
  };

  const handleClose = () => {
    setNewDept("");
    setNewDeptFull("");
    setNewPosition("");
    setNewHead("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 w-full max-w-md relative animate-fadeIn">
        <h2 className="text-2xl font-semibold mb-4">Add Signatory</h2>

        {/* Department Acronym */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Department Acronym</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
            placeholder="e.g. ICTC"
          />
        </div>

        {/* Full Department Name */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">
            Full Department Name
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded"
            value={newDeptFull}
            onChange={(e) => setNewDeptFull(e.target.value)}
            placeholder="Enter full department name"
          />
        </div>

        {/* Department Head */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-1">Department Head</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
            value={newHead}
            onChange={(e) => setNewHead(e.target.value)}
            placeholder="Enter department head"
          />
        </div>

        {/* Position */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Position</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded"
            value={newPosition}
            onChange={(e) => setNewPosition(e.target.value)}
            placeholder="e.g. HR, Superintendent"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
            onClick={handleClose}
          >
            Cancel
          </button>

          <button
            className="bg-amber-400 hover:bg-amber-500 text-gray-900 px-4 py-2 rounded font-semibold"
            onClick={handleAdd}
            disabled={
              !newDept || !newDeptFull || !newPosition.trim() || !newHead.trim()
            }
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSignatoryModal;
