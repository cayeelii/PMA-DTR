import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, Save, FileText } from "lucide-react";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

///Parse YYYY-MM-DD as a local calendar date
function parseLocalDateOnly(value) {
    const part = String(value ?? "").split("T")[0];
    const [y, m, d] = part.split("-").map((x) => parseInt(x, 10));
    if (
        Number.isNaN(y) ||
        Number.isNaN(m) ||
        Number.isNaN(d) ||
        m < 1 ||
        m > 12
    ) {
        return null;
    }
    const dateObj = new Date(y, m - 1, d);
    return Number.isNaN(dateObj.getTime()) ? null : dateObj;
}

//Fill calendar gaps in the editor 
function mergeDtrWithFullCalendarRange(formattedRows) {
    if (!formattedRows.length) return formattedRows;

    const byKey = new Map();
    for (const row of formattedRows) {
        const key = String(row.rawDate ?? "").split("T")[0];
        if (key) byKey.set(key, row);
    }

    const sortedKeys = [...byKey.keys()].sort();
    const minD = parseLocalDateOnly(sortedKeys[0]);
    const maxD = parseLocalDateOnly(sortedKeys[sortedKeys.length - 1]);
    if (!minD || !maxD) return formattedRows;

    const rangeStart = new Date(
        minD.getFullYear(),
        minD.getMonth(),
        1,
    );
    const rangeEnd = new Date(maxD.getFullYear(), maxD.getMonth() + 1, 0);

    const out = [];
    for (
        let d = new Date(rangeStart);
        d <= rangeEnd;
        d.setDate(d.getDate() + 1)
    ) {
        const y = d.getFullYear();
        const mo = d.getMonth() + 1;
        const da = d.getDate();
        const key = `${y}-${String(mo).padStart(2, "0")}-${String(da).padStart(2, "0")}`;
        if (byKey.has(key)) {
            out.push(byKey.get(key));
        } else {
            out.push({
                rawDate: key,
                date: `${String(mo).padStart(2, "0")}/${String(da).padStart(2, "0")}/${String(y).slice(-2)}`,
                day: DAY_LABELS[d.getDay()],
                amIn: "",
                amOut: "",
                pmIn: "",
                pmOut: "",
                otIn: "",
                otOut: "",
            });
        }
    }
    return out;
}

