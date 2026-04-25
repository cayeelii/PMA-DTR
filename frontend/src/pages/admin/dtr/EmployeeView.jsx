import React, { useEffect, useState } from "react";
import { ChevronLeft, Search } from "lucide-react";

const EmployeeView = ({
    departmentName,
    batchId,
    onBack,
    onSelectEmployee,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // Fetch Employees
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                if (!departmentName || !batchId) return;

                setLoading(true);

                const res = await fetch(
                    `${API_BASE_URL}/api/dtr/employees?department=${encodeURIComponent(
                        departmentName,
                    )}&batch_id=${batchId}`,
                );

                const data = await res.json();
                setEmployees(data || []);
            } catch (err) {
                console.error("Failed to fetch employees:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, [departmentName, batchId]);

    // FILTER
    const filteredEmployees = employees.filter(
        (emp) =>
            emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.id?.toString().includes(searchTerm),
    );

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-5xl mx-auto border border-gray-100 flex flex-col h-[650px]">
            {/* HEADER */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-gray-800">
                    {departmentName}{" "}
                    <span className="text-gray-400 mx-1">•</span> Employees
                </h2>

                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                    <ChevronLeft size={18} />
                    Back
                </button>
            </div>

            {/* SEARCH */}
            <div className="p-6 pb-4 flex items-center justify-between shrink-0">
                <div className="relative w-full max-w-xl">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <Search size={18} />
                    </span>

                    <input
                        type="text"
                        placeholder="Search by BIO ID or Employee Name"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <span className="text-gray-500 text-sm font-medium bg-gray-100 px-3 py-1 rounded-full ml-4">
                    {filteredEmployees.length} employees
                </span>
            </div>

            {/* TABLE */}
            <div className="flex-1 overflow-hidden p-6 pt-0 flex flex-col">
                <div className="overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-gray-100">
                            <tr className="text-xs uppercase text-gray-700 font-bold">
                                <th className="px-6 py-4">BIO ID</th>
                                <th className="px-6 py-4">Employee Name</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={2}
                                        className="text-center py-10 text-gray-400"
                                    >
                                        Loading employees...
                                    </td>
                                </tr>
                            ) : filteredEmployees.length > 0 ? (
                                filteredEmployees.map((emp) => (
                                    <tr
                                        key={emp.id}
                                        onClick={() => onSelectEmployee(emp)}
                                        className="cursor-pointer hover:bg-orange-50"
                                    >
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-500">
                                            {emp.id}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                                            {emp.name}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={2}
                                        className="py-12 text-center text-gray-400 bg-gray-50"
                                    >
                                        No employees found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EmployeeView;
