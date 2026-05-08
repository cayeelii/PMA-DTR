import { useState } from "react";
import { X, Clock } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AddScheduleModal({ onClose, onSuccess }) {
    const [showOT, setShowOT] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        schedule_name: "",

        am_in_start: "",
        am_in_end: "",
        am_out_start: "",
        am_out_end: "",

        pm_in_start: "",
        pm_in_end: "",
        pm_out_start: "",
        pm_out_end: "",

        ot_in_start: "",
        ot_in_end: "",
        ot_out_start: "",
        ot_out_end: "",
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async () => {
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
                    placeholder="Schedule Name (e.g. STANDARD)"
                    className="w-full border rounded-lg px-3 py-2 mb-4"
                    onChange={handleChange}
                />

                {/* AM SHIFT */}
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold mb-3">AM SHIFT</h3>

                    <div className="flex flex-col gap-3">
                        {/* AM IN */}
                        <div>
                            <div className="text-xs font-semibold text-gray-600 mb-2">
                                AM IN
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <input
                                        name="am_in_start"
                                        placeholder="1:00:00"
                                        className="border p-2 rounded w-full pr-10"
                                        onChange={handleChange}
                                    />
                                    <Clock className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />
                                </div>
                                <div className="relative">
                                    <input
                                        name="am_in_end"
                                        placeholder="8:00:00"
                                        className="border p-2 rounded w-full pr-10"
                                        onChange={handleChange}
                                    />
                                    <Clock className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />
                                </div>
                            </div>
                        </div>

                        {/* AM OUT */}
                        <div>
                            <div className="text-xs font-semibold text-gray-600 mb-2">
                                AM OUT
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <input
                                        name="am_out_start"
                                        placeholder="8:01:00"
                                        className="border p-2 rounded w-full pr-10"
                                        onChange={handleChange}
                                    />
                                    <Clock className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />
                                </div>
                                <div className="relative">
                                    <input
                                        name="am_out_end"
                                        placeholder="11:59:00"
                                        className="border p-2 rounded w-full pr-10"
                                        onChange={handleChange}
                                    />
                                    <Clock className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PM SHIFT */}
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold mb-3">PM SHIFT</h3>

                    <div className="flex flex-col gap-3">
                        {/* PM IN */}
                        <div>
                            <div className="text-xs font-semibold text-gray-600 mb-2">
                                PM IN
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <input
                                        name="pm_in_start"
                                        placeholder="12:00:00"
                                        className="border p-2 rounded w-full pr-10"
                                        onChange={handleChange}
                                    />
                                    <Clock className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />
                                </div>
                                <div className="relative">
                                    <input
                                        name="pm_in_end"
                                        placeholder="12:29:00"
                                        className="border p-2 rounded w-full pr-10"
                                        onChange={handleChange}
                                    />
                                    <Clock className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />
                                </div>
                            </div>
                        </div>

                        {/* PM OUT */}
                        <div>
                            <div className="text-xs font-semibold text-gray-600 mb-2">
                                PM OUT
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <input
                                        name="pm_out_start"
                                        placeholder="12:30:00"
                                        className="border p-2 rounded w-full pr-10"
                                        onChange={handleChange}
                                    />
                                    <Clock className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />
                                </div>
                                <div className="relative">
                                    <input
                                        name="pm_out_end"
                                        placeholder="17:00:00"
                                        className="border p-2 rounded w-full pr-10"
                                        onChange={handleChange}
                                    />
                                    <Clock className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* OT */}
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Overtime</h3>
                    <button
                        onClick={() => setShowOT(!showOT)}
                        className="text-sm px-3 py-1 border rounded-lg"
                    >
                        {showOT ? "Remove OT" : "+ Add OT"}
                    </button>
                </div>

                {showOT && (
                    <div className="bg-gray-100 p-4 rounded-lg mb-4">
                        <div className="flex flex-col gap-3">
                            {/* OT IN */}
                            <div>
                                <div className="text-xs font-semibold text-gray-600 mb-2">
                                    OT IN
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <input
                                            name="ot_in_start"
                                            placeholder="23:00:00"
                                            className="border p-2 rounded w-full pr-10"
                                            onChange={handleChange}
                                        />
                                        <Clock className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />
                                    </div>
                                    <div className="relative">
                                        <input
                                            name="ot_in_end"
                                            placeholder="23:59:59"
                                            className="border p-2 rounded w-full pr-10"
                                            onChange={handleChange}
                                        />
                                        <Clock className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />
                                    </div>
                                </div>
                            </div>

                            {/* OT OUT */}
                            <div>
                                <div className="text-xs font-semibold text-gray-600 mb-2">
                                    OT OUT
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <input
                                            name="ot_out_start"
                                            placeholder="00:01:00"
                                            className="border p-2 rounded w-full pr-10"
                                            onChange={handleChange}
                                        />
                                        <Clock className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />
                                    </div>
                                    <div className="relative">
                                        <input
                                            name="ot_out_end"
                                            placeholder="00:30:00"
                                            className="border p-2 rounded w-full pr-10"
                                            onChange={handleChange}
                                        />
                                        <Clock className="absolute right-3 top-2.5 w-4 h-4 text-gray-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ACTIONS */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-900 text-white rounded-lg"
                    >
                        {loading ? "Saving..." : "Save Schedule"}
                    </button>
                </div>
            </div>
        </div>
    );
}
