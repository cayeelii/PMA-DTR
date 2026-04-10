import { useState } from "react";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Change Password submitted", formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-auto">
        <div className="max-w-md w-full p-6 border rounded-lg shadow-lg bg-white">         
            <h1 className="text-2xl font-bold mb-6">Change Password</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                />
                </div>
                <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                />
                </div>
                <div>
                <label className="block text-sm font-medium mb-1">Confirm Password</label>
                <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                />
                </div>
                <div className="flex justify-end gap-2">
                <button
                    type="submit"
                    className="px-4 py-2 bg-[#0F1E4D] text-white rounded hover:bg-[#0a1435]"
                >
                    Save
                </button>
                <button
                    type="button"
                    className="px-4 py-2 bg-white text-black border rounded hover:bg-gray-100"
                    onClick={() => {
                    // Reset form or navigate away
                    console.log("Cancel clicked");
                    }}
                >
                    Cancel
                </button>
                </div>
            </form>
        </div> 
    </div>
  );
};

export default ChangePassword;