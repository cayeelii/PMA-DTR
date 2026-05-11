import { useEffect, useState } from "react";
import { Pencil, Archive, Plus } from "lucide-react";
import AddScheduleModal from "../../components/AddSchedule";
import EditScheduleModal from "../../components/EditSchedule";
import { saveActivityLog } from "../../utils/activityLogs";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export default function ScheduleTabPrototype() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [scheduleToArchive, setScheduleToArchive] = useState(null);

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


    const handleEdit = (schedule) => {
        setSelectedSchedule(schedule);
        setIsEditModalOpen(true);
    };


    const handleArchiveClick = (schedule) => {
        setScheduleToArchive(schedule);
        setIsArchiveModalOpen(true);
    };


    const handleArchiveConfirm = async () => {
        if (!scheduleToArchive) return;


        try {
            const response = await fetch(
                `${API_BASE_URL}/api/schedules/${scheduleToArchive.schedule_id}/archive`,
                {
                    method: "PATCH",
                }
            );


            if (!response.ok) {
                throw new Error("Failed to archive schedule");
            }


            // Log the activity
            try {
                await saveActivityLog({
                    action: "Archived Schedule",
                    details: `Archived schedule "${scheduleToArchive.schedule_name}".`,
                });
            } catch (logErr) {
                console.error("Failed to save activity log:", logErr);
            }


            setIsArchiveModalOpen(false);
            setScheduleToArchive(null);
            await fetchSchedules();
        } catch (error) {
            console.error("Error archiving schedule:", error);
            alert("Failed to archive schedule");
        }
    };


    const handleAddSuccess = async () => {
        try {
            // Get the newly added schedule details from the API
            const response = await fetch(`${API_BASE_URL}/api/schedules`);
            const data = await response.json();
           
            
            const newSchedule = data[data.length - 1];
           
            if (newSchedule) {
                await saveActivityLog({
                    action: "Added Schedule",
                    details: `Added schedule "${newSchedule.schedule_name}".`,
                });
            }
        } catch (logErr) {
            console.error("Failed to save activity log:", logErr);
        }


        setIsAddModalOpen(false);
        await fetchSchedules();
    };


    const handleEditSuccess = async () => {
        try {
            if (selectedSchedule) {
                await saveActivityLog({
                    action: "Updated Schedule",
                    details: `Updated schedule "${selectedSchedule.schedule_name}".`,
                });
            }
        } catch (logErr) {
            console.error("Failed to save activity log:", logErr);
        }


        setIsEditModalOpen(false);
        setSelectedSchedule(null);
        await fetchSchedules();
    };

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

                                    <button
                                        className="p-2 rounded-lg hover:bg-slate-100 text-blue-600 transition"
                                        onClick={() => handleEdit(schedule)}
                                    >
                                        <Pencil size={18} />
                                    </button>


                                    <button
                                        className="p-2 rounded-lg hover:bg-slate-100 text-red-500 transition"
                                        onClick={() => handleArchiveClick(schedule)}
                                    >
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
                <AddScheduleModal onClose={() => setIsAddModalOpen(false)} onSuccess={handleAddSuccess} />  
            )}
           
            {/* Edit SCHEDULE MODAL */}
            {isEditModalOpen && selectedSchedule && (
                <EditScheduleModal
                    schedule={selectedSchedule}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={handleEditSuccess}
                />
            )}


            {/* ARCHIVE SCHEDULE MODAL */}
            {isArchiveModalOpen && scheduleToArchive && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            Archive Schedule
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to archive the schedule <strong>"{scheduleToArchive.schedule_name}"</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-4 justify-end">
                            <button
                                onClick={() => {
                                    setIsArchiveModalOpen(false);
                                    setScheduleToArchive(null);
                                }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleArchiveConfirm}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition"
                            >
                                Archive
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

