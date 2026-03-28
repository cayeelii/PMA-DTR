import React, { useState } from "react";
import UploadView from "../../components/ImportFile";
import DepartmentView from "../../components/DepartmentView";

const DTRManagement = () => {
  const [step, setStep] = useState(1);
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (file) => {
    setFileName(file.name);
    setStep(2);
  };

  return (
    <div className="relative bg-surface w-full text-theme p-2 pt-2 overflow-y-hidden">
      <div className="p-1 md:p-5 md:mt-0">
        <div className="flex flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-[#222]">
            DTR Management
          </h1>
        </div>

        {step === 1 ? (
          <UploadView onUpload={handleFileUpload} />
        ) : (
          <DepartmentView fileName={fileName} onReset={() => setStep(1)} />
        )}
      </div>
    </div>
  );
};

export default DTRManagement;
