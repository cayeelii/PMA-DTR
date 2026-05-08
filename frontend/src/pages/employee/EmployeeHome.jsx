import { useEffect, useState } from "react";
import { Folder, ChevronDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function EmployeeHome() {
    const [user, setUser] = useState(null);
    const [dtrData, setDtrData] = useState([]);
    const [openFolders, setOpenFolders] = useState({});
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const today = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // Fetch current user
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const res = await fetch(
                    `${API_BASE_URL}/api/auth/current-user`,
                    {
                        credentials: "include",
                    },
                );
                const data = await res.json();

                if (res.ok && data.user) {
                    setUser(data.user);
                }
            } catch (err) {
                console.error("Failed to fetch current user:", err);
            }
        };

        fetchCurrentUser();
    }, []);

    // Fetch DTR files
    useEffect(() => {
        const fetchHomepage = async () => {
            try {
                const res = await fetch(
                    `${API_BASE_URL}/api/employee/homepage`,
                    {
                        credentials: "include",
                    },
                );

                const data = await res.json();

                if (res.ok) {
                    setUser(data.user);
                    setDtrData(data.dtr || {});
                }
            } catch (err) {
                console.error("Failed to fetch homepage:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHomepage();
    }, []);

    const username = user?.name || user?.username || "User";

    // Group files by year
    const grouped = Object.keys(dtrData || {}).reduce((acc, year) => {
        if (!dtrData[year]) return acc;

        acc[year] = dtrData[year];
        return acc;
    }, {});

    const toggleFolder = (year) => {
        setOpenFolders((prev) => ({
            ...prev,
            [year]: !prev[year],
        }));
    };

    return (
        <div className="relative bg-surface w-full text-theme p-2 pt-2 overflow-y-hidden">
            <div className="p-1 md:p-5 md:mt-0">
                <div className="flex flex-row md:items-center justify-between mb-6 gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-primary">
                        Welcome Back, {username}
                    </h1>
                    <span className="text-2xl text-[#222] font-medium">
                        {today}
                    </span>
                </div>
            </div>

            {/* DTR Container */}
            <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-2xl ml-10">
                <div className="flex items-center gap-2 mb-4 text-blue-600 font-medium">
                    <Folder size={20} />
                    <span>DTR Files</span>
                </div>

                {loading ? (
                    <div className="text-gray-500 text-sm">
                        Loading files...
                    </div>
                ) : (
                    <div className="space-y-3">
                        {Object.keys(grouped).length === 0 && (
                            <div className="text-gray-500 text-sm">
                                No DTR files found.
                            </div>
                        )}

                        {/* YEAR LIST */}
                        {Object.entries(dtrData).map(([year, months]) => (
                            <div
                                key={year}
                                className="border rounded-lg overflow-hidden"
                            >
                                {/* YEAR HEADER */}
                                <div
                                    className="flex items-center justify-between bg-gray-100 px-4 py-2 cursor-pointer"
                                    onClick={() => toggleFolder(year)}
                                >
                                    <div className="flex items-center gap-2">
                                        {openFolders[year] ? (
                                            <ChevronDown size={16} />
                                        ) : (
                                            <ChevronRight size={16} />
                                        )}
                                        <span className="font-medium">
                                            {year}
                                        </span>
                                    </div>
                                </div>

                                {/* MONTH LIST */}
                                {openFolders[year] && (
                                    <div className="p-3 space-y-2">
                                        {Object.keys(months).map((month) => {
                                            const monthIndex =
                                                new Date(
                                                    `${month} 1, ${year}`,
                                                ).getMonth() + 1;

                                            return (
                                                <div
                                                    key={month}
                                                    className="p-2 rounded hover:bg-blue-50 cursor-pointer text-sm flex justify-between items-center"
                                                    onClick={() =>
                                                        navigate(
                                                            `/employee/dtr?month=${monthIndex}&year=${year}`,
                                                        )
                                                    }
                                                >
                                                    <span>{month}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
