import React from "react";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmployeeProfilePage = () => {
  const navigate = useNavigate(); 
  
  return (
    <div className="relative bg-surface w-full text-theme p-2 pt-2 overflow-y-hidden">
      <div className="p-1 md:p-5 md:mt-0">
        <div className="flex flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-black">Profile</h1>
        </div>

        <div className="flex justify-center mb-12">
          <div className="w-full max-w-lg h-[420px] bg-white rounded-xl shadow overflow-hidden border border-gray-200 relative">
            {/* Profile Header */}
            <div className="absolute top-4 left-4 right-4 pt-3 pb-1 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-white border-2 border-black rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-7 h-7 md:w-8 md:h-8 text-black" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-black leading-tight">
                  Pedro Penduko
                </h2>
              </div>
              <div className="h-px bg-gray-300 opacity-60 mx-2 self-stretch"></div>
            </div>

            {/* Profile Fields */}
            <div className="absolute top-[120px] left-4 right-4 space-y-4 px-1">
              <div>
                <h3 className="text-xl md:text-2xl text-black mb-1.5 ml-1.5">BIO ID</h3>
                <div className="bg-orange-300 w-full h-9 border-2 border-gray-50 rounded-lg flex items-center px-2.5 text-lg md:text-xl text-black-700">
                  012345
                </div>
              </div>

              <div>
                <h3 className="text-xl md:text-2xl text-black mb-1.5 ml-1.5">Name</h3>
                <div className="w-full h-9 border-2 border-gray-200 rounded-lg flex items-center px-2.5 text-lg md:text-xl text-black-700">
                  Pedro Penduko
                </div>
              </div>

              <div>
                <h3 className="text-xl md:text-2xl text-black mb-1.5 ml-1.5">Department</h3>
                <div className="w-full h-9 border-2 border-gray-200 rounded-lg flex items-center px-2.5 text-lg md:text-xl text-black-700">
                  OMA07
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SMALLER Change Password Button */}
        <div className="flex justify-center mt-8">
          <button 
            className="bg-amber-400 hover:bg-amber-500 text-gray-900 px-6 py-1.5 rounded-lg text-lg font-medium shadow-lg border-none focus:outline-none"
            onClick={() => navigate("/employee/employee-change-password")}
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfilePage;