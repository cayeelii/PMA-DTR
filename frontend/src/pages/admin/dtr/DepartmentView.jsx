import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const OFFICE_DROPDOWNS = {
  "Cadet Mess": [
    "CM_ADMIN",
    "CM_COOK",
    "CM_STR-KPR",
    "CM_WAITER",
    "CM_WTR-STN",
  ],
  FDPSH: ["FDPSH", "FDPSH_", "FDPSH_N"],
};

const DepartmentView = ({ fileName, onReset, batchId, onSelect }) => {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      console.log("batchId received:", batchId);

      if (!batchId || batchId === "null" || batchId === "undefined") return;

      try {
        const res = await axios.get(`${API_BASE_URL}/api/dtr/departments`, {
          params: { batch_id: Number(batchId) },
        });

        console.log("Departments response:", res.data);

        setDepartments(res.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, [batchId]);

  //Fetch eport batch dtr
  const handleExportBatch = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dtr/export-batch-xlsx?batch_id=${batchId}`,
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Batch_${batchId}_DTR.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Batch export failed:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-10 max-w-7xl mx-auto flex flex-col h-[650px]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold text-gray-800">
          Select a department
        </h2>

        <div className="flex items-center gap-4">
          <button
            onClick={onReset}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Select other file
          </button>

          <button
            onClick={handleExportBatch}
            className="border border-green-600 text-green-600 px-4 py-1 rounded hover:bg-green-50 text-sm font-medium"
          >
            Export XLSX
          </button>

          <span className="bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-medium border border-green-200">
            {fileName}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {departments.map((dept, index) => (
            <button
              key={index}
              onClick={() => onSelect(dept)}
              className="p-6 border border-gray-200 rounded-xl text-left hover:border-orange-400 hover:shadow-md transition-all group"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-orange-500">
                {dept.name}
              </h3>
              <p className="text-gray-500 text-sm">
                {dept.employees} employees
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DepartmentView;
