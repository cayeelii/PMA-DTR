import { useState, useEffect } from "react";
import { X } from "lucide-react";

/**
 * @param {string} mode — "holiday" | "half-day"
 * @param {function} onClose
 * @param {function} onAdd
 */
function MaintenanceModal({ mode, onClose, onAdd }) {
    const isHoliday = mode === "holiday";
    const today = new Date();

    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        setSelectedDate(null);
    }, [mode]);

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
        return `${year}-${mm}-${dd}`;
    };

    const handleSubmit = () => {
        if (!selectedDate) {
            alert("Please select a date from the calendar.");
            return;
        }

        if (isHoliday) {
            onAdd({ date: formatDate(selectedDate) });
        } else {
            onAdd({
                date: formatDate(selectedDate),
            });
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-[380px] rounded-xl shadow-xl">
                <div className="flex justify-between items-center border-b px-4 py-3">
                    <h2 className="text-lg font-semibold capitalize">
                        {isHoliday ? "Add Holiday" : "Add Half-Day"}
                    </h2>
                    <X
                        onClick={onClose}
                        className="cursor-pointer text-gray-500 hover:text-gray-700"
                    />
                </div>

                <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                        >
                            ◀
                        </button>
                        <div className="font-medium text-md">
                            {monthNames[month]} {year}
                        </div>
                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                        >
                            ▶
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {daysOfWeek.map((day) => (
                            <div key={day} className="font-medium text-gray-500">
                                {day}
                            </div>
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
                                        isSelected
                                            ? "bg-blue-900 text-white"
                                            : "hover:bg-gray-100"
                                    }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {selectedDate && (
                        <div className="mt-3 space-y-3">
                            <div
                                className={`font-medium text-sm ${
                                    isHoliday
                                        ? "text-blue-700"
                                        : "text-amber-700"
                                }`}
                            >
                                Selected: {formatDate(selectedDate)} •{" "}
                                {isHoliday ? "Holiday" : "Half-day"}
                            </div>
                        </div>
                    )}
                </div>

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