const DTREditView = ({ employee, batchId, onBack, onGenerateReport }) => {
    const [dtrEntries, setDtrEntries] = useState([]);
    const [initialEntries, setInitialEntries] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const editingRef = useRef(null);
    editingRef.current = editing;
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const formatTime = (time) => {
        if (!time) return "";
        if (typeof time === "string") {
            time = time.split(".")[0];
        }

        let [hour, minute, second] = String(time).split(":");
        second = (second != null && second !== "" ? String(second) : "00")
            .split(".")[0]
            .padStart(2, "0");
        minute = (minute != null && minute !== "" ? String(minute) : "00").padStart(
            2,
            "0",
        );

        hour = parseInt(hour, 10);

        const suffix = hour >= 12 ? "PM" : "AM";
        if (hour > 12) hour -= 12;
        if (hour === 0) hour = 12;

        return `${hour.toString().padStart(2, "0")}:${minute}:${second} ${suffix}`;
    };

    const convertTo24Hour = (time, field) => {
        if (!time || typeof time !== "string") return null;

        let t = time.trim();
        t = t.replace(
            /([0-9]{1,2}:[0-9]{2}:[0-9]{2}|[0-9]{1,2}:[0-9]{2}|[0-9]{1,2})(AM|PM)\s*$/i,
            "$1 $2",
        );
        t = t.toUpperCase();
        t = t.replace(/\s*(AM|PM)\s*$/, " $1");
        t = t.replace(/\s+/g, " ").trim();

        const parts = t.split(/\s+/);
        if (parts.length < 1) return null;

        const timeSeg = parts[0].split(":");
        const secPart =
            timeSeg[2] != null ? String(timeSeg[2]).split(".")[0] : "0";
        let [hours, minutes, seconds] = [
            timeSeg[0],
            timeSeg[1] != null && timeSeg[1] !== "" ? timeSeg[1] : "0",
            secPart,
        ];
        let modifier =
            parts.length > 1 && (parts[1] === "AM" || parts[1] === "PM")
                ? parts[1]
                : null;

        hours = parseInt(hours, 10);
        minutes = parseInt(minutes, 10);
        seconds = parseInt(seconds, 10) || 0;

        if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null;

        if (!modifier) {
            const inferred =
                field === "amIn"
                    ? "AM"
                    : field === "amOut" ||
                        field === "pmIn" ||
                        field === "pmOut" ||
                        field === "otIn" ||
                        field === "otOut"
                      ? "PM"
                      : null;
            if (inferred && hours >= 1 && hours <= 12) modifier = inferred;
        }

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
            const batchId = employee?.batch_id;
            if (!bioId || !batchId) return;

            const url = `${API_BASE_URL}/api/dtr/employee-dtr?bio_id=${bioId}&batch_id=${batchId}`;
            console.log("Fetching DTR from:", url);

            const res = await fetch(url);
            const data = await res.json();

            if (!Array.isArray(data)) return;

            const formatted = data
                .map((row) => {
                    const raw = String(row.date ?? "").split("T")[0];
                    const dateObj = parseLocalDateOnly(raw);
                    if (!dateObj) return null;

                    return {
                        rawDate: raw,
                        date: `${(dateObj.getMonth() + 1)
                            .toString()
                            .padStart(2, "0")}/${dateObj
                            .getDate()
                            .toString()
                            .padStart(2, "0")}/${dateObj
                            .getFullYear()
                            .toString()
                            .slice(-2)}`,

                        day: DAY_LABELS[dateObj.getDay()],

                        amIn: formatTime(row.amIn),
                        amOut: formatTime(row.amOut),
                        pmIn: formatTime(row.pmIn),
                        pmOut: formatTime(row.pmOut),
                        otIn: formatTime(row.otIn),
                        otOut: formatTime(row.otOut),
                    };
                })
                .filter(Boolean);

            const merged = mergeDtrWithFullCalendarRange(formatted);

            setDtrEntries(merged);
            setInitialEntries(merged.map((r) => ({ ...r })));
            setEditing(null);
        } catch (err) {
            console.error("LOAD DTR ERROR:", err);
        }
    }, [employee, batchId, API_BASE_URL]);

    useEffect(() => {
        loadDTR();
    }, [loadDTR]);

    const TIME_FIELDS = ["amIn", "amOut", "pmIn", "pmOut", "otIn", "otOut"];

    const defaultAmPmForField = (field) =>
        field === "amIn" ? "AM" : "PM";

    const readAmPmFromText = (text) =>
        String(text).match(/\b(am|pm)\b/i)?.[1]?.toUpperCase() ?? null;

    const amPmLockForCell = (field, cellValue) => {
        const trimmed = (cellValue ?? "").trim();
        return trimmed
            ? readAmPmFromText(trimmed) ?? defaultAmPmForField(field)
            : null;
    };

    const lockAmPmForTimeField = (field, value) => {
        if (field === "otIn" || field === "otOut") {
            return amPmLockForCell(field, value);
        }
        return (value ?? "").trim()
            ? amPmLockForCell(field, value)
            : defaultAmPmForField(field);
    };

    // Turn what the user typed into one string: "HH:MM:SS" "AM" or "PM".
    const formatDtrTimeInput = (field, value, lockedAmPm) => {
        let text = value.trim();
        if (!text) return "";

        const defaultAmPm = defaultAmPmForField(field);
        text = text.replace(
            /^([0-9]{1,2}:[0-9]{2}:[0-9]{2}|[0-9]{1,2}:[0-9]{2}|[0-9]+)(am|pm)\s*$/i,
            "$1 $2",
        );

        const amPmMatches = [...text.matchAll(/\b(am|pm)\b/gi)];
        const hadExplicitAmPm = amPmMatches.length > 0;

        text = text.replace(/\b(am|pm)\b/gi, " ");

        let digits = text.replace(/[^0-9:]/g, "");
        if (!digits) return "";
        if (!digits.includes(":") && digits.length > 2) {
            digits = digits.slice(0, 2) + ":" + digits.slice(2);
        }
        if (/^0+$/.test(digits.replace(/:/g, ""))) return "";

        const parts = digits.split(":").map((s) => s.slice(0, 2));
        const [h = "", m = "", s = ""] = parts;

        if (!h) return "";

        let hour = parseInt(h, 10);
        if (Number.isNaN(hour) || hour < 0 || hour > 23) return "";

        const resolveAmPm = () => {
            let ap = hadExplicitAmPm
                ? amPmMatches[amPmMatches.length - 1][1].toUpperCase()
                : defaultAmPm;
            if (lockedAmPm === "AM" || lockedAmPm === "PM") {
                ap = lockedAmPm;
            }
            return ap;
        };

        let ampm;
        if (hour > 12) {
            hour -= 12;
            if (hadExplicitAmPm) {
                ampm = resolveAmPm();
            } else {
                ampm = field === "amIn" ? "AM" : "PM";
            }
        } else if (hour === 0) {
            hour = 12;
            ampm = "AM";
        } else if (hour === 12) {
            ampm = hadExplicitAmPm ? resolveAmPm() : "PM";
        } else {
            ampm = resolveAmPm();
        }

        const min = (m || "00").slice(0, 2).padStart(2, "0");
        const sec = (s || "00").slice(0, 2).padStart(2, "0");
        return `${String(hour).padStart(2, "0")}:${min}:${sec} ${ampm}`;
    };

    const isRowChanged = (current, original) => {
        if (!original) return true;
        return TIME_FIELDS.some(
            (f) => (current[f] || "") !== (original[f] || ""),
        );
    };

    const isTimeCellChanged = (idx, field, entry) => {
        const cur =
            editing?.row === idx && editing?.field === field
                ? formatDtrTimeInput(
                      field,
                      editing.draft,
                      editing.lockAmPm,
                  )
                : entry[field] || "";
        return cur !== (initialEntries[idx]?.[field] || "");
    };

    const hasChanges = () => {
        if (editing) {
            const formatted = formatDtrTimeInput(
                editing.field,
                editing.draft,
                editing.lockAmPm,
            );
            const init = initialEntries[editing.row]?.[editing.field] ?? "";
            if (formatted !== init) return true;
        }
        return dtrEntries.some((entry, i) =>
            isRowChanged(entry, initialEntries[i]),
        );
    };

    const finalizeTimeInput = () => {
        if (!editing) return dtrEntries;
        const f = formatDtrTimeInput(
            editing.field,
            editing.draft,
            editing.lockAmPm,
        );
        const next = dtrEntries.map((row, i) =>
            i === editing.row ? { ...row, [editing.field]: f } : row,
        );
        setDtrEntries(next);
        setEditing(null);
        return next;
    };

    const finishEditingTimeCell = (rowIndex, fieldKey) => {
        const ed = editingRef.current;
        if (ed?.row === rowIndex && ed?.field === fieldKey) {
            const f = formatDtrTimeInput(
                fieldKey,
                ed.draft,
                ed.lockAmPm,
            );
            setDtrEntries((prev) =>
                prev.map((row, i) =>
                    i === rowIndex ? { ...row, [fieldKey]: f } : row,
                ),
            );
        }
        setEditing(null);
    };

    // First loaded value for that row/column
    const initialDtrValueAt = (rowIndex, timeField) =>
        initialEntries[rowIndex]?.[timeField] ?? "";

    const timeFieldEditState = (rowIndex, timeField, draft) => ({
        row: rowIndex,
        field: timeField,
        draft,
        lockAmPm: lockAmPmForTimeField(
            timeField,
            initialDtrValueAt(rowIndex, timeField),
        ),
    });

    const handleSaveClick = async () => {
        if (isSaving) return;
        try {
            setIsSaving(true);
            const bioId = employee?.bio_id || employee?.id;
            const batchId =
                employee?.batch_id || localStorage.getItem("current_batch_id");

            const rows = finalizeTimeInput();

            const changedEntries = rows.filter((entry, i) =>
                isRowChanged(entry, initialEntries[i]),
            );

            if (changedEntries.length === 0) {
                alert("No changes to save.");
                return;
            }

            // Send all changed rows in ONE request
            const payload = changedEntries.map((entry) => ({
                bio_id: bioId,
                batch_id: Number(batchId),
                date: entry.rawDate
                    ? String(entry.rawDate).split("T")[0]
                    : null,
                amIn: convertTo24Hour(entry.amIn, "amIn"),
                amOut: convertTo24Hour(entry.amOut, "amOut"),
                pmIn: convertTo24Hour(entry.pmIn, "pmIn"),
                pmOut: convertTo24Hour(entry.pmOut, "pmOut"),
                otIn: convertTo24Hour(entry.otIn, "otIn"),
                otOut: convertTo24Hour(entry.otOut, "otOut"),
            }));

            const res = await fetch(`${API_BASE_URL}/api/dtr/update-dtr`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.details || data.error);

            await loadDTR();

            const misses = Array.isArray(data.misses) ? data.misses : [];
            if (misses.length > 0) {
                const list = misses
                    .map((m) => `• ${m.date} — ${m.type}`)
                    .join("\n");
                alert(
                    `Saved ${changedEntries.length} row(s), but these had no matching record to update:\n\n${list}`,
                );
            } else {
                alert(`Saved ${changedEntries.length} row(s) successfully!`);
            }
        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-6xl mx-auto border border-gray-100 flex flex-col h-[calc(80vh-80px)] min-h-[300px]">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            if (hasChanges()) {
                                setShowUnsavedModal(true);
                                return;
                            }
                            onBack();
                        }}
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
                        disabled={isSaving || !hasChanges()}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold transition-all shadow-sm active:scale-95 ${
                            isSaving || !hasChanges()
                                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                : "bg-[#449d44] hover:bg-[#398439] text-white"
                        }`}
                    >
                        <Save size={18} />{" "}
                        {isSaving ? "Saving..." : "Save changes"}
                    </button>
                    <button
                        className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-lg font-semibold transition-all active:scale-95"
                        onClick={() =>
                            onGenerateReport && onGenerateReport(finalizeTimeInput())
                        }
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
                                    <td
                                        colSpan="8"
                                        className="py-5 text-gray-400"
                                    >
                                        No DTR data found
                                    </td>
                                </tr>
                            )}

                            {dtrEntries.map((entry, idx) => (
                                <tr
                                    key={idx}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="py-3 text-sm font-medium text-gray-700 whitespace-nowrap">
                                        {entry.date}
                                    </td>
                                    <td className="py-3 text-sm text-gray-700">
                                        {entry.day}
                                    </td>

                                    {TIME_FIELDS.map((field) => {
                                        const isActiveCell =
                                            editing?.row === idx &&
                                            editing?.field === field;
                                        return (
                                            <td key={`${field}-${idx}`}>
                                                <input
                                                    type="text"
                                                    value={
                                                        isActiveCell
                                                            ? editing.draft
                                                            : entry[field] || ""
                                                    }
                                                    onFocus={() =>
                                                        setEditing(
                                                            timeFieldEditState(
                                                                idx,
                                                                field,
                                                                entry[
                                                                    field
                                                                ] ?? "",
                                                            ),
                                                        )
                                                    }
                                                    onChange={(e) => {
                                                        const v =
                                                            e.target.value;
                                                        setEditing((ed) =>
                                                            ed?.row === idx &&
                                                            ed?.field === field
                                                                ? {
                                                                      ...ed,
                                                                      draft: v,
                                                                  }
                                                                : timeFieldEditState(
                                                                      idx,
                                                                      field,
                                                                      v,
                                                                  ),
                                                        );
                                                    }}
                                                    onBlur={() =>
                                                        finishEditingTimeCell(
                                                            idx,
                                                            field,
                                                        )
                                                    }
                                                    className={`w-24 text-center py-1.5 border rounded-full text-[11px] font-semibold outline-none transition-all shadow-sm
                            ${
                                isTimeCellChanged(idx, field, entry)
                                    ? "bg-yellow-100 border-yellow-400 text-gray-800"
                                    : "bg-white border-gray-200 text-gray-600"
                            }
                            focus:ring-2 focus:ring-orange-400 focus:border-transparent
                          `}
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {showUnsavedModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                            <div className="bg-white rounded-xl shadow-lg w-[450px] p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    Unsaved Changes
                                </h3>
                                <p className="text-md text-gray-600 mb-6">
                                    You have unsaved changes. Are you sure you
                                    want to leave?
                                </p>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() =>
                                            setShowUnsavedModal(false)
                                        }
                                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowUnsavedModal(false);
                                            onBack();
                                        }}
                                        className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                                    >
                                        Leave
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DTREditView;
