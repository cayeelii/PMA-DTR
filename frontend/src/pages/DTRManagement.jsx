import React, { useState } from 'react';
import UploadView from '../components/ImportFile';
import DepartmentView from '../components/DepartmentView';

const DTRManagement = () => {
  const [step, setStep] = useState(1); 
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (file) => {
    setFileName(file.name);
    setStep(2); 
  };

  return (
    <div className="min-h-screen bg-[#ECEEF3] p-1 md:p-5">
      <div className="flex flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[#222]">DTR Management</h1>
      </div>

      {step === 1 ? (
        <UploadView onUpload={handleFileUpload} />
      ) : (
        <DepartmentView fileName={fileName} onReset={() => setStep(1)} />
      )}
    </div>
  );
};

export default DTRManagement;