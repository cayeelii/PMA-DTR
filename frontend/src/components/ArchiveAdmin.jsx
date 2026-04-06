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
                <div className="px-6 py-5 text-center">
                    <p className="text-[19px] text-[#3c4043]">
                        Are you sure you want to archive{" "}
                        <span className="font-bold text-[#d93025]">
                            {user?.user}
                        </span>
                        ?
                    </p>
                </div>

                {/* Footer Section */}
                <div className="p-5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(user)}
                        className="flex-1 px-4 py-2  bg-[#d93025] text-white rounded-lg font-medium hover:bg-opacity-90 transition-all"
                    >
                        Archive
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArchiveAdminModal;
