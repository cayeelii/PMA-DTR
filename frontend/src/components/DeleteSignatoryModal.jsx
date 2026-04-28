import React from "react";

const DeleteSignatoryModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedSignatory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-2">Delete Signatory</h2>

        <p className="text-gray-600 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{selectedSignatory?.department}</span>
          ?
        </p>

        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-red-600 text-white rounded"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSignatoryModal;
