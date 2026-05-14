import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

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
  const [openOffice, setOpenOffice] = useState(null);

  const toggleOffice = (officeName) => {
    setOpenOffice((prev) => (prev === officeName ? null : officeName));
  };

  const getParentOffice = (deptName) => {
    for (const office in OFFICE_DROPDOWNS) {
      if (OFFICE_DROPDOWNS[office].includes(deptName)) {
        return office;
      }
    }
    return null;
  };


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

  const groupedDepartments = {};
  const mainDepartments = [];

   departments.forEach((dept) => {
    const parent = getParentOffice(dept.name);

    if (parent) {
      if (!groupedDepartments[parent]) {
        groupedDepartments[parent] = {
          name: parent,
          employees: 0,
          subOffices: [],
        };
      }

      groupedDepartments[parent].employees += dept.employees;
      groupedDepartments[parent].subOffices.push(dept);
    } else {
      mainDepartments.push(dept);
    }
  });
  
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
      
      {/* HEADER */}
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

          <span
            className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold border border-green-300"
            style={{ fontSize: "0.9rem" }}
          >
            <FileText size={16} className="shrink-0" />
            {fileName}
          </span>
        </div>
      </div>

      {/* GRID */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {Object.values(groupedDepartments).map((office, index) => {
            const isOpen = openOffice === office.name;

            return (
              <div
                key={index}
                className="border border-gray-200 rounded-xl overflow-hidden transition-all"
              >
                {/* MAIN OFFICE */}
                <button
                  onClick={() => toggleOffice(office.name)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-orange-50 group"
                >
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-500">
                      {office.name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {office.employees} employees
                    </p>
                  </div>

                  {isOpen ? (
                    <ChevronUp className="text-gray-500" />
                  ) : (
                    <ChevronDown className="text-gray-500" />
                  )}
                </button>

                {/* SUB OFFICES */}
                <div
                  className={`transition-all duration-300 ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  } overflow-hidden`}
                >
                  <div className="bg-gray-50 px-4 pb-4 space-y-2">
                    {office.subOffices.map((sub, i) => (
                      <button
                        key={i}
                        onClick={() => onSelect(sub)}
                        className="w-full text-left px-4 py-2 rounded-lg text-sm 
                        hover:bg-orange-100 hover:text-orange-600 transition"
                      >
                        {sub.name} ({sub.employees})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* NORMAL DEPARTMENTS */}
          {mainDepartments.map((dept, index) => (
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
