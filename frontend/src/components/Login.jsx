import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});

    try {
      const res = await api.post("/login", formData);
      const accessToken = res.data?.data?.accessToken;
      const userData = res.data?.data?.user;
      const userRole = userData?.role;

      if (accessToken && userRole) {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("user_role", userRole);
        toast.success("Login successful!");
        setTimeout(() => {
          window.location.href = "/home";
        }, 1000);
      } else {
        const missingData = [];
        if (!accessToken) missingData.push("access token");
        if (!userRole) missingData.push("user role");
        toast.error("Login failed - missing required data");
      }
    } catch (err) {
      const backendErrors = err.response?.data?.errors || {
        general: err.response?.data?.message || "Login failed. Please try again.",
      };
      setError(backendErrors);
      toast.error(backendErrors.general);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">
          🎓 Student Login Portal
        </h2>

        {/* Email Field */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
          {error.email && (
            <p className="text-sm text-red-600 mt-1">{error.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="mb-6 relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            placeholder="••••••••"
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-10 cursor-pointer text-gray-500 text-lg"
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
          {error.password && (
            <p className="text-sm text-red-600 mt-1">{error.password}</p>
          )}
        </div>

        {/* Submit Button */}
         <div className="text-right mb-2">
    <Link
      to="/forgot-password"
      className="text-blue-600 hover:underline text-sm"
    >
      Forgot Password?
    </Link>
    
  </div>

  <button
    type="submit"
    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
  >
    🚀 Login
  </button>
      </form>
    </div>
  );
};

export default Login;
