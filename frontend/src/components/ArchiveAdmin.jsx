import React from "react";

const ArchiveAdminModal = ({ isOpen, user, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
        {/* Header/Body Section */}
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-[#1a2b4b] mb-2">
            Archive User
          </h2>
          <p className="text-gray-500">
            Are you sure you want to archive{" "}
            <span className="font-bold text-red-700">{user?.user}</span>?
          </p>
        </div>

        <div className="border-t border-gray-200 mb-6"></div>

        {/* Footer Section */}
        <div className="border-t border-gray-100 p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-[#d93025] text-white rounded-lg text-sm font-medium hover:bg-red-700 shadow-sm transition-all active:scale-95"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveAdminModal;
