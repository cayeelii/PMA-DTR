import React from "react";

const ArchiveAdminModal = ({ isOpen, user, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[440px] animate-in fade-in zoom-in duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-[22px] font-bold text-[#3c4043]">
            Confirm Archive
          </h2>
        </div>

        {/* Body Section */}
        <div className="px-6 py-8 text-center">
          <p className="text-[19px] text-[#3c4043]">
            Are you sure you want to archive{" "}
            <span className="font-bold text-[#d93025]">{user?.name || "Nikko"}</span>?
          </p>
        </div>

        {/* Footer Section */}
        <div className="px-6 pb-6 flex justify-center gap-4">
          <button
            onClick={onClose}
            className="min-w-[120px] px-6 py-2 border border-gray-300 rounded-xl text-sm font-medium text-[#3c4043] hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="min-w-[120px] px-6 py-2 bg-[#d93025] text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all active:scale-95 shadow-sm"
          >
            Archive
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveAdminModal;