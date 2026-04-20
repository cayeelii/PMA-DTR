import { useState } from "react";
import { useNavigate } from "react-router-dom";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const ChangePassword = () => {
  const navigate = useNavigate();


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


  const handleSubmit = async (e) => {
    e.preventDefault();


    //  Check if new passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
 
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });


      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Error changing password");
        return;
      }

      alert("You've successfully changed your password");

      navigate("/employee/home");

    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-auto">
      <div className="max-w-xl w-full p-10 border rounded-lg shadow-lg bg-white">
        <h1 className="text-2xl font-bold mb-6">Change Password</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full p-4 border rounded" 
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full p-4 border rounded" 
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-4 border rounded" 
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
              onClick={() => navigate("/employee/employee-profile")}
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