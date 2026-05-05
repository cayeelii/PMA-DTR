import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Folder,
  FolderOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function HomePage() {
  const [batches, setBatches] = useState({});
  const [loading, setLoading] = useState(true);
  const [openCurrent, setOpenCurrent] = useState({});
  const [openDone, setOpenDone] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/homepage/dtr-batches`);
        const data = await res.json();

        setBatches(data);

        const years = Object.keys(data);
        if (years.length > 0) {
          const latestYear = Math.max(...years.map(Number));
          setOpenCurrent({ [latestYear]: true });
          setOpenDone({ [latestYear]: true });
        }
      } catch (err) {
        console.error("Failed to fetch batches:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  const currentDTRs = batches.CURRENT || {};
  const doneDTRs = batches.DONE || {};

  const handleToggle = (type, year) => {
    if (type === "current") {
      setOpenCurrent((prev) => ({ ...prev, [year]: !prev[year] }));
    } else {
      setOpenDone((prev) => ({ ...prev, [year]: !prev[year] }));
    }
  };

  const [dateString, setDateString] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date();
      setDateString(
        today.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      );
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">Loading DTR files...</div>
    );
  }

  if (!batches || Object.keys(batches).length === 0) {
    return (
      <div className="p-10 text-center text-gray-500">No DTR files found</div>
    );
  }

  return (
    <div className="relative bg-surface w-full text-theme p-2 pt-2 overflow-y-hidden">
      <div className="p-1 md:p-5 md:mt-0">
        <div className="flex flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            DTR Processing System
          </h1>
          <span className="text-2xl text-[#222] font-medium">{dateString}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center gap-7 max-w-5xl mx-auto">
        {/* CURRENT */}
        <div className="bg-white rounded-2xl shadow-xl p-6 w-[430px] h-[500px] border border-blue-100 flex flex-col">
          <div className="font-bold text-lg flex items-center gap-2 text-[#223488] mb-2">
            <FolderOpen className="w-6 h-6 text-blue-400" />
            Current DTRs
          </div>

          <div className="overflow-y-auto flex-1 pr-2">
            {Object.keys(currentDTRs)
              .sort((a, b) => b - a)
              .map((year) => (
                <div key={year} className="mb-3">
                  {/* YEAR TOGGLE */}
                  <button
                    className="flex items-center justify-between w-full px-3 py-2 bg-blue-50 rounded border border-blue-200 font-semibold"
                    onClick={() => handleToggle("current", year)}
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="w-5 h-5" />
                      {year}
                    </div>

                    {openCurrent[year] ? <ChevronUp /> : <ChevronDown />}
                  </button>

                  {/* FILES */}
                  {openCurrent[year] && (
                    <ul className="border border-t-0 border-blue-200 rounded-b">
                      {currentDTRs[year].map((item) => (
                        <li
                          key={`${item.batch_id}-${item.uploaded_at}`}
                          className="px-3 py-2 border-t first:border-t-0"
                        >
                          <button
                            className="hover:underline text-[#223488] text-left w-full"
                            onClick={() => {
                              localStorage.setItem(
                                "current_batch_id",
                                item.batch_id,
                              );
                              localStorage.setItem("dtr_fileName", item.label);
                              navigate("/admin/dtr");
                            }}
                          >
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* DONE */}
        <div className="bg-white rounded-2xl shadow-xl p-6 w-[430px] h-[500px] border border-green-100 flex flex-col">
          <div className="font-bold text-lg flex items-center gap-2 text-[#223488] mb-2">
            <Check className="w-6 h-6 text-green-400" />
            DONE DTRs
          </div>

          <div className="overflow-y-auto flex-1 pr-2">
            {Object.keys(doneDTRs)
              .sort((a, b) => b - a)
              .map((year) => (
                <div key={year} className="mb-3">
                  {/* YEAR TOGGLE */}
                  <button
                    className="flex items-center justify-between w-full px-3 py-2 bg-green-50 rounded border border-green-200 font-semibold"
                    onClick={() => handleToggle("done", year)}
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="w-5 h-5" />
                      {year}
                    </div>

                    {openDone[year] ? <ChevronUp /> : <ChevronDown />}
                  </button>

                  {/* FILES */}
                  {openDone[year] && (
                    <ul className="border border-t-0 border-green-200 rounded-b">
                      {doneDTRs[year].map((item) => (
                        <li
                          key={`${item.batch_id}-${item.uploaded_at}`}
                          className="px-3 py-2 border-t first:border-t-0"
                        >
                          <button
                            className="text-green-700 hover:underline text-left w-full"
                            onClick={() => {
                              localStorage.setItem(
                                "current_batch_id",
                                item.batch_id,
                              );
                              localStorage.setItem("dtr_fileName", item.label);
                              navigate("/admin/dtr");
                            }}
                          >
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
