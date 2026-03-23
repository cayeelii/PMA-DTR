import { useState } from "react";
import { Trash2 } from "lucide-react";

function MaintenancePage() {
  const [rows, setRows] = useState([
    { id: 1, date: "01/01/26", remarks: "Holiday" },
    { id: 2, date: "02/13/26", remarks: "Half-day" },
    { id: 3, date: "02/17/26", remarks: "Holiday" },
  ]);

  const removeRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  return (
    <div className="relative bg-surface w-full text-theme p-2 pt-2 overflow-y-hidden">
      <div className="p-1 md:p-5 md:mt-0">
        {/* Page Header */}
        <div className="flex flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            Maintenance
          </h1>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg md:text-xl font-semibold">
            Holidays and Half-Days
          </h2>

          <div className="flex gap-3">
            <button className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium shadow">
              Add Holiday
            </button>
            <button className="bg-amber-400 hover:bg-amber-500 text-gray-900 px-4 py-2 rounded-lg font-medium shadow">
              Add Half-day
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="text-center px-8 py-3 font-semibold">Date</th>
                <th className="text-center px-10 py-3 font-semibold">
                  Remarks
                </th>
                <th className="text-center px-11 py-3 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`border-t ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition`}
                >
                  <td className="text-center px-8 py-3">{row.date}</td>
                  <td className="text-center px-10 py-3">{row.remarks}</td>
                  <td className="px-6 py-3 text-center">
                    <button
                      onClick={() => removeRow(row.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center py-6 text-gray-400 italic"
                  >
                    No records available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MaintenancePage;