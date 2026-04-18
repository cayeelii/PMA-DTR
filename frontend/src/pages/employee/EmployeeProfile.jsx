import React from 'react';
import { User } from 'lucide-react';

const EmployeeProfilePage = () => {
  return (
    <div className="relative bg-surface w-full text-theme p-2 pt-2 overflow-y-hidden">
      <div className="p-1 md:p-5 md:mt-0">

        <div className="flex flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-black">Profile</h1>
        </div>

        <div className="flex justify-center mb-12">
          <div className="w-full max-w-4xl h-[600px] bg-white rounded-xl shadow overflow-hidden border border-gray-200 relative">
            {/* Profile Header */}
            <div className="absolute top-8 left-8 right-8 flex flex-col gap-4">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 md:w-28 md:h-28 bg-white border-4 border-black rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-10 h-10 md:w-12 md:h-12 text-black" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-black leading-tight">
                  Andres Bonifacio
                </h2>
              </div>
              
              <div className="h-px bg-gray-300 opacity-60 mx-4"></div>
            </div>

            {/* Profile Fields */}
            <div className="absolute top-[220px] left-12 right-12 space-y-8">
              <div>
                <h3 className="text-xl md:text-2xl text-black mb-3 ml-2">BIO ID</h3>
                <div className="bg-orange-300 w-full h-12 border-2 border-gray-50 rounded-lg flex items-center px-4 text-lg md:text-xl text-black-700">
                  OMA101
                </div>
              </div>

              <div>
                <h3 className="text-xl md:text-2xl text-black mb-3 ml-2">Name</h3>
                <div className="w-full h-12 border-2 border-gray-200 rounded-lg flex items-center px-4 text-lg md:text-xl text-black-700">
                  Jasper Talom
                </div>
              </div>

              <div>
                <h3 className="text-xl md:text-2xl text-black mb-3 ml-2">Department</h3>
                <div className="w-full h-12 border-2 border-gray-200 rounded-lg flex items-center px-4 text-lg md:text-xl text-black-700">
                  OMA07
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Button */}
        <div className="flex justify-center mt-8"> 
          <button className="bg-amber-400 hover:bg-amber-500 text-gray-900 px-7 py-2 rounded-lg text-xl font-medium shadow-lg border-none focus:outline-none">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfilePage;