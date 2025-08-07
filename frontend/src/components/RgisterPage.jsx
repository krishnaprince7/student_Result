import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";

import axios from "axios";
import { useNavigate } from "react-router-dom";


const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";

const RegisterPage = () => {
 
  const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullname: "",
    password: "",
  });

  const [responseMsg, setResponseMsg] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isRegistered, setIsRegistered] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/register", formData);

      // Show "Registered..." immediately
      setIsRegistered(true);

      // Show toast immediately
      setTimeout(() => toast.success("Registered successfully!"), 3000);

      // Clear form fields
      setTimeout(() => {
        setFormData({
          username: "",
          email: "",
          fullname: "",
          password: "",
            role: "student",
        });
      }, 3000);
      setFormErrors({});

      // Revert button text after 2 seconds
      setTimeout(() => setIsRegistered(false), 2000);
    } catch (error) {
      console.error("❌ Error:", error.response?.data || error.message);
      const backendErrors = error.response?.data?.errors || {};
      setFormErrors(backendErrors);
    }
  };

    const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Toaster position="top-right" />
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Student Register Portal
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Enter full name"
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-200 outline-none"
            />
            {formErrors.fullname && (
              <p className="text-sm text-red-600 mt-1">{formErrors.fullname}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-200 outline-none"
            />
            {formErrors.username && (
              <p className="text-sm text-red-600 mt-1">{formErrors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-200 outline-none"
            />
            {formErrors.email && (
              <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
            )}
          </div>

          <div>
  <label className="block text-sm font-medium text-gray-700">
    Role
  </label>
  <select
    name="role"
    value={formData.role}
    onChange={handleChange}
    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-200 outline-none"
  >
    <option value="student">Student</option>
    <option value="teacher">Teacher</option>
  </select>
  {formErrors.role && (
    <p className="text-sm text-red-600 mt-1">{formErrors.role}</p>
  )}
</div>


          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-200 outline-none"
            />
            {formErrors.password && (
              <p className="text-sm text-red-600 mt-1">
                {formErrors?.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            {isRegistered ? "Registered..." : "Create User"}
          </button>
        </form>

        {responseMsg && (
          <p className="mt-4 text-center text-green-600 font-medium">
            {responseMsg}
          </p>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
