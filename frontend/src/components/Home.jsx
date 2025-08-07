import React, { useEffect, useState } from "react";
import { FaUserGraduate, FaClipboardList, FaChartBar } from "react-icons/fa";
import axios from "axios";
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

const Home = () => {
  const [count, setCount] = useState({});
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const role = localStorage.getItem("user_role");
      setUserRole(role);

      try {
        const res = await api.get("/countstudent");
        setCount(res.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="bg-white rounded-xl shadow p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {userRole === "teacher" ? "Teacher Dashboard" : "Student Portal"}
        </h1>
        <p className="text-gray-600">
          {userRole === "teacher"
            ? "Manage student records, performance, and results."
            : "Access your academic results and important updates."}
        </p>
      </header>

      {/* Overview Cards (Teachers only) */}
      {userRole === "teacher" && (
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div
            onClick={() => navigate("/studentinformation", { state: { activeTab: "directory" } })}
            className="bg-white shadow-md rounded-xl p-5 flex items-center gap-4 hover:bg-blue-50 cursor-pointer transition"
          >
            <FaUserGraduate className="text-blue-600 text-3xl" />
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Total Students</h3>
              <p className="text-gray-500 text-sm">{count.totalStudent ?? 0}</p>
            </div>
          </div>

          <div
            onClick={() => navigate("/marks")}
            className="cursor-pointer bg-white shadow-md rounded-xl p-5 flex items-center gap-4"
          >
            <FaChartBar className="text-purple-600 text-3xl" />
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Total Results</h3>
              <p className="text-gray-500 text-sm">{count.totalResults ?? 0}</p>
            </div>
          </div>
        </section>
      )}

      {/* Results Section (Students only) */}
      {userRole !== "teacher" && (
        <section className="bg-white shadow-md rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your Results</h2>
          <p className="text-gray-600 mb-4">View your academic performance and scores here.</p>
          <button
            onClick={() => navigate("/marks")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            View Results
          </button>
        </section>
      )}

      {/* Notice Board */}
      <section className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Notices</h2>
        <ul className="space-y-3 text-gray-700 text-sm list-disc list-inside">
          <li><strong>📢</strong> Semester Exams begin on <span className="font-medium">5th August</span></li>
          <li><strong>🎉</strong> Orientation for new batch on <span className="font-medium">1st August</span></li>
          <li><strong>📌</strong> Last date to update profile: <span className="font-medium">30th July</span></li>
        </ul>
      </section>
    </div>
  );
};

export default Home;