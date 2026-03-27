import { useState } from "react";
import { Search, Pencil, Archive } from "lucide-react";
import AddUserModal from "../components/AddUser";

const mockData = Array(15).fill({
    timestamp: "2024-03-27",
    user: "John Doe",
    role: "Admin",
});

const PAGE_SIZE = 5;

function AccountsPage() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filtered = mockData.filter((row) =>
        row.user.toLowerCase().includes(search.toLowerCase()),
    );

    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="relative bg-surface w-full text-theme p-2 pt-2 overflow-y-hidden">
            <div className="p-1 md:p-5 md:mt-0">
                <div className="flex flex-row md:items-center justify-between mb-6 gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-primary">
                        Accounts
                    </h1>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search User"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </div>

                    <button
                        className="bg-amber-400 hover:bg-amber-500 text-gray-900 px-5 py-1.5 rounded-lg font-medium shadow flex items-center gap-2"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <span>Add User</span>
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="text-center px-6 py-4 font-semibold">
                                    Timestamp Created
                                </th>
                                <th className="text-center px-6 py-4 font-semibold">
                                    User
                                </th>
                                <th className="text-center px-6 py-4 font-semibold">
                                    Role
                                </th>
                                <th className="text-center px-6 py-4 font-semibold">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-8 text-center text-gray-500"
                                    >
                                        No results found.
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((row, index) => (
                                    <tr
                                        key={index}
                                        className={`border-t ${
                                            index % 2 === 0
                                                ? "bg-white"
                                                : "bg-gray-50"
                                        } hover:bg-blue-50 transition`}
                                    >
                                        <td className="text-center px-6 py-4">
                                            {row.timestamp}
                                        </td>
                                        <td className="text-center px-6 py-4">
                                            {row.user}
                                        </td>
                                        <td className="text-center px-6 py-4">
                                            {row.role}
                                        </td>
                                        <td className="text-center px-6 py-4">
                                            <div className="flex justify-center gap-3">
                                                <button
                                                    className="text-blue-600 hover:text-blue-800 transition"
                                                    title="Edit"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    className="text-red-600 hover:text-red-800 transition"
                                                    title="Archive"
                                                >
                                                    <Archive size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <AddUserModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            </div>
        </div>
    );
}

export default AccountsPage;
