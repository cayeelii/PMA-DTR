import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Converts date safely into local date
function parseLocalDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
}

// Creates complete calendar rows for the month
function buildCalendarMonth(year, month, existingRows) {
    const rowsMap = new Map();

    existingRows.forEach((row) => {
        rowsMap.set(row.rawDate, row);
    });

    const totalDays = new Date(year, month, 0).getDate();
    const calendarRows = [];

    for (let day = 1; day <= totalDays; day++) {
        const dateObj = new Date(year, month - 1, day);

        const rawDate = `${year}-${String(month).padStart(2, "0")}-${String(
            day,
        ).padStart(2, "0")}`;

        const formattedDate = `${String(month).padStart(2, "0")}/${String(
            day,
        ).padStart(2, "0")}/${String(year).slice(-2)}`;

        if (rowsMap.has(rawDate)) {
            calendarRows.push(rowsMap.get(rawDate));
        } else {
            calendarRows.push({
                rawDate,
                date: formattedDate,
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

    return calendarRows;
}

export default function EmployeeDTR() {
    const [searchParams] = useSearchParams();

    const [user, setUser] = useState(null);
    const [dtrRows, setDtrRows] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadInitialMonth = async () => {
            const yearParam = searchParams.get("year");
            const monthParam = searchParams.get("month");

            // Get month-year from URL query first
            if (yearParam && monthParam) {
                if (isMounted) {
                    setSelectedMonth(
                        `${yearParam}-${String(monthParam).padStart(2, "0")}`,
                    );
                }
                return;
            }

            // DB fallback
            try {
                const res = await fetch(
                    `${API_BASE_URL}/api/employee/dtr/latest-month`,
                    { credentials: "include" },
                );

                const data = await res.json();

                if (data?.year && data?.month && isMounted) {
                    setSelectedMonth(
                        `${data.year}-${String(data.month).padStart(2, "0")}`,
                    );
                    return;
                }
            } catch (err) {
                console.error(err);
            }

            // Final fallback to current month-year
            if (isMounted) {
                const now = new Date();
                setSelectedMonth(
                    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
                );
            }
        };

        loadInitialMonth();

        return () => {
            isMounted = false;
        };
    }, [searchParams]);

    // FETCH DTR
    useEffect(() => {
        if (!selectedMonth) return;

        const fetchDTR = async () => {
            setLoading(true);

            try {
                const [year, month] = selectedMonth.split("-");

                const res = await fetch(
                    `${API_BASE_URL}/api/employee/dtr/view?month=${Number(month)}&year=${year}`,
                    { credentials: "include" },
                );

                const data = await res.json();

                if (res.ok) {
                    setUser(data.user);

                    const formattedRows = (data.dtr || []).map((row) => {
                        const rawDate = row.rawDate || row.date;

                        const dateObj = parseLocalDate(rawDate);

                        return {
                            rawDate,
                            date: `${String(dateObj.getMonth() + 1).padStart(2, "0")}/${String(dateObj.getDate()).padStart(2, "0")}/${String(dateObj.getFullYear()).slice(-2)}`,
                            day: DAY_LABELS[dateObj.getDay()],
                            am_in: row.am_in || "",
                            am_out: row.am_out || "",
                            pm_in: row.pm_in || "",
                            pm_out: row.pm_out || "",
                            ot_in: row.ot_in || "",
                            ot_out: row.ot_out || "",
                        };
                    });

                    const fullCalendarRows = buildCalendarMonth(
                        Number(year),
                        Number(month),
                        formattedRows,
                    );

                    setDtrRows(fullCalendarRows);
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

    const formatMonth = (value) => {
        if (!value) return "No DTR Available";

        const [year, month] = value.split("-");

        return new Date(year, month - 1).toLocaleString("en-US", {
            month: "long",
            year: "numeric",
        });
    };

    return (
        <div className="p-6 w-full h-full bg-[#ECEEF3]">
            {/* HEADER */}
            <div className="flex justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        DTR — {formatMonth(selectedMonth)}
                    </h1>

                    <p className="text-sm text-gray-600">
                        {employeeName} · Employee ID: {employeeId}
                    </p>
                </div>

                <button
                    onClick={() => window.print()}
                    className=" inline-flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
                >
                    <Download size={16} />
                    Export PDF
                </button>
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
