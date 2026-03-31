import React, { useState } from 'react';
import { ChevronLeft, Search } from 'lucide-react'; 

const mockEmployees = [
  { id: 52, name: "Luis Gabriel" },
  { id: 53, name: "Hazel Chavez" },
  { id: 54, name: "Jessie Tonongan" },
  { id: 57, name: "Maria Santos" },
  { id: 59, name: "Bernadette Salazar" },
  { id: 55, name: "Jisoo Kim" },
  { id: 51, name: "Mae Flores" },
  { id: 58, name: "Juan Luna" },
  { id: 50, name: "Jacob Reyes" },
  { id: 43, name: "Carmelo Castro" },
  { id: 47, name: "Jennie Kim" },
  { id: 48, name: "Casey Borrel" },
];

const EmployeeView = ({ departmentName, onBack, onSelectEmployee }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = mockEmployees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.id.toString().includes(searchTerm)
  );

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-5xl mx-auto border border-gray-100">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {departmentName} <span className="text-gray-400 mx-2">•</span> Employees
        </h2>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
        >
          <ChevronLeft size={18} /> 
          Back
        </button>
      </div>

      {/* Search Bar Section */}
      <div className="p-6 pb-2 flex items-center justify-between">
        <div className="relative w-full max-w-xl">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by BIO ID or Employee Name"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent sm:text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="text-gray-500 text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
          {filteredEmployees.length} employees
        </span>
      </div>

      {/* Table Section */}
      <div className="p-6">
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-xs font-bold tracking-wider">
                <th className="px-6 py-4 border-b border-gray-200 w-32">BIO ID</th>
                <th className="px-6 py-4 border-b border-gray-200">Employee Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.map((emp, index) => (
                <tr 
                  key={emp.id} 
                  onClick={() => onSelectEmployee(emp)}
                  className="cursor-pointer hover:bg-orange-50 transition-colors group"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-gray-500 group-hover:text-orange-600">
                    {emp.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                    {emp.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredEmployees.length === 0 && (
          <div className="py-12 text-center text-gray-400 bg-gray-50 rounded-lg mt-4 border border-dashed border-gray-300">
            No employees found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeView;