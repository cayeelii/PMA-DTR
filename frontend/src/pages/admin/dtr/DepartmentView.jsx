import React from "react";

const departments = Array(12).fill({ name: "AICTC", employees: 20 });

const DepartmentView = ({ fileName, onReset, onSelect }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-10 max-w-7xl mx-auto">
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
          <span className="bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-medium border border-green-200">
            {fileName}
          </span>
        </div>
      </div>

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
            <p className="text-gray-500 text-sm">{dept.employees} employees</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DepartmentView;
