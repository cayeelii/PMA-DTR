import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
    const [signatory, setSignatory] = useState(null); // ← NEW
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

    // FETCH DTR + profile + signatory
    useEffect(() => {
        if (!selectedMonth) return;

        const fetchDTR = async () => {
            setLoading(true);

            try {
                const [year, month] = selectedMonth.split("-");

                // ── 1. DTR rows ───────────────────────────────────────────────
                const res = await fetch(
                    `${API_BASE_URL}/api/employee/dtr/view?month=${Number(month)}&year=${year}`,
                    { credentials: "include" },
                );

                const data = await res.json();

                if (res.ok) {
                    // ── 2. User profile — DTR endpoint may include it; if not,
                    //       fall back to /api/auth/current-user which always does.
                    let userData = data.user || null;
                    if (!userData?.name && !userData?.username) {
                        try {
                            const profileRes = await fetch(
                                `${API_BASE_URL}/api/auth/current-user`,
                                { credentials: "include" },
                            );
                            const profileData = await profileRes.json();
                            if (profileRes.ok && profileData.user) {
                                userData = profileData.user;
                            }
                        } catch (e) {
                            console.error("Profile fallback failed:", e);
                        }
                    }
                    setUser(userData);

                    // ── 3. Signatory — use what the DTR endpoint returned;
                    //       if missing, fetch via the signatory endpoint using dept_id.
                    let sigData = data.signatory || null;
                    if (!sigData && userData?.dept_id) {
                        try {
                            const sigRes = await fetch(
                                `${API_BASE_URL}/api/dtr/signatory?dept_id=${userData.dept_id}`,
                                { credentials: "include" },
                            );
                            if (sigRes.ok) sigData = await sigRes.json();
                        } catch (e) {
                            console.error("Signatory fallback failed:", e);
                        }
                    }
                    setSignatory(sigData);

                    console.log("User resolved:", userData, "Signatory resolved:", sigData);

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

    // Handle both API shapes: name/username, dept_name/department
    const employeeName = user?.name || user?.username || "";
    const employeeId   = user?.bio_id || "";
    const deptName     = user?.dept_name || user?.department || "";

    // ── 1-column PDF export — mirrors ReportPreview exactly ──────────────────
    const exportToPDF = () => {
        try {
            const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

            // ── Date helpers ─────────────────────────────────────────────────
            const parseDate = (value) => {
                if (!value) return null;
                const parts = String(value).trim().split(/[/-]/);
                if (parts.length !== 3) return null;
                const m = Number(parts[0]);
                const d = Number(parts[1]);
                let   y = Number(parts[2]);
                if (!m || !d || !y) return null;
                if (y < 100) y += 2000;
                const parsed = new Date(y, m - 1, d);
                return Number.isNaN(parsed.getTime()) ? null : parsed;
            };

            const formatDateIso = (date) =>
                `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

            const validDates = dtrRows
                .map((r) => parseDate(r.date))
                .filter(Boolean)
                .sort((a, b) => a - b);

            const monthYear = validDates.length
                ? validDates[0].toLocaleString("en-US", { month: "long", year: "numeric" })
                : formatMonth(selectedMonth);

            const rangeText = validDates.length
                ? `${formatDateIso(validDates[0])} - ${formatDateIso(validDates[validDates.length - 1])}`
                : "-";

            const formatTimeForOneColumn = (value) => {
                if (!value) return "";
                const text = String(value).trim();
                if (!text || text === "-" || text === "--") return "";
                const match = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AP]M)?$/i);
                if (!match) return text;
                let hours = Number(match[1]);
                const minutes = match[2];
                const suffix  = match[3]?.toUpperCase();
                if (suffix === "AM" && hours === 12) hours = 0;
                else if (suffix === "PM" && hours !== 12) hours += 12;
                const twelveHour = ((hours + 11) % 12) + 1;
                return `${twelveHour}:${minutes}`;
            };

            const formatDateForOneColumn = (value) => {
                const parsed = parseDate(value);
                if (!parsed) return value || "";
                return `${parsed.getMonth() + 1}/${parsed.getDate()}/${parsed.getFullYear()}`;
            };

            // ── Header ───────────────────────────────────────────────────────
            doc.setLineWidth(0.4);
            doc.line(18, 13, 192, 13);

            doc.setFont(undefined, "bold");
            doc.setFontSize(10);
            doc.text(
                `DAILY TIME RECORD OF - ${String(monthYear).toUpperCase()}`,
                105, 18, { align: "center" },
            );

            doc.setLineWidth(0.25);
            doc.line(18, 20.2, 192, 20.2);

            doc.setFont(undefined, "normal");
            doc.setFontSize(8);
            doc.text(`Statistics Date: ${rangeText}`, 19.2, 23.1);
            doc.text(`Office: ${deptName || "-"}`, 192, 23.1, { align: "right" });

            doc.setLineWidth(0.25);
            doc.line(18, 25.0, 192, 25.0);
            doc.text(`Name: ${employeeName || "-"}`, 19.2, 28.0);
            doc.line(18, 29.5, 192, 29.5);

            // ── Table ────────────────────────────────────────────────────────
            const marginLeft = 18;
            const tableWidth = 192 - marginLeft;

            autoTable(doc, {
                startY: 39.5,
                head: [[
                    { content: "Date", styles: { halign: "left" } },
                    "AM IN", "AM OUT", "PM IN", "PM OUT", "OT IN", "OT OUT",
                ]],
                body: dtrRows.map((row) => [
                    formatDateForOneColumn(row.date),
                    formatTimeForOneColumn(row.am_in),
                    formatTimeForOneColumn(row.am_out),
                    formatTimeForOneColumn(row.pm_in),
                    formatTimeForOneColumn(row.pm_out),
                    formatTimeForOneColumn(row.ot_in),
                    formatTimeForOneColumn(row.ot_out),
                ]),
                margin: { left: marginLeft },
                tableWidth,
                styles: { fontSize: 7, cellPadding: 1.2, halign: "center", lineWidth: 0, lineColor: 0 },
                headStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: "bold", lineWidth: 0, lineColor: 0 },
                bodyStyles: { lineWidth: 0, lineColor: 0 },
                columnStyles: {
                    0: { halign: "left", cellWidth: 27 },
                    1: { cellWidth: 24.5 },
                    2: { cellWidth: 24.5 },
                    3: { cellWidth: 24.5 },
                    4: { cellWidth: 24.5 },
                    5: { cellWidth: 24.5 },
                    6: { cellWidth: 24.5 },
                },
                theme: "plain",
                didParseCell: (data) => {
                    if (data.section === "head" && data.column.index === 0) {
                        data.cell.styles.halign = "left";
                    }
                },
                didDrawCell: (data) => {
                    if (
                        (data.section === "head" || data.section === "body") &&
                        data.column.index === data.table.columns.length - 1
                    ) {
                        const y = data.cell.y + data.cell.height;
                        doc.setLineWidth(0.2);
                        doc.line(marginLeft, y, marginLeft + tableWidth, y);
                    }
                },
            });

            // ── Signatures ───────────────────────────────────────────────────
            const finalY = doc.lastAutoTable?.finalY || 38;
            let signatureY = finalY + 32;
            if (signatureY > doc.internal.pageSize.getHeight() - 30) {
                doc.addPage();
                signatureY = 40;
            }

            const leftStart = 26, leftEnd = 86;
            const rightStart = 124, rightEnd = 184;

            doc.setLineWidth(0.3);
            doc.line(leftStart, signatureY, leftEnd, signatureY);
            doc.line(rightStart, signatureY, rightEnd, signatureY);

            doc.setFontSize(8);
            doc.setFont(undefined, "bold");

            // Employee name above left line
            doc.text(
                employeeName || "Employee",
                (leftStart + leftEnd) / 2, signatureY - 2,
                { align: "center" },
            );

            // Signatory name above right line — same as ReportPreview
            const supervisorName = signatory
                ? `${signatory.position || ""} ${signatory.head_name || ""}`.trim()
                : "";
            doc.text(
                supervisorName,
                (rightStart + rightEnd) / 2, signatureY - 2,
                { align: "center" },
            );

            doc.setFont(undefined, "normal");
            doc.text("Employee Signature", (leftStart + leftEnd) / 2,  signatureY + 5, { align: "center" });
            doc.text("Supervisor",         (rightStart + rightEnd) / 2, signatureY + 5, { align: "center" });

            doc.save(`${employeeName || "DTR"}_${monthYear}_Report.pdf`);
        } catch (error) {
            console.error("PDF export failed:", error);
        }
    };

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
                    onClick={exportToPDF}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
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
                                        <td className="p-3 text-center">{row.date}</td>
                                        <td className="p-3 text-center">{row.day}</td>
                                        <td className="p-3 text-center">{row.am_in}</td>
                                        <td className="p-3 text-center">{row.am_out}</td>
                                        <td className="p-3 text-center">{row.pm_in}</td>
                                        <td className="p-3 text-center">{row.pm_out}</td>
                                        <td className="p-3 text-center">{row.ot_in}</td>
                                        <td className="p-3 text-center">{row.ot_out}</td>
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
