import React from "react";
import { ChevronLeft } from "lucide-react";

export default function ReportPreview({ onBack, dtrRows = [], employee }) {
  return (
    <div>
      {/* Report Card */}
      <div className="bg-white rounded-xl shadow p-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-3">
          <div className="flex items-center gap-2">
            <button className="text-gray-500 hover:text-blue-900 p-1 rounded-full" onClick={onBack}>
              <ChevronLeft size={22} />
            </button>
            <span className="font-semibold text-lg">Report Preview</span>
            <span className="ml-2 text-xs text-gray-400">OMA1</span>
          </div>
          <div className="flex gap-2">
            <button className="border border-green-600 text-green-600 px-4 py-1 rounded hover:bg-green-50 text-sm font-medium">
              Export XLSX
            </button>
            <button className="border border-gray-400 text-gray-700 px-4 py-1 rounded hover:bg-gray-100 text-sm font-medium">
              Export PDF
            </button>
          </div>
        </div>
        {/* Report Info */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex-1">
            <div className="text-center">
              <div className="text-sm font-medium">Monthly Daily Time Record</div>
              <div className="text-xs text-gray-500">For the Month of MARCH 2026</div>
            </div>
            <div className="text-xs mt-2">Name: <span className="font-semibold">{employee?.name || '—'}</span></div>
          </div>
          <div className="text-xs">Office: <span className="font-semibold">{employee?.departmentName || '—'}</span></div>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border-separate border-spacing-0 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gray-100 text-gray-700 font-semibold">
                <th className="px-4 py-2 text-left rounded-tl-lg">Date</th>
                <th className="px-4 py-2 text-left">Day</th>
                <th className="px-4 py-2 text-left">AM IN</th>
                <th className="px-4 py-2 text-left">AM OUT</th>
                <th className="px-4 py-2 text-left">PM IN</th>
                <th className="px-4 py-2 text-left">PM OUT</th>
                <th className="px-4 py-2 text-left">OT IN</th>
                <th className="px-4 py-2 text-left rounded-tr-lg">OT OUT</th>
              </tr>
            </thead>
            <tbody>
              {dtrRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2 border-t border-gray-200 text-left font-medium text-gray-700">{row.date}</td>
                  <td className="px-4 py-2 border-t border-gray-200 text-left">{row.day}</td>
                  <td className="px-4 py-2 border-t border-gray-200 text-left">{row.amIn}</td>
                  <td className="px-4 py-2 border-t border-gray-200 text-left">{row.amOut}</td>
                  <td className="px-4 py-2 border-t border-gray-200 text-left">{row.pmIn}</td>
                  <td className="px-4 py-2 border-t border-gray-200 text-left">{row.pmOut}</td>
                  <td className="px-4 py-2 border-t border-gray-200 text-left">{row.otIn}</td>
                  <td className="px-4 py-2 border-t border-gray-200 text-left">{row.otOut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
