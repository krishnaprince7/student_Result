import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

const MarksEdit = () => {
  const { id } = useParams(); // id = sNo

  const [marks, setMarks] = useState({
    maths: "",
    physics: "",
    chemistry: "",
    english: "",
    computer: "",
  });

  const [studentInfo, setStudentInfo] = useState({
    name: "",
    class: "",
    RollNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/getresult/${id}`)
      .then((res) => {
        setMarks(res.data.result.marks);
        const { name, class: studentClass, RollNumber } = res.data.result;
        setStudentInfo({ name, class: studentClass, RollNumber });
      })
      .catch((err) => {
        toast.error("Failed to fetch result");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    setMarks({ ...marks, [e.target.name]: e.target.value });
  };

  const handleInfoChange = (e) => {
    setStudentInfo({ ...studentInfo, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    setErrors({});
    try {
      const numericMarks = Object.fromEntries(
        Object.entries(marks).map(([key, val]) => [key, Number(val)])
      );

      const res = await api.put(`/getresult-edit/${id}`, {
        name: studentInfo.name,
        class: studentInfo.class,
        RollNumber: studentInfo.RollNumber,
        marks: numericMarks,
      });

      toast.success("Marks and Info updated successfully");
      navigate("/marks")
      setMarks(res.data.result.marks);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        toast.error("Failed to update data");
      }
    }
  };

  const navigate = useNavigate()
  if (loading) return <div className="p-6 text-center">Loading...</div>;


  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow-md border rounded-lg">
      <Toaster position="top-right" />
      <h2 className="text-xl font-bold text-center mb-6 border-b pb-2">
        Edit Student Marks
      </h2>

      <div className="grid sm:grid-cols-2  max-w-4xl grid-cols-1 gap-4 mb-6">
        {["name", "class", "RollNumber"].map((field) => (
          <div key={field}>
            <label className="block text-sm font-semibold text-gray-700 mb-1 capitalize">
              {field === "RollNumber" ? "Roll Number" : field}
            </label>
            <input
              type={field === "RollNumber" ? "number" : "text"}
              name={field}
              value={studentInfo[field]}
              onChange={handleInfoChange}
              className="w-full border px-3 py-2 rounded"
            />
            {errors[field] && (
              <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {Object.keys(marks).map((subject) => (
          <div key={subject}>
            <label className="block text-sm font-semibold text-gray-700 mb-1 capitalize">
              {subject}
            </label>
            <input
              type="number"
              name={subject}
              value={marks[subject]}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
            {errors[subject] && (
              <p className="text-red-500 text-sm mt-1">{errors[subject]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={handleUpdate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded"
        >
          Update Marks
        </button>
      </div>
    </div>
  );
};

export default MarksEdit;
