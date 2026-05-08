import { useEffect, useState } from "react";
import { Download } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function EmployeeDTR() {
  const [user, setUser] = useState(null);
  const [dtrRows, setDtrRows] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("2025-05");
  const [loading, setLoading] = useState(true);

  // Fetch DTR data
 useEffect(() => {
  const fetchDTR = async () => {
    setLoading(true);

    try {
      const [year, month] = selectedMonth.split("-");

      const res = await fetch(
        `${API_BASE_URL}/api/employee/dtr/view?month=${month}&year=${year}`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setDtrRows(data.dtr || []);
      } else {
        setDtrRows([]);
      }
    } catch (err) {
      console.error("Failed to load DTR:", err);
      setDtrRows([]);
    } finally {
      setLoading(false);
    }
  };

  fetchDTR();
}, [selectedMonth]);


  const employeeName = user?.name;
  const employeeId = user?.bio_id;

  return (
    <div className="p-6 w-full h-full bg-[#ECEEF3]">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

        {/* LEFT TITLE */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            DTR — {selectedMonth.replace("-", " ")}
          </h1>

          <p className="text-sm text-gray-600">
            {employeeName} · Employee ID: {employeeId}
          </p>
        </div>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-3">

          {/* MONTH SELECTOR */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white"
          >
            <option value="2025-05">May 2025</option>
            <option value="2025-04">April 2025</option>
            <option value="2025-03">March 2025</option>
          </select>

          {/* EXPORT BUTTON */}
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => window.print()}
          >
            <Download size={16} />
            Export PDF
          </button>

        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">

        <div className="overflow-auto max-h-[70vh]">

          <table className="w-full text-sm border-collapse">

            {/* HEADER */}
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr className="text-left text-gray-700">
                <th className="p-3">Date</th>
                <th className="p-3">Day</th>
                <th className="p-3">AM IN</th>
                <th className="p-3">AM OUT</th>
                <th className="p-3">PM IN</th>
                <th className="p-3">PM OUT</th>
                <th className="p-3">OT IN</th>
                <th className="p-3">OT OUT</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-4" colSpan="8">
                    Loading DTR...
                  </td>
                </tr>
              ) : dtrRows.length === 0 ? (
                <tr>
                  <td className="p-4 text-gray-500" colSpan="8">
                    No DTR records found.
                  </td>
                </tr>
              ) : (
                dtrRows.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-3">{row.date}</td>
                    <td className="p-3">{row.day}</td>
                    <td className="p-3">{row.am_in || "-"}</td>
                    <td className="p-3">{row.am_out || "-"}</td>
                    <td className="p-3">{row.pm_in || "-"}</td>
                    <td className="p-3">{row.pm_out || "-"}</td>
                    <td className="p-3">{row.ot_in || "-"}</td>
                    <td className="p-3">{row.ot_out || "-"}</td>
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