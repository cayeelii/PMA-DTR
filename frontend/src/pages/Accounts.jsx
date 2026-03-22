import { useState } from "react";
import { Delete, PenLine, KeyRound, Trash, Search, X, User } from "lucide-react";

const mockData = Array(15).fill({
  timestamp: "",
  user: "",
  role: "",
  department: "",
  head: ""
});
const PAGE_SIZE = 5; 

function AccountsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const filtered = mockData.filter((row) =>
    row.user.toLowerCase().includes(search.toLowerCase()) ||
    row.department.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const AddUserModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
      username: "",
      role: "",
      password: "",
      confirmPassword: ""
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (formData.password !== formData.confirmPassword) { 
        alert("Passwords do not match");
        return;
      }
      console.log("Add user:", formData);  
      onClose();
      setFormData({ username: "", role: "", password: "", confirmPassword: "" });
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Add User</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="border-t border-gray-300 mb-6"></div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 grid grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"              
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">User Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  required
                >
                  <option value="">Choose User Role</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#FEAF01] text-black font-semibold py-2 px-4 rounded-lg hover:bg-[#ffc940] transition text-sm"
              >
                Add User
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  
  return (
    <div className="min-h-screen bg-[#ECEEF3] p-8">
  <div className="mb-6">
    <h1 className="text-3xl font-bold">Accounts</h1>
  </div>

  <div className="flex justify-between items-center mb-4">
    <div className="relative w-64">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Search className="w-5 h-5" />
      </span>
      <input
        type="text"
        placeholder="Search User"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
      />
    </div>

    <button 
      onClick={() => setIsModalOpen(true)}
      className="bg-[#FEAF01] text-black font-medium px-4 py-2 rounded flex items-center gap-2 hover:bg-[#ffc940] transition"
    >
      <span className="text-xl">+</span> Add User
    </button>
  </div>


      <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-gray-200">
        <table className="min-w-full border rounded-lg">
          <thead className="bg-[#E5E7EB] border-b border-gray-400">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">
                Timestamp Created
              </th>
              <th className="px-6 py-3 text-left font-semibold">User</th>
              <th className="px-6 py-3 text-left font-semibold">Role</th>
              <th className="px-6 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="[&>tr:last-child]:border-b-0">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No results found.
                </td>
              </tr>
            ) : (
              paginated.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-200 even:bg-[#E5E7EB] hover:bg-gray-100 transition-colors duration-150">
                  <td className="px-6 py-4">{row.timestamp}</td>
                  <td className="px-6 py-4">{row.user}</td>
                  <td className="px-6 py-4">{row.role}</td>
                  <td className="px-6 py-4">
                    <button className="hover:text-blue-600" title="Edit">
                      <PenLine className="w-5 h-5 inline" />
                    </button>
                    <button className="hover:text-gray-600" title="Reset">
                      <KeyRound className="w-5 h-5 inline" />
                    </button>
                    <button className="hover:text-red-600" title="Delete">
                      <Trash className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}


export default AccountsPage;



