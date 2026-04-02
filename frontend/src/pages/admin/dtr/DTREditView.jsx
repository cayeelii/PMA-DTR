import React, { useState } from 'react';
import { ChevronLeft, Save, FileText } from 'lucide-react';

const DTREditView = ({ employee, onBack, onSave }) => {
  const [dtrEntries, setDtrEntries] = useState([
    { date: '03/01/26', day: 'Mon', amIn: '08:05 AM', amOut: '11:59 AM', pmIn: '12:31 PM', pmOut: '05:00 PM', otIn: '--', otOut: '--' },
    { date: '03/02/26', day: 'Tue', amIn: '08:05 AM', amOut: '11:55 AM', pmIn: '12:35 PM', pmOut: '05:05 PM', otIn: '--', otOut: '--' },
    { date: '03/03/26', day: 'Wed', amIn: '07:55 AM', amOut: '11:59 AM', pmIn: '12:40 PM', pmOut: '05:05 PM', otIn: '--', otOut: '--' },
    { date: '03/04/26', day: 'Thurs', amIn: '07:55 AM', amOut: '11:59 AM', pmIn: '12:40 PM', pmOut: '05:05 PM', otIn: '--', otOut: '--' },
    { date: '03/05/26', day: 'Fri', amIn: '07:51 AM', amOut: '11:59 AM', pmIn: '12:42 PM', pmOut: '05:00 PM', otIn: '--', otOut: '--' },
    { date: '03/06/26', day: 'Sat', amIn: '07:58 AM', amOut: '11:59 AM', pmIn: '01:00 PM', pmOut: '05:00 PM', otIn: '--', otOut: '--' },
    { date: '03/07/26', day: 'Sun', amIn: '07:58 AM', amOut: '11:59 AM', pmIn: '01:00 PM', pmOut: '05:00 PM', otIn: '--', otOut: '--' },
  ]);

  const handleInputChange = (index, field, value) => {
    const updatedEntries = [...dtrEntries];
    updatedEntries[index][field] = value;
    setDtrEntries(updatedEntries);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-6xl mx-auto border border-gray-100">
      <div className="p-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
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
            className="flex items-center gap-2 bg-[#449d44] hover:bg-[#398439] text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-sm"
          >
            <Save size={18} />
            Save changes
          </button>
          <button className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-lg font-semibold transition-all">
            <FileText size={18} />
            Generate Report
          </button>
        </div>
      </div>

      {/* DTR Table */}
      <div className="p-6 overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-500 uppercase text-[11px] font-bold tracking-widest">
              <th className="py-4 px-2">Date</th>
              <th className="py-4 px-2">Day</th>
              <th className="py-4 px-2">AM IN</th>
              <th className="py-4 px-2">AM OUT</th>
              <th className="py-4 px-2">PM IN</th>
              <th className="py-4 px-2">PM OUT</th>
              <th className="py-4 px-2">OT IN</th>
              <th className="py-4 px-2">OT OUT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dtrEntries.map((entry, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 text-sm font-medium text-gray-700">{entry.date}</td>
                <td className="py-4 text-sm text-gray-500">{entry.day}</td>
                
                {/* Editable Time Inputs */}
                {['amIn', 'amOut', 'pmIn', 'pmOut', 'otIn', 'otOut'].map((field) => (
                  <td key={field} className="py-2 px-1">
                    <input 
                      type="text"
                      value={entry[field]}
                      onChange={(e) => handleInputChange(idx, field, e.target.value)}
                      className="w-24 text-center py-1.5 border border-gray-300 rounded-full text-[11px] font-semibold text-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none bg-white transition-all shadow-sm"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DTREditView;