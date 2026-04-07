import React from "react";


const RemoveMaintenanceModal = ({ isOpen, onClose, onConfirm, entry }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 w-full max-w-md relative animate-fadeIn">
        <h2 className="text-xl font-semibold mb-4">Confirm Removal</h2>
        <p className="mb-6">
          Are you sure you want to remove this entry?
          <br />
          <span className="font-semibold">Date:</span> {entry?.date} <br />
          <span className="font-semibold">Remarks:</span> {entry?.remarks}
        </p>
        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold"
            onClick={onConfirm}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveMaintenanceModal;
