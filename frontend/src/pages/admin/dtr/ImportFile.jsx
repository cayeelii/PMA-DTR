import React, { useState } from "react";
import { CloudDownload, Loader2 } from "lucide-react";

const ImportFile = ({ onUpload }) => {
  const [isUploading, setIsUploading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file); 

    setIsUploading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/dtr/import`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Success: ${result.insertedRows || 0} rows imported.`);
        
        if (onUpload) onUpload(file);
      } else {
        alert(`Error: ${result.message || "Upload failed"}`);
      }

    } catch (error) {
      console.error("Connection error:", error);
      alert("Could not connect to the server.");
    } finally {
      setIsUploading(false);
      e.target.value = null; 
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-12 md:p-10 w-full border border-gray-200">
      <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-6">
        Upload DTR File
      </h2>

      <div className="border-2 border-dashed border-gray-200 rounded-2xl py-16 md:py-20 flex flex-col items-center justify-center bg-[#F8F9FB] hover:bg-gray-100 transition-all cursor-pointer relative group">
        <input
          type="file"
          className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={handleFileChange}
          accept=".xlsx, .xls"
          disabled={isUploading}
        />

        {isUploading ? (
          <Loader2 className="w-12 h-12 text-blue-900 animate-spin" />
        ) : (
          <CloudDownload className="w-12 h-12 text-blue-900" />
        )}
        
        <p className="text-gray-500 font-medium text-center mt-4">
          {isUploading ? "Processing..." : "Click or drag to upload DTR"}
        </p>
      </div>
    </div>
  );
};

export default ImportFile;