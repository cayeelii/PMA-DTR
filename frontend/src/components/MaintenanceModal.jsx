import { useState, useEffect } from "react";
import { X } from "lucide-react";

/**
 * @param {string} mode — "holiday" | "half-day"
 * @param {function} onClose
 * @param {function} onAdd
 */
const DEFAULT_HOLIDAY_TIMES = {
    am_in: "08:00",
    am_out: "12:00",
    pm_in: "13:00",
    pm_out: "17:00",
};

function MaintenanceModal({ mode, onClose, onAdd }) {
    const isHoliday = mode === "holiday";
    const today = new Date();

    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState(null);
    const [holidayTimes, setHolidayTimes] = useState(() => ({
        ...DEFAULT_HOLIDAY_TIMES,
    }));

    useEffect(() => {
        setSelectedDate(null);
        setHolidayTimes({ ...DEFAULT_HOLIDAY_TIMES });
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
            onAdd({
                date: formatDate(selectedDate),
                am_in: holidayTimes.am_in,
                am_out: holidayTimes.am_out,
                pm_in: holidayTimes.pm_in,
                pm_out: holidayTimes.pm_out,
            });
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

                            {isHoliday && (
                                <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-3 space-y-2">
                                    <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
                                        Holiday times (DTR)
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            ["am_in", "AM In"],
                                            ["am_out", "AM Out"],
                                            ["pm_in", "PM In"],
                                            ["pm_out", "PM Out"],
                                        ].map(([key, label]) => (
                                            <label
                                                key={key}
                                                className="flex flex-col gap-1 text-[11px] font-medium text-gray-600"
                                            >
                                                {label}
                                                <input
                                                    type="time"
                                                    step={60}
                                                    value={
                                                        holidayTimes[key] ?? ""
                                                    }
                                                    onChange={(e) =>
                                                        setHolidayTimes((t) => ({
                                                            ...t,
                                                            [key]: e.target
                                                                .value,
                                                        }))
                                                    }
                                                    className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
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
