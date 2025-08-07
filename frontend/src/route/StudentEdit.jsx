import React, { useEffect, useState } from "react";
import { useParams,useNavigate, useNavigation } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

const StudentEdit = () => {
  const { id } = useParams();

    const userRole = localStorage.getItem("user_role");
  const [student, setStudent] = useState({
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

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/studentinfo/${id}`)
      .then((res) => setStudent(res.data))
      .catch((err) => console.error("Failed to fetch student:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent({ ...student, [name]: value });
  };

  const handleUpdate = async () => {
    try {
      const res = await api.put(`/studentedit/${id}`, student);
     toast.success("Student updated sucessfully!");
     setTimeout(()=>{
        navigate("/studentinformation")
     },1000)

  
    } catch (error) {
      console.error("Update error:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

     const navigate = useNavigate();

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-md border rounded-lg">
       <Toaster position="top-right" />
      <h2 className="text-xl font-bold text-center mb-6 border-b pb-2">
        Edit Student
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
          <input
            name="name"
            value={student.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

         {/* Class field (only for teachers) */}
        {userRole !== "student" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Class</label>
            <input
              name="class"
              value={student.class}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.class && <p className="text-red-500 text-sm mt-1">{errors.class}</p>}
          </div>
        )}

        {/* RollNumber field (only for teachers) */}
        {userRole !== "student" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">RollNumber</label>
            <input
              name="RollNumber"
              value={student.RollNumber}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.RollNumber && <p className="text-red-500 text-sm mt-1">{errors.RollNumber}</p>}
          </div>
        )}


         <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input
            name="email"
            value={student.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Father Name</label>
          <input
            name="fatherName"
            value={student.fatherName}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.fatherName && <p className="text-red-500 text-sm mt-1">{errors.fatherName}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Aadhar No</label>
          <input
            name="aadharNo"
            value={student.aadharNo}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.aadharNo && <p className="text-red-500 text-sm mt-1">{errors.aadharNo}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Contact No</label>
          <input
            name="contactNo"
            value={student.contactNo}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          {errors.contactNo && <p className="text-red-500 text-sm mt-1">{errors.contactNo}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Parent Contact No</label>
          <input
            name="parentContactNo"
            value={student.parentContactNo}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Permanent Address</label>
          <input
            name="permanentAddress"
            value={student.permanentAddress}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={handleUpdate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded"
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default StudentEdit;
