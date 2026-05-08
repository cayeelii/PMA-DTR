import { useEffect, useState } from "react";
import { Pencil, Archive, Plus } from "lucide-react";
import AddScheduleModal from "../../components/AddSchedule";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ScheduleTabPrototype() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // FETCH SCHEDULES 
    const fetchSchedules = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/api/schedules`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch schedules");
            }

            const data = await response.json();
            setSchedules(data);

        } catch (error) {
            console.error("Error fetching schedules:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

    return (
        <div className="bg-surface w-full text-theme p-3 md:p-6">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-primary">
                    Schedule
                </h1>

                <button 
                    className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium shadow"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    Add Schedule
                </button>
            </div>

            {/* LOADING STATE */}
            {loading ? (
                <div className="text-center text-slate-500 py-10">
                    Loading schedules...
                </div>
            ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

                    {schedules.map((schedule) => (
                        <div
                            key={schedule.schedule_id}
                            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 hover:shadow-md transition"
                        >

                            {/* HEADER */}
                            <div className="flex items-center justify-between mb-3">

                                <div className="flex items-center gap-2">
                                    <h2 className="font-bold text-lg text-slate-800">
                                        {schedule.schedule_name}
                                    </h2>
                                </div>

                                {/* ACTIONS */}
                                <div className="flex gap-1">

                                    <button className="p-2 rounded-lg hover:bg-slate-100 text-blue-600 transition">
                                        <Pencil size={18} />
                                    </button>

                                    <button className="p-2 rounded-lg hover:bg-slate-100 text-red-500 transition">
                                        <Archive size={18} />
                                    </button>

                                </div>
                            </div>

                            <div className="border-t border-slate-100 mb-3"></div>

                            {/* TIME DISPLAY */}
                            <div className="grid gap-2 text-sm">

                                <div className="flex justify-between">
                                    <span className="text-slate-600 font-medium px-6">AM IN</span>
                                    <span className="font-mono text-slate-700 px-6">
                                        {schedule.am_in_start} - {schedule.am_in_end}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-slate-600 font-medium px-6">AM OUT</span>
                                    <span className="font-mono text-slate-700 px-6">
                                        {schedule.am_out_start} - {schedule.am_out_end}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-slate-600 font-medium px-6">PM IN</span>
                                    <span className="font-mono text-slate-700 px-6">
                                        {schedule.pm_in_start} - {schedule.pm_in_end}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-slate-600 font-medium px-6">PM OUT</span>
                                    <span className="font-mono text-slate-700 px-6">
                                        {schedule.pm_out_start} - {schedule.pm_out_end}
                                    </span>
                                </div>

                                {/* OPTIONAL OT */}
                                {schedule.ot_in_start && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 font-medium px-6">OT IN</span>
                                            <span className="font-mono text-slate-700 px-6">
                                                {schedule.ot_in_start} - {schedule.ot_in_end}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-slate-600 font-medium px-6">OT OUT</span>
                                            <span className="font-mono text-slate-700 px-6">
                                                {schedule.ot_out_start} - {schedule.ot_out_end}
                                            </span>
                                        </div>
                                    </>
                                )}

                            </div>
                        </div>
                    ))}

                </div>
            )}

            {/* ADD SCHEDULE MODAL */}
            {isAddModalOpen && (
                <AddScheduleModal onClose={() => setIsAddModalOpen(false)} />
            )}
        </div>
    );
}