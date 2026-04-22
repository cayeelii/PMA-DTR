import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, Save, FileText } from "lucide-react";

const DTREditView = ({ employee, onBack, onGenerateReport }) => {
  const [dtrEntries, setDtrEntries] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const formatTime = (time) => {
    if (!time) return "";

    let [hour, minute, second] = time.split(":");
    hour = parseInt(hour);

    const suffix = hour >= 12 ? "PM" : "AM";
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;

    return `${hour.toString().padStart(2, "0")}:${minute}:${second} ${suffix}`;
  };

  const convertTo24Hour = (time) => {
    if (!time || typeof time !== "string") return null;

    let t = time.trim().toUpperCase();

    // Fix missing space (07:30:15PM → 07:30:15 PM)
    t = t.replace(/(AM|PM)/, " $1");

    const parts = t.split(" ");
    if (parts.length < 1) return null;

    let [hours, minutes, seconds] = parts[0].split(":");
    let modifier = parts[1] || null;

    hours = parseInt(hours);
    minutes = parseInt(minutes);
    seconds = seconds ? parseInt(seconds) : 0;

    if (isNaN(hours) || isNaN(minutes)) return null;

    if (!modifier) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const loadDTR = useCallback(async () => {
    try {
      const bioId = employee?.bio_id || employee?.id;
      if (!bioId) return;

      const month = 2;
      const year = 2026;

      const url = `${API_BASE_URL}/api/dtr/employee-dtr?bio_id=${bioId}&month=${month}&year=${year}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!Array.isArray(data)) return;

      const formatted = data
        .map((row) => {
          const dateObj = new Date(row.date);
          if (isNaN(dateObj.getTime())) return null;

          return {
            rawDate: row.date,
            date: `${(dateObj.getMonth() + 1)
              .toString()
              .padStart(2, "0")}/${dateObj
              .getDate()
              .toString()
              .padStart(2, "0")}/${dateObj.getFullYear().toString().slice(-2)}`,

            day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
              dateObj.getDay()
            ],

            amIn: formatTime(row.amIn),
            amOut: formatTime(row.amOut),
            pmIn: formatTime(row.pmIn),
            pmOut: formatTime(row.pmOut),
            otIn: formatTime(row.otIn),
            otOut: formatTime(row.otOut),
          };
        })
        .filter(Boolean);

      setDtrEntries(formatted);
    } catch (err) {
      console.error("LOAD DTR ERROR:", err);
    }
  }, [employee, API_BASE_URL]);

  useEffect(() => {
    loadDTR();
  }, [loadDTR]);

  const handleInputChange = (index, field, value) => {
    const updated = [...dtrEntries];
    updated[index][field] = value;
    setDtrEntries(updated);
  };

  const handleSaveClick = async () => {
    try {
      const bioId = employee?.bio_id || employee?.id;

      const payload = dtrEntries.map((entry) => ({
        bio_id: bioId,
        date: entry.rawDate ? entry.rawDate.split("T")[0] : null,
        amIn: convertTo24Hour(entry.amIn),
        amOut: convertTo24Hour(entry.amOut),
        pmIn: convertTo24Hour(entry.pmIn),
        pmOut: convertTo24Hour(entry.pmOut),
        otIn: convertTo24Hour(entry.otIn),
        otOut: convertTo24Hour(entry.otOut),
      }));

      const res = await fetch(`${API_BASE_URL}/api/dtr/update-dtr`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.details || data.error);

      alert("Saved successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-6xl mx-auto border border-gray-100 flex flex-col h-[calc(80vh-80px)] min-h-[300px]">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              {employee?.name}
              <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
                {employee?.departmentName}
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveClick}
            className="flex items-center gap-2 bg-[#449d44] hover:bg-[#398439] text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-sm active:scale-95"
          >
            <Save size={18} /> Save changes
          </button>
          <button
            className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-lg font-semibold transition-all active:scale-95"
            onClick={() => onGenerateReport && onGenerateReport(dtrEntries)}
          >
            <FileText size={18} /> Generate Report
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-auto p-6 pt-2">
        <div className="inline-block min-w-full align-middle">
          <table className="w-full text-center border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-100 text-gray-500 uppercase text-[11px] font-bold tracking-widest">
                <th className="sticky top-0 z-20 bg-gray-100 py-4 px-2 border-b border-gray-200 first:rounded-tl-lg">
                  Date
                </th>
                <th className="sticky top-0 z-20 bg-gray-100 py-4 px-2 border-b border-gray-200">
                  Day
                </th>
                <th className="sticky top-0 z-20 bg-gray-100 py-4 px-2 border-b border-gray-200">
                  AM IN
                </th>
                <th className="sticky top-0 z-20 bg-gray-100 py-4 px-2 border-b border-gray-200">
                  AM OUT
                </th>
                <th className="sticky top-0 z-20 bg-gray-100 py-4 px-2 border-b border-gray-200">
                  PM IN
                </th>
                <th className="sticky top-0 z-20 bg-gray-100 py-4 px-2 border-b border-gray-200">
                  PM OUT
                </th>
                <th className="sticky top-0 z-20 bg-gray-100 py-4 px-2 border-b border-gray-200">
                  OT IN
                </th>
                <th className="sticky top-0 z-20 bg-gray-100 py-4 px-2 border-b border-gray-200 last:rounded-tr-lg">
                  OT OUT
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {dtrEntries.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-5 text-gray-400">
                    No DTR data found
                  </td>
                </tr>
              )}

              {dtrEntries.map((entry, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 text-sm font-medium text-gray-700 whitespace-nowrap">
                    {entry.date}
                  </td>
                  <td className="py-3 text-sm text-gray-700">{entry.day}</td>

                  {["amIn", "amOut", "pmIn", "pmOut", "otIn", "otOut"].map(
                    (field) => (
                      <td key={`${field}-${idx}`}>
                        <input
                          type="text"
                          value={entry[field] || ""}
                          onChange={(e) =>
                            handleInputChange(idx, field, e.target.value)
                          }
                          className="w-24 text-center py-1.5 border border-gray-200 rounded-full text-[11px] font-semibold text-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none bg-white transition-all shadow-sm"
                        />
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DTREditView;
