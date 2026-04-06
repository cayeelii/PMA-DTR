import React, { useState } from 'react';
import { ChevronLeft, Save, FileText } from 'lucide-react';

const DTREditView = ({ employee, onBack, onSave }) => {
  // Mocking more data to demonstrate scrolling
  const [dtrEntries, setDtrEntries] = useState(
    Array.from({ length: 31 }, (_, i) => ({
      date: `03/${(i + 1).toString().padStart(2, '0')}/26`,
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(2026, 2, i + 1).getDay()],
      amIn: '08:00 AM', amOut: '12:00 PM', pmIn: '01:00 PM', pmOut: '05:00 PM', otIn: '--', otOut: '--'
    }))
  );

  const handleInputChange = (index, field, value) => {
    const updatedEntries = [...dtrEntries];
    updatedEntries[index][field] = value;
    setDtrEntries(updatedEntries);
  };

  return (
    /* 1. Define a height and flex layout for the main card */
    <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-6xl mx-auto border border-gray-100 flex flex-col h-[calc(100vh-100px)] min-h-[500px]">
      
      {/* Header Section - shrink-0 keeps it from collapsing */}
      <div className="p-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              {employee?.name || "Maria Santos"}
              <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">OMA1</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => onSave(dtrEntries)}
            className="flex items-center gap-2 bg-[#449d44] hover:bg-[#398439] text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-sm active:scale-95"
          >
            <Save size={18} />
            Save changes
          </button>
          <button className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-lg font-semibold transition-all active:scale-95">
            <FileText size={18} />
            Generate Report
          </button>
        </div>
      </div>

      {/* 2. Scrollable Table Container */}
      <div className="flex-1 overflow-auto p-6 pt-2">
        <div className="inline-block min-w-full align-middle">
          <table className="w-full text-center border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-100 text-gray-500 uppercase text-[11px] font-bold tracking-widest">
                {/* 3. Use sticky top on the headers */}
                <th className="sticky top-0 z-20 bg-gray-100 py-4 px-2 border-b border-gray-200 first:rounded-tl-lg">Date</th>
                <th className="sticky top-0 z-20 bg-gray-100 py-4 px-2 border-b border-gray-200">Day</th>
                <th className="sticky top-0 z-20 bg-gray-100 py-4 px-2 border-b border-gray-200">AM IN</th>
                <th className="sticky top-0 z-20 bg-gray-100 py-4 px-2 border-b border-gray-200">AM OUT</th>
                <th className="sticky top-0 z-20 bg-gray-100 py-4 px-2 border-b border-gray-200">PM IN</th>
                <th className="sticky top-0 z-20 bg-gray-100 py-4 px-2 border-b border-gray-200">PM OUT</th>
                <th className="sticky top-0 z-20 bg-gray-100 py-4 px-2 border-b border-gray-200">OT IN</th>
                <th className="sticky top-0 z-20 bg-gray-100 py-4 px-2 border-b border-gray-200 last:rounded-tr-lg">OT OUT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {dtrEntries.map((entry, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 text-sm font-medium text-gray-700 whitespace-nowrap">{entry.date}</td>
                  <td className="py-3 text-sm text-gray-500">{entry.day}</td>
                  
                  {['amIn', 'amOut', 'pmIn', 'pmOut', 'otIn', 'otOut'].map((field) => (
                    <td key={field} className="py-1 px-1">
                      <input 
                        type="text"
                        value={entry[field]}
                        onChange={(e) => handleInputChange(idx, field, e.target.value)}
                        className="w-24 text-center py-1.5 border border-gray-200 rounded-full text-[11px] font-semibold text-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none bg-white transition-all shadow-sm"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DTREditView;