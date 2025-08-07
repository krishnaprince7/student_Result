import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { IoEyeSharp } from "react-icons/io5";
import { MdOutlineEditCalendar } from "react-icons/md";
import { jwtDecode } from "jwt-decode";

const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

const StudentInformation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "form"
  );
  const [errors, setErrors] = useState({});
  const [studentDirectory, setStudentDirectory] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    class: "",
    fatherName: "",
    RollNumber: "",
    aadharNo: "",
    contactNo: "",
    parentContactNo: "",
    permanentAddress: "",
  });

  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setUserInfo(decoded?.user || {}); // assuming your token has { user: { _id, role } }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/studentinfo", formData);
      toast.success("Student information submitted!");
      setFormData({
        name: "",
        class: "",
        fatherName: "",
        RollNumber: "",
        aadharNo: "",
        contactNo: "",
        parentContactNo: "",
        permanentAddress: "",
        email: "",
      });
      setErrors({});
      setActiveTab("directory");
      fetchDirectory(); // refresh list
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  const fetchDirectory = async () => {
    try {
      const res = await api.get("/studentinfo");
      if (userInfo.role === "student") {
        // 👇 filter only the student's own record
        const filtered = res.data.filter((stu) => stu.userId === userInfo._id);
        setStudentDirectory(filtered);
      } else {
        setStudentDirectory(res.data);
      }
    } catch (err) {
      console.error("Error fetching student directory", err);
    }
  };

  useEffect(() => {
    if (activeTab === "directory") {
      fetchDirectory();
    }
  }, [activeTab, userInfo]);

  const inputClass =
    "w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <Toaster position="top-right" />
      <div className="flex justify-center mb-6">
        <div className="flex rounded overflow-hidden shadow">
          <button
            style={{
              WebkitTapHighlightColor: "transparent",
              outline: "none", // removes blue outline on focus
              WebkitFocusRingColor: "transparent", // removes focus ring on iOS
            }}
            onClick={() => setActiveTab("form")}
            className={`px-6 py-2 transition font-medium ${
              activeTab === "form"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Fill Student Info
          </button>
          <button
            style={{
              WebkitTapHighlightColor: "transparent",
              outline: "none", // removes blue outline on focus
              WebkitFocusRingColor: "transparent", // removes focus ring on iOS
            }}
            onClick={() => setActiveTab("directory")}
            className={`px-6 py-2 transition font-medium ${
              activeTab === "directory"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Directory
          </button>
        </div>
      </div>

      {activeTab === "form" ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-lg p-6 space-y-6"
        >
          <h2 className="text-xl font-semibold text-gray-700">
            Enter Student Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Student Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Student Name"
                className={inputClass}
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Class</label>
              <input
                type="text"
                name="class"
                placeholder="Class"
                className={inputClass}
                value={formData.class}
                onChange={handleChange}
              />
              {errors.class && (
                <p className="text-red-500 text-sm mt-1">{errors.class}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                RollNumber
              </label>
              <input
                type="text"
                name="RollNumber"
                placeholder="RollNumber"
                className={inputClass}
                value={formData.RollNumber}
                onChange={handleChange}
              />
              {errors.RollNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.RollNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="text"
                name="email"
                placeholder="Email"
                className={inputClass}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Father's Name
              </label>
              <input
                type="text"
                name="fatherName"
                placeholder="Father's Name"
                className={inputClass}
                value={formData.fatherName}
                onChange={handleChange}
              />
              {errors.fatherName && (
                <p className="text-red-500 text-sm mt-1">{errors.fatherName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Aadhar Number
              </label>
              <input
                type="text"
                name="aadharNo"
                placeholder="Aadhar Number"
                maxLength={12}
                className={inputClass}
                value={formData.aadharNo}
                onChange={handleChange}
              />
              {errors.aadharNo && (
                <p className="text-red-500 text-sm mt-1">{errors.aadharNo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Contact Number
              </label>
              <input
                type="text"
                name="contactNo"
                placeholder="Student Contact Number"
                className={inputClass}
                value={formData.contactNo}
                onChange={handleChange}
              />
              {errors.contactNo && (
                <p className="text-red-500 text-sm mt-1">{errors.contactNo}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Permanent Address
            </label>
            <textarea
              name="permanentAddress"
              rows="3"
              placeholder="Permanent Address"
              className={`${inputClass} resize-none`}
              value={formData.permanentAddress}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded-md font-semibold"
            >
              Submit
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white shadow-md p-6 rounded">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Student Directory
          </h2>
          <table className="w-full border border-gray-300 text-left">
            <thead>
              <tr className="bg-blue-100 text-sm">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Class</th>
                <th className="p-2 border">Father's Name</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {studentDirectory.map((student, index) => (
                <tr key={index} className="hover:bg-gray-50 text-sm">
                  <td className="p-2 border">{student.name}</td>
                  <td className="p-2 border">{student.class}</td>
                  <td className="p-2 border">{student.fatherName}</td>
                  <td className="p-2 border">
                    <div className="flex gap-6">
                      <IoEyeSharp
                        className="cursor-pointer"
                        onClick={() =>
                          navigate(
                            `/studentinformation/studentview/${student.sNo}`
                          )
                        }
                      />
                      {userInfo.role !== "student" && (
                        <MdOutlineEditCalendar
                          className="cursor-pointer"
                          onClick={() =>
                            navigate(
                              `/studentinformation/studentedit/${student.sNo}`
                            )
                          }
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentInformation;
