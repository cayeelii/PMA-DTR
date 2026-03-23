import React from "react";

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

  const handleToggle = (type, year) => {
    if (type === "current") {
      setOpenCurrent((prev) => ({ ...prev, [year]: !prev[year] }));
    } else {
      setOpenDone((prev) => ({ ...prev, [year]: !prev[year] }));
    }
  };

  // Date for header
  const today = new Date("2026-03-23");
  const dateString = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const FolderIcon = (
    <svg className="w-5 h-5 mr-2 text-gray-600 inline align-middle" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75A2.25 2.25 0 0 1 4.5 4.5h5.379c.414 0 .81.17 1.102.474l1.197 1.252c.292.304.688.474 1.102.474H19.5a2.25 2.25 0 0 1 2.25 2.25v8.25a2.25 2.25 0 0 1-2.25 2.25H4.5A2.25 2.25 0 0 1 2.25 17.25V6.75z" />
    </svg>
  );
  const ArrowDown = (
    <svg className="inline ml-2" width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M6 8l4 4 4-4" stroke="#6b6d6e" strokeWidth="1.5" fill="none"/>
    </svg>
  );
  const ArrowUp = (
    <svg className="inline ml-2" width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M6 12l4-4 4 4" stroke="#6b6d6e" strokeWidth="1.5" fill="none"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#ECEEF3] flex flex-col items-center justify-start py-8 px-2">
      {/* Header */}
      <div className="flex items-center w-full max-w-4xl mb-8">
        <span className="text-2xl font-semibold text-[#222] ml-2 flex-1">DTR Processing System</span>
        <span className="text-lg text-[#222] font-medium">{dateString}</span>
      </div>

      {/* Main Content */}
      <div className="flex justify-center items-start gap-16 w-full max-w-4xl">
        {/* Current DTRs */}
        <div className="min-w-[320px]">
          <div className="font-semibold text-lg px-2 py-2">Current DTRs</div>
          <div>
          {Object.keys(currentDTRs).sort((a,b)=>b-a).map((year) => (
              <div key={year} className="mb-4">
              <button
                className="flex items-center w-full px-2 py-1 bg-[#dddddd] rounded border border-gray-200 text-left text-black font-medium focus:outline-none shadow-sm"
                onClick={() => handleToggle("current", year)}
              >
                {FolderIcon}
                {year}
                {openCurrent[year] ? ArrowUp : ArrowDown}
              </button>
              {openCurrent[year] && (
                <ul className="border border-t-0 border-gray-300 rounded-b bg-white">
                  {currentDTRs[year].length === 0 ? (
                    <li className="px-4 py-2 text-gray-400 text-sm">No DTRs</li>
                  ) : (
                    currentDTRs[year].map((item, idx) => (
                      <li key={idx} className="px-4 py-2 border-t border-gray-100 text-gray-700 text-sm">
                        <button
                          type="button"
                          className="transition-colors text-black hover:text-blue-600 hover:underline focus:text-blue-600 focus:underline outline-none bg-transparent p-0 m-0"
                        >
                          {item}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          ))}
          </div>
        </div>

        {/* DONE DTRs */}
        <div className="min-w-[320px]">
          <div className="font-semibold text-lg px-2 py-2">DONE DTRs</div>
          <div>
          {Object.keys(doneDTRs).sort((a,b)=>b-a).map((year) => (
              <div key={year} className="mb-4">
              <button
                className="flex items-center w-full px-2 py-1 bg-[#dddddd] rounded border border-gray-200 text-left text-black font-medium focus:outline-none shadow-sm"
                onClick={() => handleToggle("done", year)}
              >
                {FolderIcon}
                {year}
                {openDone[year] ? ArrowUp : ArrowDown}
              </button>
              {openDone[year] && (
                <ul className="border border-t-0 border-gray-300 rounded-b bg-white">
                  {doneDTRs[year].length === 0 ? (
                    <li className="px-4 py-2 text-gray-400 text-sm">No DTRs</li>
                  ) : (
                    doneDTRs[year].map((item, idx) => (
                      <li key={idx} className="px-4 py-2 border-t border-gray-100 text-gray-700 text-sm">
                        {item.includes("Archive") ? (
                          <button
                            type="button"
                            className="transition-colors text-black hover:text-blue-600 hover:underline focus:text-blue-600 focus:underline outline-none bg-transparent p-0 m-0"
                          >
                            {item}
                          </button>
                        ) : item}
                      </li>
                    ))
                  )}
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