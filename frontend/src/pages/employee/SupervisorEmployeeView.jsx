import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import SupervisorDtrView from "./SupervisorDtrView";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SupervisorEmployeeView = () => {
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [departmentName, setDepartmentName] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // FETCH EMPLOYEES
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoading(true);

                const response = await fetch(
                    `${API_BASE_URL}/api/supervisor/employees`,
                    { credentials: "include" }
                );

                const data = await response.json();

                setEmployees(data.employees || []);
                setDepartmentName(data.department || "");
            } catch (error) {
                console.error("Failed to fetch employees:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, []);

    // SEARCH FILTER
    const filteredEmployees = employees.filter(
        (emp) =>
            emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.bio_id?.toString().includes(searchTerm)
    );

    // SWITCH VIEW
    if (selectedEmployee) {
        return (
            <SupervisorDtrView
                employee={selectedEmployee}
                onBack={() => setSelectedEmployee(null)}
            />
        );
    }

    return (
        <div className="w-full h-full bg-[#ECEEF3] overflow-hidden">

            {/* HEADER */}
            <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    Employees
                </h1>
            </div>

            {/* Container */}
            <div className="flex justify-center h-[calc(100%-72px)] px-6 pb-6">

                <div className="p-6 w-[980px] h-full bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">

                    {/* TOP BAR (UNCHANGED) */}
                    <div className="flex justify-between items-center p-3 border-b border-gray-100 shrink-0">

                        <h2 className="text-xl font-bold text-gray-800">
                            {departmentName}
                        </h2>

                        <div className="relative w-full max-w-md">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <Search size={18} />
                            </span>

                            <input
                                type="text"
                                placeholder="Search by BIO ID or Employee Name"
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                    </div>

                    {/* TABLE */}
                    <div className="flex-1 mt-5 px-12 pb-3 overflow-hidden">

                        <div className="h-full overflow-y-auto border border-gray-200 rounded-lg bg-white">

                            <table className="w-full text-left border-collapse">

                                <thead className="sticky top-0 bg-gray-100 z-10">
                                    <tr className="text-xs uppercase text-gray-700 font-bold">
                                        <th className="px-6 py-4 w-[180px]">BIO ID</th>
                                        <th className="px-6 py-4">Employee Name</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">

                                    {loading ? (
                                        <tr>
                                            <td colSpan={2} className="text-center py-10 text-gray-400">
                                                Loading employees...
                                            </td>
                                        </tr>
                                    ) : filteredEmployees.length > 0 ? (
                                        filteredEmployees.map((employee) => (
                                            <tr
                                                key={employee.bio_id}

                                                // =========================
                                                // CLICK = OPEN DTR VIEW
                                                // =========================
                                                onClick={() => setSelectedEmployee(employee)}

                                                className="cursor-pointer hover:bg-orange-50 transition"
                                            >
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-500">
                                                    {employee.bio_id}
                                                </td>

                                                <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                                    {employee.name}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={2} className="text-center py-12 text-gray-400">
                                                No employees found
                                            </td>
                                        </tr>
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default SupervisorEmployeeView;
