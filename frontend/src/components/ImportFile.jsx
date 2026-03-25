import React from 'react';
import { CloudDownload } from 'lucide-react';

const ImportFile = ({ onUpload }) => {
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-10 max-w-5xl mx-auto mt-7">
      <h2 className="text-xl font-bold text-gray-800 mb-8">Upload DTR File</h2>

      <div className="border-2 border-dashed border-gray-200 rounded-2xl py-24 flex flex-col items-center justify-center bg-[#F8F9FB] hover:bg-gray-50 transition-all cursor-pointer relative group">
        <input 
          type="file" 
          className="absolute inset-0 opacity-0 cursor-pointer" 
          onChange={handleFileChange} 
          accept=".xlsx, .xls"
        />
        
        <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
          <CloudDownload className="w-12 h-12 text-gray-400" />
        </div>
        
        <p className="text-gray-500 font-medium">Import your file</p>
      </div>
    </div>
  );
};

export default ImportFile;