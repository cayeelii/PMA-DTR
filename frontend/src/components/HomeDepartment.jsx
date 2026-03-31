import React from "react";
import { Search, X } from "lucide-react";

function HomeDepartment({ open, onClose, selectedMonth }) {
  const departmentRows = [
    { name: "Tactical Department", status: "Complete" },
    { name: "Accounting", status: "Complete" },
    { name: "Procurement/Contracting", status: "Complete" },
    { name: "Information", status: "Complete" },
    { name: "Dental", status: "Complete" },
    { name: "ACDI", status: "Complete" },
  ];

  const [search, setSearch] = React.useState("");

  const filteredRows = departmentRows.filter((row) =>
    row.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleClose = () => {
    setSearch("");
    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-2 sm:mx-4 relative animate-fadeInUp">
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-r from-[#223488] to-blue-500 rounded-t-2xl gap-2 sm:gap-0">
          <div className="flex items-center w-full gap-2">
            <span className="bg-white rounded-full px-2 py-1 flex items-center max-w-xs w-full">
              <Search className="w-4 h-4 text-gray-400 mr-2" strokeWidth={2} />
              <input
                type="text"
                placeholder="Search Department"
                className="w-full outline-none bg-transparent text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </span>
            {selectedMonth ? (
              <span className="text-white text-xs sm:text-sm font-medium whitespace-nowrap">
                {selectedMonth}
              </span>
            ) : null}
          </div>
          <button
            className="sm:ml-4 text-white p-1 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors duration-200"
            onClick={handleClose}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* Modal Table */}
        <div className="px-2 sm:px-6 py-4 overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-semibold">Department Name</th>
                   <th className="text-center py-2 font-semibold">Status</th>
                <th className="text-left py-2 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-gray-400">
                    No departments found.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b last:border-b-0 hover:bg-blue-50 transition-colors duration-150"
                  >
                    <td className="py-2">{row.name}</td>
                    <td className="py-2 text-center align-middle">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs inline-block">
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2">
                      <button className="text-[#223488] hover:underline">view details</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default HomeDepartment;
