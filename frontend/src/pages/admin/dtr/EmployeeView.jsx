import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, Search } from "lucide-react";

const EmployeeView = ({
  departmentName,
  batchId,
  onBack,
  onSelectEmployee,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPdfOptions, setShowPdfOptions] = useState(false);

  const pdfDropdownRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch Employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        if (!departmentName || !batchId) return;

        setLoading(true);

        const res = await fetch(
          `${API_BASE_URL}/api/dtr/employees?department=${encodeURIComponent(
            departmentName,
          )}&batch_id=${batchId}`,
        );

        const data = await res.json();
        setEmployees(data || []);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [departmentName, batchId]);

  // Close PDF dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pdfDropdownRef.current && !pdfDropdownRef.current.contains(e.target)) {
        setShowPdfOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // FILTER
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id?.toString().includes(searchTerm),
  );

  // Handle Export XLSX
  const handleExportXLSX = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dtr/export-department-xlsx?department=${encodeURIComponent(
          departmentName,
        )}&batch_id=${batchId}`,
      );

      if (!response.ok) {
        throw new Error("Failed to export XLSX");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${departmentName}_employees.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  // Handle Export PDF with layout
  const handleExportPDF = async (columnLayout) => {
    setShowPdfOptions(false);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dtr/export-department-pdf?department=${encodeURIComponent(
          departmentName,
        )}&batch_id=${batchId}&layout=${columnLayout}`,
      );

      if (!response.ok) {
        throw new Error("Failed to export PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${departmentName}_employees_${columnLayout}col.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF export failed:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-5xl mx-auto border border-gray-100 flex flex-col h-[650px]">
      {/* HEADER */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
        <h2 className="text-xl font-bold text-gray-800">
          {departmentName} <span className="text-gray-400 mx-1">•</span>{" "}
          Employees
        </h2>

        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <ChevronLeft size={18} />
          Back
        </button>
      </div>

      {/* SEARCH */}
      <div className="p-6 pb-4 flex items-center justify-between shrink-0">
        <div className="relative w-full max-w-xl">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={18} />
          </span>

          <input
            type="text"
            placeholder="Search by BIO ID or Employee Name"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* EXPORT BUTTONS */}
        <div className="flex items-center gap-3 ml-4">
          <button
            onClick={handleExportXLSX}
            className="border border-green-600 text-green-600 px-4 py-1 rounded hover:bg-green-50 text-sm font-medium"
          >
            Export XLSX
          </button>

          {/* Export PDF with layout dropdown */}
          <div className="relative" ref={pdfDropdownRef}>
            <button
              onClick={() => setShowPdfOptions((prev) => !prev)}
              className="border border-gray-400 text-gray-700 px-4 py-1 rounded hover:bg-gray-100 text-sm font-medium"
            >
              Export PDF
            </button>

            {showPdfOptions && (
              <div className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-lg z-20 p-2">
                <p className="text-[11px] text-gray-500 mb-2 px-1">
                  Choose layout
                </p>
                <button
                  onClick={() => handleExportPDF("1")}
                  className="w-full text-left text-sm px-3 py-2 rounded hover:bg-gray-100"
                >
                  1 Column
                </button>
                <button
                  onClick={() => handleExportPDF("2")}
                  className="w-full text-left text-sm px-3 py-2 rounded hover:bg-gray-100"
                >
                  2 Columns
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-hidden p-6 pt-0 flex flex-col">
        <div className="overflow-y-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-100">
              <tr className="text-xs uppercase text-gray-700 font-bold">
                <th className="px-6 py-4">BIO ID</th>
                <th className="px-6 py-4">Employee Name</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={2} className="text-center py-10 text-gray-400">
                    Loading employees...
                  </td>
                </tr>
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    onClick={() => onSelectEmployee(emp)}
                    className="cursor-pointer hover:bg-orange-50"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-gray-500">
                      {emp.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                      {emp.name}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className="py-12 text-center text-gray-400 bg-gray-50"
                  >
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeView;
