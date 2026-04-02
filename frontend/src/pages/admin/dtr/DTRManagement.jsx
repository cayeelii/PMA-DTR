import React, { useState } from "react";
import UploadView from "./ImportFile";
import DepartmentView from "./DepartmentView";
import EmployeeView from "./EmployeeView";
import DTREditView from "./DTREditView";

const DTRManagement = () => {
  const [step, setStep] = useState(1);
  const [fileName, setFileName] = useState("");
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleFileUpload = (file) => {
    setFileName(file.name);
    setStep(2); 
  };

  const handleDepartmentSelect = (dept) => {
    setSelectedDept(dept);
    setStep(3); 
  };

  const handleEmployeeSelect = (emp) => {
    setSelectedEmployee(emp);
    setStep(4); 
  };

  const resetProcess = () => {
    setFileName("");
    setSelectedDept(null);
    setStep(1);
  };

  return (
    <div className="relative bg-surface w-full text-theme p-2 pt-2 overflow-y-hidden">
      <div className="p-1 md:p-5 md:mt-0">
        <div className="flex flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">DTR Management</h1>
        </div>

        {/* Progress Stepper UI */}
        {step > 1 && (
        <div className="flex items-center justify-center mb-12 max-w-4xl mx-auto">
          {[
            { id: 1, label: "Department", sub: "Select department" },
            { id: 2, label: "Employees", sub: "Select employee" },
            { id: 3, label: "DTR", sub: "Edit entries" },
            { id: 4, label: "Report", sub: "Generate Output" },
          ].map((item, index, arr) => (
            <React.Fragment key={item.id}>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 
                  ${
                    step > index + 2
                      ? "bg-[#00154d] text-white border-[#00154d]"
                      : step === index + 2
                        ? "bg-orange-400 text-white border-orange-400"
                        : "bg-white text-gray-300 border-gray-200"
                  }`}
                >
                  {item.id}
                </div>
                <div className="hidden md:block">
                  <p
                    className={`text-sm font-bold ${step >= index + 2 ? "text-gray-800" : "text-gray-300"}`}
                  >
                    {item.label}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-tighter">
                    {item.sub}
                  </p>
                </div>
              </div>
              {index < arr.length - 1 && (
                <div className={`w-12 md:w-20 h-[2px] mx-4 ${step > index + 2 ? "bg-[#00154d]" : "bg-gray-200"}`} />
              )}
            </React.Fragment>
          ))}
        </div>
        )}

        {/* View Switcher */}
        <div className="mt-8">
          {step === 1 && <UploadView onUpload={handleFileUpload} />}

          {step === 2 && (
            <DepartmentView
              fileName={fileName}
              onReset={resetProcess}
              onSelect={handleDepartmentSelect}
            />
          )}

          {step === 3 && (
            <EmployeeView
              departmentName={selectedDept?.name || "AICTC"}
              onBack={() => setStep(2)}
              onSelectEmployee={handleEmployeeSelect}
            />
          )}

          {step === 4 && (
            <DTREditView
              employee={selectedEmployee}
              onBack={() => setStep(3)}
              onSave={(updatedData) => {
                console.log("Data to save:", updatedData);
                // Logic for backend
                setStep(3);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DTRManagement;