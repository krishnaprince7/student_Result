import React, { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

const SendOtp = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(""); // changed from errors object
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate()

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(""); // reset
    setLoading(true);
    try {
      const res = await api.post(`/send-otp`, { email });
      if (res?.data?.success) {

        toast.success(res?.data?.message || "OTP sent!");
        setTimeout(()=>{
            navigate("/verify-password")
        },1500)
        setEmail("");
      } else {
        // backend failed but returned 200
        setError(res.data.message || "Something went wrong");
      }
    } catch (err) {
      const backendMsg = err.response?.data?.message;
      setError(backendMsg || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Toaster position="top-right" />
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          🔐 Forgot Password
        </h2>
        <form onSubmit={handleSendOtp}>
          <div className="mb-5">
            <label className="block mb-1 font-medium text-gray-700">
              Email
            </label>
            <input
              type=""
              className={`w-full border ${
                error ? "border-red-200" : "border-gray-300"
              } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                error ? "focus:ring-red-400" : "focus:ring-blue-500"
              }`}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "📩 Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendOtp;
