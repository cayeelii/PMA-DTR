import React, { useState } from "react";
import { X, User, KeyRound, ChevronDown } from "lucide-react";

const AddAdminModal = ({
  isOpen,
  onClose,
  onAddUser,
  roleOptions = ["Admin"],
}) => {
  // Use the same password rule as the backend.
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  const normalizeRoleValue = (role) => role.toLowerCase().replace(/\s+/g, "");
  const [formData, setFormData] = useState({
    username: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (!passwordRegex.test(formData.password)) {
      setErrorMessage(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
      );
      return;
    }

    const newUser = {
      username: formData.username,
      password: formData.password,
      role: normalizeRoleValue(formData.role),
    };

    try {
      if (onAddUser) await onAddUser(newUser);
      setErrorMessage("");
      setFormData({
        username: "",
        role: "",
        password: "",
        confirmPassword: "",
      });
      onClose();
    } catch (error) {
      setErrorMessage(error.message || "Failed to add user.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Add User</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="border-t border-gray-200 mb-6"></div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => {
                    setErrorMessage("");
                    setFormData({ ...formData, username: e.target.value });
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                User Role
              </label>
              <div className="relative">
                <select
                  value={formData.role}
                  onChange={(e) => {
                    setErrorMessage("");
                    setFormData({ ...formData, role: e.target.value });
                  }}
                  className="w-full appearance-none px-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose User Role</option>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setErrorMessage("");
                    setFormData({ ...formData, password: e.target.value });
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Use at least 8 characters with uppercase, lowercase, number,
                and special character.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setErrorMessage("");
                  setFormData({ ...formData, confirmPassword: e.target.value });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#FEAF01] text-black font-semibold py-2 rounded-lg hover:bg-[#ffc940] transition"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdminModal;
