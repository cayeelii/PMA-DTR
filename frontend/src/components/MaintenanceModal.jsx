import { useState, useEffect } from "react";
import { X } from "lucide-react";

/**
 * @param {string} mode 
 * @param {function} onClose
 * @param {function} onAdd 
 */
function MaintenanceModal({ mode, onClose, onAdd }) {
  const isHoliday = mode === "holiday";
  const today = new Date();
  
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  const [times, setTimes] = useState({
    amIn: "08:00 AM",
    amOut: "12:00 PM",
    pmIn: "01:00 PM",
    pmOut: "05:00 PM"
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const formatDate = (day) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const yyyy = String(year);
    return `${year}-${mm}-${dd}`; 
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setTimes((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!selectedDate) {
      alert("Please select a date from the calendar.");
      return;
    }

    // Call the parent function to add the row
    onAdd({
      date: formatDate(selectedDate),
      times: times
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[380px] rounded-xl shadow-xl">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b px-4 py-3">
          <h2 className="text-lg font-semibold capitalize">
            {isHoliday ? "Add Holiday" : "Add Half-Day"}
          </h2>
          <X onClick={onClose} className="cursor-pointer text-gray-500 hover:text-gray-700" />
        </div>

        <div className="p-4">
          {/* Month Navigation */}
          <div className="flex justify-between items-center mb-3">
            <button onClick={handlePrevMonth} className="px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200">◀</button>
            <div className="font-medium text-md">{monthNames[month]} {year}</div>
            <button onClick={handleNextMonth} className="px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200">▶</button>
          </div>

          {/* Calendar */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {daysOfWeek.map((day) => (
              <div key={day} className="font-medium text-gray-500">{day}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={"empty-" + i}></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = selectedDate === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={`py-1 rounded-lg text-xs transition-colors ${
                    isSelected ? "bg-blue-900 text-white" : "hover:bg-gray-100"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <>
              <div className={`mt-3 font-medium text-sm ${isHoliday ? "text-orange-600" : "text-green-600"}`}>
                Selected: {formatDate(selectedDate)} • {isHoliday ? "Holiday" : "Half-Day"}
              </div>

              {/* Time Inputs */}
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <h3 className="font-medium mb-1 text-gray-600 border-b pb-1">AM</h3>
                  <label className="block text-[10px] text-gray-400 uppercase mt-1">In</label>
                  <input
                    type="text"
                    name="amIn"
                    value={times.amIn}
                    onChange={handleTimeChange}
                    className="w-full border rounded px-2 py-1 mb-2 bg-gray-50 focus:bg-white outline-blue-900"
                  />
                  <label className="block text-[10px] text-gray-400 uppercase">Out</label>
                  <input
                    type="text"
                    name="amOut"
                    value={times.amOut}
                    onChange={handleTimeChange}
                    className="w-full border rounded px-2 py-1 bg-gray-50 focus:bg-white outline-blue-900"
                  />
                </div>
                <div>
                  <h3 className="font-medium mb-1 text-gray-600 border-b pb-1">PM</h3>
                  <label className="block text-[10px] text-gray-400 uppercase mt-1">In</label>
                  <input
                    type="text"
                    name="pmIn"
                    value={times.pmIn}
                    onChange={handleTimeChange}
                    className="w-full border rounded px-2 py-1 mb-2 bg-gray-50 focus:bg-white outline-blue-900"
                  />
                  <label className="block text-[10px] text-gray-400 uppercase">Out</label>
                  <input
                    type="text"
                    name="pmOut"
                    value={times.pmOut}
                    onChange={handleTimeChange}
                    className="w-full border rounded px-2 py-1 bg-gray-50 focus:bg-white outline-blue-900"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3 flex justify-end">
          <button 
            type="button"
            onClick={handleSubmit}
            className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all active:scale-95"
          >
            Save {isHoliday ? "Holiday" : "Half-Day"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MaintenanceModal;