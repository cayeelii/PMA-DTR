
import React from "react";
import { Check, ChevronDown, ChevronUp, Folder, FolderOpen } from "lucide-react";
import HomeDepartment from "../../components/HomeDepartment";

function HomePage() {
  const currentDTRs = {
    2025: ["March (Completed)", "February (Completed)", "January (Completed)"],
    2024: [],
    2023: [],
  };
  const doneDTRs = {
    2024: [
      "December (Archive)",
      "November (Archive)",
      "October (Archive)",
      "July (Archive)",
      "June (Archive)",
      "May (Archive)",
      "April (Archive)",
    ],
    2023: [],
    2022: [],
  };
  const [openCurrent, setOpenCurrent] = React.useState({2025: true, 2024: false, 2023: false});
  const [openDone, setOpenDone] = React.useState({2024: true, 2023: false, 2022: false});
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState(null);

  const handleToggle = (type, year) => {
    if (type === "current") {
      setOpenCurrent((prev) => ({ ...prev, [year]: !prev[year] }));
    } else {
      setOpenDone((prev) => ({ ...prev, [year]: !prev[year] }));
    }
  };


  const [dateString, setDateString] = React.useState(() => {
    const today = new Date();
    return today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date();
      setDateString(today.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }));
    }, 60 * 1000); 
    return () => clearInterval(interval);
  }, []);

  const handleMonthClick = (month) => {
    setSelectedMonth(month);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMonth(null);
  };

  return (
      <div className="relative bg-surface w-full text-theme p-2 pt-2 overflow-y-hidden">
          <div className="p-1 md:p-5 md:mt-0">
              <div className="flex flex-row md:items-center justify-between mb-6 gap-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-primary">
                      DTR Processing System
                  </h1>
                  <span className="text-2xl text-[#222] font-medium">
                      {dateString}
                  </span>
              </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col md:flex-row justify-center items-stretch md:items-start gap-8 md:gap-12 lg:gap-16 max-w-5xl">
              {/* Current DTRs */}
              <div className="bg-white/90 rounded-2xl shadow-xl p-6 min-w-0 sm:min-w-[320px] md:max-w-xs mx-auto md:mx-0 border border-blue-100 hover:shadow-2xl transition-shadow duration-300">
                  <div className="font-bold text-lg sm:text-xl px-2 py-2 text-[#223488] flex items-center gap-2">
                      <FolderOpen className="w-6 h-6 text-blue-400" strokeWidth={2} />
                      Current DTRs
                  </div>
                  <div>
                      {Object.keys(currentDTRs)
                          .sort((a, b) => b - a)
                          .map((year) => (
                              <div key={year} className="mb-3 sm:mb-4">
                                  <button
                                      className="flex items-center w-full px-2 py-1 bg-blue-50 rounded border border-blue-200 text-left text-[#223488] font-semibold focus:outline-none shadow-sm hover:bg-blue-100 transition-colors duration-200"
                                      onClick={() =>
                                          handleToggle("current", year)
                                      }
                                  >
                                      <Folder className="w-5 h-5 mr-2 text-gray-600 inline align-middle" strokeWidth={1.5} />
                                      {year}
                                      {openCurrent[year] ? (
                                          <ChevronUp className="inline ml-2" size={18} color="#656869" strokeWidth={1.5} />
                                      ) : (
                                          <ChevronDown className="inline ml-2" size={18} color="#656869" strokeWidth={1.5} />
                                      )}
                                  </button>
                                  {openCurrent[year] && (
                                      <ul className="border border-t-0 border-blue-200 rounded-b bg-white animate-fadeIn">
                                          {currentDTRs[year].length === 0 ? (
                                              <li className="px-4 py-2 text-gray-400 text-sm">
                                                  No DTRs
                                              </li>
                                          ) : (
                                              currentDTRs[year].map(
                                                  (item, idx) => (
                                                      <li
                                                          key={idx}
                                                          className="px-4 py-2 border-t border-blue-50 text-gray-700 text-sm"
                                                      >
                                                          <button
                                                              type="button"
                                                              className="transition-colors text-[#223488] hover:text-blue-600 hover:underline focus:text-blue-600 focus:underline outline-none bg-transparent p-0 m-0 font-medium"
                                                              onClick={() =>
                                                                  handleMonthClick(
                                                                      item,
                                                                  )
                                                              }
                                                          >
                                                              {item}
                                                          </button>
                                                      </li>
                                                  ),
                                              )
                                          )}
                                      </ul>
                                  )}
                              </div>
                          ))}
                  </div>
              </div>

              {/* DONE DTRs */}
              <div className="bg-white/90 rounded-2xl shadow-xl p-6 min-w-0 sm:min-w-[320px] md:max-w-xs mx-auto md:mx-0 border border-blue-100 hover:shadow-2xl transition-shadow duration-300">
                  <div className="font-bold text-lg sm:text-xl px-2 py-2 text-[#223488] flex items-center gap-2">
                      <Check className="w-6 h-6 text-green-400" strokeWidth={2} />
                      DONE DTRs
                  </div>
                  <div>
                      {Object.keys(doneDTRs)
                          .sort((a, b) => b - a)
                          .map((year) => (
                              <div key={year} className="mb-3 sm:mb-4">
                                  <button
                                      className="flex items-center w-full px-2 py-1 bg-green-50 rounded border border-green-200 text-left text-green-700 font-semibold focus:outline-none shadow-sm hover:bg-green-100 transition-colors duration-200"
                                      onClick={() => handleToggle("done", year)}
                                  >
                                      <Folder className="w-5 h-5 mr-2 text-gray-600 inline align-middle" strokeWidth={1.5} />
                                      {year}
                                      {openDone[year] ? (
                                          <ChevronUp className="inline ml-2" size={18} color="#656869" strokeWidth={1.5} />
                                      ) : (
                                          <ChevronDown className="inline ml-2" size={18} color="#656869" strokeWidth={1.5} />
                                      )}
                                  </button>
                                  {openDone[year] && (
                                      <ul className="border border-t-0 border-green-200 rounded-b bg-white animate-fadeIn">
                                          {doneDTRs[year].length === 0 ? (
                                              <li className="px-4 py-2 text-gray-400 text-sm">
                                                  No DTRs
                                              </li>
                                          ) : (
                                              doneDTRs[year].map(
                                                  (item, idx) => (
                                                      <li
                                                          key={idx}
                                                          className="px-4 py-2 border-t border-green-50 text-gray-700 text-sm"
                                                      >
                                                          {item.includes(
                                                              "Archive",
                                                          ) ? (
                                                              <button
                                                                  type="button"
                                                                  className="transition-colors text-green-700 hover:text-green-900 hover:underline focus:text-green-900 focus:underline outline-none bg-transparent p-0 m-0 font-medium"
                                                                  onClick={() =>
                                                                      handleMonthClick(
                                                                          item,
                                                                      )
                                                                  }
                                                              >
                                                                  {item}
                                                              </button>
                                                          ) : (
                                                              item
                                                          )}
                                                      </li>
                                                  ),
                                              )
                                          )}
                                      </ul>
                                  )}
                              </div>
                          ))}
                  </div>
              </div>
          </div>

          <HomeDepartment
              open={modalOpen}
              onClose={closeModal}
              selectedMonth={selectedMonth}
          />
      </div>
  );
}

export default HomePage;