import React, { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildCalendarMonth(year, month, existingRows) {
    const rowsMap = new Map();

    // normalize backend rows into map
    existingRows.forEach((row) => {
        rowsMap.set(row.date, row);
    });

    const totalDays = new Date(year, month, 0).getDate();
    const result = [];

    for (let day = 1; day <= totalDays; day++) {
        const dateObj = new Date(year, month - 1, day);

        const rawDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        if (rowsMap.has(rawDate)) {
            result.push(rowsMap.get(rawDate));
        } else {
            result.push({
                date: rawDate,
                day: DAY_LABELS[dateObj.getDay()],
                am_in: "",
                am_out: "",
                pm_in: "",
                pm_out: "",
                ot_in: "",
                ot_out: "",
            });
        }
    }

    return result;
}

const EmployeeDTRView = ({ employee, onBack }) => {
    const [months, setMonths] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [dtrRows, setDtrRows] = useState([]);
    const [loading, setLoading] = useState(false);

    // FETCH AVAILABLE MONTHS
   useEffect(() => {
    if (!employee?.bio_id) return;

    const fetchMonths = async () => {
        try {
            const res = await fetch(
                `${API_BASE_URL}/api/supervisor/available-months?bio_id=${employee.bio_id}`,
                { credentials: "include" }
            );

            if (!res.ok) {
                console.error("Failed months API:", await res.text());
                return;
            }

            const data = await res.json();

            setMonths(data || []);

            if (data.length > 0) {
                const first = data[0];
                setSelectedMonth(
                    `${first.year}-${String(first.month).padStart(2, "0")}`
                );
            }

        } catch (err) {
            console.error("Month fetch error:", err);
        }
    };

    fetchMonths();
}, [employee]);

    // FETCH DTR
 useEffect(() => {
    if (!selectedMonth || !employee?.bio_id) return;

    const fetchDTR = async () => {
        setLoading(true);

        try {
            const [year, month] = selectedMonth.split("-");

            const res = await fetch(
                `${API_BASE_URL}/api/supervisor/view?bio_id=${employee.bio_id}&month=${month}&year=${year}`,
                { credentials: "include" }
            );

            const data = await res.json();

            // IMPORTANT: normalize DB output → frontend format
            const formatted = (data.dtr || []).map((row) => ({
                date: row.date, // already formatted YYYY-MM-DD from backend
                day: new Date(row.date).toLocaleDateString("en-US", {
                    weekday: "short",
                }),
                am_in: row.am_in || "",
                am_out: row.am_out || "",
                pm_in: row.pm_in || "",
                pm_out: row.pm_out || "",
                ot_in: row.ot_in || "",
                ot_out: row.ot_out || "",
            }));

            // fill missing days
            const fullCalendar = buildCalendarMonth(
                Number(year),
                Number(month),
                formatted
            );

            setDtrRows(fullCalendar);

        } catch (err) {
            console.error("DTR fetch error:", err);
            setDtrRows([]);
        } finally {
            setLoading(false);
        }
    };

    fetchDTR();
}, [selectedMonth, employee]);

    return (
        <div className="w-full h-full bg-[#ECEEF3] p-6">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">

                {/* BACK BUTTON */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-blue-700 font-medium"
                >
                    <ChevronLeft size={18} />
                    Back
                </button>

                <div className="text-center">
                    <h2 className="text-xl font-bold">
                        {employee.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {employee.bio_id}
                    </p>
                </div>

                {/* MONTH DROPDOWN */}
                <select
                    className="border px-3 py-2 rounded-lg"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                >
                    {months.map((m, i) => {
                        const value = `${m.year}-${String(m.month).padStart(2, "0")}`;

                        return (
                            <option key={i} value={value}>
                                {new Date(m.year, m.month - 1).toLocaleString("en-US", {
                                    month: "long",
                                    year: "numeric"
                                })}
                            </option>
                        );
                    })}
                </select>

            </div>

            {/* TABLE */}
 <div className="flex justify-center items-center overflow-hidden">
                <div className="bg-white rounded-xl shadow-md overflow-auto w-[150vh] max-h-[80vh]">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr>
                                <th className="sticky top-0 bg-gray-100 z-10 p-3 text-center">
                                    Date
                                </th>
                                <th className="sticky top-0 bg-gray-100 z-10 p-3 text-center">
                                    Day
                                </th>
                                <th className="sticky top-0 bg-gray-100 z-10 p-3 text-center">
                                    AM IN
                                </th>
                                <th className="sticky top-0 bg-gray-100 z-10 p-3 text-center">
                                    AM OUT
                                </th>
                                <th className="sticky top-0 bg-gray-100 z-10 p-3 text-center">
                                    PM IN
                                </th>
                                <th className="sticky top-0 bg-gray-100 z-10 p-3 text-center">
                                    PM OUT
                                </th>
                                <th className="sticky top-0 bg-gray-100 z-10 p-3 text-center">
                                    OT IN
                                </th>
                                <th className="sticky top-0 bg-gray-100 z-10 p-3 text-center">
                                    OT OUT
                                </th>
                            </tr>
                        </thead>
                    <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="p-4 text-center">
                                        Loading...
                                    </td>
                                </tr>
                            ) : dtrRows.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-4 text-center">
                                        No DTR records found.
                                    </td>
                                </tr>
                            ) : (
                                dtrRows.map((row, index) => (
                                    <tr
                                        key={index}
                                        className="border-b hover:bg-gray-50 text-slate-900 text-[15px] leading-relaxed tracking-wide"
                                    >
                                        <td className="p-3 text-center">
                                            {row.date}
                                        </td>

                                        <td className="p-3 text-center">
                                            {row.day}
                                        </td>

                                        <td className="p-3 text-center">
                                            {row.am_in}
                                        </td>

                                        <td className="p-3 text-center">
                                            {row.am_out}
                                        </td>

                                        <td className="p-3 text-center">
                                            {row.pm_in}
                                        </td>

                                        <td className="p-3 text-center">
                                            {row.pm_out}
                                        </td>

                                        <td className="p-3 text-center">
                                            {row.ot_in}
                                        </td>

                                        <td className="p-3 text-center">
                                            {row.ot_out}
                                        </td>
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

export default EmployeeDTRView;