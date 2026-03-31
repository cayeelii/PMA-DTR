import React from 'react';
import { CloudDownload } from 'lucide-react';

const ImportFile = ({ onUpload }) => {
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-12 md:p-10 w-full border border-gray-200">
      <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-6">Upload DTR File</h2>

      <div className="border-2 border-dashed border-gray-200 rounded-2xl py-16 md:py-20 flex flex-col items-center justify-center bg-[#F8F9FB] hover:bg-gray-100 transition-all cursor-pointer relative group">
        <input 
          type="file" 
          className="absolute inset-0 opacity-0 cursor-pointer" 
          onChange={handleFileChange} 
          accept=".xlsx, .xls"
        />
          <CloudDownload className="w-12 h-12 text-blue-900" />
        
        <p className="text-gray-500 font-medium text-center">Import your file</p>
      </div>
    </div>
  );
};

export default ImportFile;