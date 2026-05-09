import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function EmployeeDTR() {
    const [searchParams] = useSearchParams();

    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");

    const yearParam = searchParams.get("year") || currentYear;

    const monthParam = String(
        searchParams.get("month") || currentMonth,
    ).padStart(2, "0");

    const [user, setUser] = useState(null);
    const [dtrRows, setDtrRows] = useState([]);
    const [selectedMonth] = useState(`${yearParam}-${monthParam}`);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDTR = async () => {
            setLoading(true);

            try {
                const [year, month] = selectedMonth.split("-");

                const res = await fetch(
                    `${API_BASE_URL}/api/employee/dtr/view?month=${Number(month)}&year=${year}`,
                    {
                        credentials: "include",
                    },
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

    const formatMonth = (value) => {
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
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    <Download size={16} />
                    Export PDF
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-auto max-h-[70vh]">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
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

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="p-4">
                                        Loading...
                                    </td>
                                </tr>
                            ) : dtrRows.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-4">
                                        No DTR records found.
                                    </td>
                                </tr>
                            ) : (
                                dtrRows.map((row, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="p-3">{row.date}</td>
                                        <td className="p-3">{row.day}</td>
                                        <td className="p-3">
                                            {row.am_in || "-"}
                                        </td>
                                        <td className="p-3">
                                            {row.am_out || "-"}
                                        </td>
                                        <td className="p-3">
                                            {row.pm_in || "-"}
                                        </td>
                                        <td className="p-3">
                                            {row.pm_out || "-"}
                                        </td>
                                        <td className="p-3">
                                            {row.ot_in || "-"}
                                        </td>
                                        <td className="p-3">
                                            {row.ot_out || "-"}
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
