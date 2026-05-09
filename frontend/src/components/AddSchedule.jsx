import { useState } from "react";
import { X, Clock } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Dropdown options for HH, MM, SS
const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const minsSecs = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

export default function AddScheduleModal({ onClose, onSuccess }) {
    const [showOT, setShowOT] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        schedule_name: "",
        // Initialized with 00:00:00 to support dropdown logic
        am_in_start: "00:00:00", am_in_end: "00:00:00",
        am_out_start: "00:00:00", am_out_end: "00:00:00",
        pm_in_start: "00:00:00", pm_in_end: "00:00:00",
        pm_out_start: "00:00:00", pm_out_end: "00:00:00",
        ot_in_start: "00:00:00", ot_in_end: "00:00:00",
        ot_out_start: "00:00:00", ot_out_end: "00:00:00",
    });

    // List of fields that require time validation (excluding schedule_name)
    const timeFields = [
        "am_in_start", "am_in_end", "am_out_start", "am_out_end",
        "pm_in_start", "pm_in_end", "pm_out_start", "pm_out_end",
        "ot_in_start", "ot_in_end", "ot_out_start", "ot_out_end"
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        // BLOCK ALPHABET CHARACTERS: 
        // If the field is a time field, remove any character that isn't a digit or a colon.
        if (timeFields.includes(name)) {
            newValue = value.replace(/[^0-9:]/g, "");
        }

        setForm((prev) => ({
            ...prev,
            [name]: newValue,
        }));
    };

    // Helper to update specific parts of the HH:MM:SS string via dropdowns
    const handleDropdownChange = (fieldName, part, val) => {
        const parts = form[fieldName].split(":");
        if (part === "h") parts[0] = val;
        if (part === "m") parts[1] = val;
        if (part === "s") parts[2] = val;
        setForm((prev) => ({ ...prev, [fieldName]: parts.join(":") }));
    };

    const handleSubmit = async () => {
        // VALIDATION: Ensure HH:MM:SS format
        const isValidTime = (timeStr) => {
            if (!timeStr) return true; // Allows empty if field isn't required (e.g. OT)
            // Regex matches H:MM:SS or HH:MM:SS within 24-hour bounds
            const regex = /^([0-1]?\d|2[0-3]):[0-5]\d:[0-5]\d$/;
            return regex.test(timeStr);
        };

        // Check only the fields that have values entered
        const invalidFields = timeFields.filter(field => form[field] && !isValidTime(form[field]));

        if (!form.schedule_name.trim()) {
            alert("Please enter a schedule name.");
            return;
        }

        if (invalidFields.length > 0) {
            alert("Please enter valid times in HH:MM:SS format (e.g., 08:00:00).");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${API_BASE_URL}/api/schedules`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            if (!response.ok) {
                throw new Error("Failed to create schedule");
            }

            onSuccess?.(); // refresh list
            onClose(); // close modal
        } catch (error) {
            console.error(error);
            alert("Failed to create schedule");
        } finally {
            setLoading(false);
        }
    };

    // Component to render dropdowns for a specific field
    const TimePickerGroup = ({ fieldName }) => {
        const [h, m, s] = form[fieldName].split(":");
        const selectClass = "bg-transparent outline-none cursor-pointer text-sm font-semibold text-gray-700 hover:text-blue-700 focus:text-blue-700 transition-colors px-1 py-0.5 rounded";
        return (
            <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg px-3 py-2 w-full shadow-sm hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Clock size={13} className="text-gray-300 mr-1 flex-shrink-0" />
                <select value={h} onChange={(e) => handleDropdownChange(fieldName, "h", e.target.value)} className={selectClass}>
                    {hours.map(val => <option key={val} value={val}>{val}</option>)}
                </select>
                <span className="text-gray-300 font-light select-none">:</span>
                <select value={m} onChange={(e) => handleDropdownChange(fieldName, "m", e.target.value)} className={selectClass}>
                    {minsSecs.map(val => <option key={val} value={val}>{val}</option>)}
                </select>
                <span className="text-gray-300 font-light select-none">:</span>
                <select value={s} onChange={(e) => handleDropdownChange(fieldName, "s", e.target.value)} className={selectClass}>
                    {minsSecs.map(val => <option key={val} value={val}>{val}</option>)}
                </select>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Add Schedule</h2>
                    <button onClick={onClose}>
                        <X />
                    </button>
                </div>

                <div className="border-t mb-5" />

                {/* SCHEDULE NAME */}
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Name
                </label>
                <input
                    name="schedule_name"
                    value={form.schedule_name}
                    placeholder="Schedule Name (e.g. STANDARD)"
                    className="w-full border rounded-lg px-3 py-2 mb-4"
                    onChange={handleChange}
                />

                {/* AM SHIFT */}
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold mb-3">AM SHIFT</h3>
                    <div className="flex flex-col gap-3">
                        <div>
                            <div className="text-xs font-semibold text-gray-600 mb-2">AM IN (START - END)</div>
                            <div className="grid grid-cols-2 gap-3">
                                <TimePickerGroup fieldName="am_in_start" />
                                <TimePickerGroup fieldName="am_in_end" />
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-gray-600 mb-2">AM OUT (START - END)</div>
                            <div className="grid grid-cols-2 gap-3">
                                <TimePickerGroup fieldName="am_out_start" />
                                <TimePickerGroup fieldName="am_out_end" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* PM SHIFT */}
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold mb-3">PM SHIFT</h3>
                    <div className="flex flex-col gap-3">
                        <div>
                            <div className="text-xs font-semibold text-gray-600 mb-2">PM IN (START - END)</div>
                            <div className="grid grid-cols-2 gap-3">
                                <TimePickerGroup fieldName="pm_in_start" />
                                <TimePickerGroup fieldName="pm_in_end" />
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-gray-600 mb-2">PM OUT (START - END)</div>
                            <div className="grid grid-cols-2 gap-3">
                                <TimePickerGroup fieldName="pm_out_start" />
                                <TimePickerGroup fieldName="pm_out_end" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* OT */}
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Overtime</h3>
                    <button
                        onClick={() => setShowOT(!showOT)}
                        className="text-sm px-3 py-1 border rounded-lg hover:bg-gray-50"
                    >
                        {showOT ? "Remove OT" : "+ Add OT"}
                    </button>
                </div>

                {showOT && (
                    <div className="bg-gray-100 p-4 rounded-lg mb-4">
                        <div className="flex flex-col gap-3">
                            <div>
                                <div className="text-xs font-semibold text-gray-600 mb-2">OT IN (START - END)</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <TimePickerGroup fieldName="ot_in_start" />
                                    <TimePickerGroup fieldName="ot_in_end" />
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-gray-600 mb-2">OT OUT (START - END)</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <TimePickerGroup fieldName="ot_out_start" />
                                    <TimePickerGroup fieldName="ot_out_end" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ACTIONS */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-900 text-white rounded-lg disabled:bg-blue-300"
                    >
                        {loading ? "Saving..." : "Save Schedule"}
                    </button>
                </div>
            </div>
        </div>
    );
}