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
  const [modalOpen, setModalOpen] = React.useState(false);
  // eslint-disable-next-line no-unused-vars
  const [selectedMonth, setSelectedMonth] = React.useState(null);

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

  // Sample data for modal
  const departmentRows = [
    { name: "Tactical Department", status: "Complete" },
    { name: "Accounting", status: "Complete" },
    { name: "Procurement/Contracting", status: "Complete" },
    { name: "Information", status: "Complete" },
    { name: "Dental", status: "Complete" },
    { name: "ACDI", status: "Complete" },
  ];

  const [search, setSearch] = React.useState("");
  const filteredRows = departmentRows.filter(row =>
    row.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleMonthClick = (month) => {
    setSelectedMonth(month);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMonth(null);
  };

  return (
    <div className="min-h-screen bg-[#ECEEF3] flex flex-col items-center justify-start py-6 px-2 sm:py-8 sm:px-4 md:px-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center w-full max-w-4xl mb-6 sm:mb-8 gap-2 sm:gap-0">
        <span className="text-xl sm:text-2xl font-semibold text-[#222] sm:ml-2 flex-1 text-center sm:text-left">DTR Processing System</span>
        <span className="text-base sm:text-lg text-[#222] font-medium text-center sm:text-right">{dateString}</span>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row justify-center items-stretch md:items-start gap-6 md:gap-12 lg:gap-16 w-full max-w-4xl">
        {/* Current DTRs */}
        <div className="min-w-[90vw] sm:min-w-[320px] max-w-full md:max-w-xs mx-auto md:mx-0">
          <div className="font-semibold text-base sm:text-lg px-2 py-2">Current DTRs</div>
          <div>
          {Object.keys(currentDTRs).sort((a,b)=>b-a).map((year) => (
              <div key={year} className="mb-3 sm:mb-4">
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
                          onClick={() => handleMonthClick(item)}
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
        <div className="min-w-[90vw] sm:min-w-[320px] max-w-full md:max-w-xs mx-auto md:mx-0">
          <div className="font-semibold text-base sm:text-lg px-2 py-2">DONE DTRs</div>
          <div>
          {Object.keys(doneDTRs).sort((a,b)=>b-a).map((year) => (
              <div key={year} className="mb-3 sm:mb-4">
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
                            onClick={() => handleMonthClick(item)}
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
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl mx-2 sm:mx-4 relative animate-fadeIn">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 bg-[#223488] rounded-t-lg gap-2 sm:gap-0">
              <div className="flex items-center w-full">
                <span className="bg-white rounded-full px-2 py-1 flex items-center max-w-xs w-full">
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" /></svg>
                  <input
                    type="text"
                    placeholder="Search Department"
                    className="w-full outline-none bg-transparent text-sm"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </span>
              </div>
              <button className="sm:ml-4 text-white text-xl font-bold hover:text-red-400" onClick={closeModal}>&times;</button>
            </div>
            {/* Modal Table */}
            <div className="px-2 sm:px-6 py-4 overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-semibold">Department Name</th>
                    <th className="text-left py-2 font-semibold">Status</th>
                    <th className="text-left py-2 font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-gray-400">No departments found.</td>
                    </tr>
                  ) : (
                    filteredRows.map((row, idx) => (
                      <tr key={idx} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="py-2">{row.name}</td>
                        <td className="py-2"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">{row.status}</span></td>
                        <td className="py-2"><button className="text-[#223488] hover:underline">view details</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;