import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

const Studentiview = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    sNo: "",
    name: "",
    class: "",
    RollNumber: "",
    fatherName: "",
    aadharNo: "",
    contactNo: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await api.get(`/studentinfo/${id}`);
        const data = res.data;
        setFormData({
          sNo: data.sNo || "",
          name: data.name || "",
          class: data.class || "",
          RollNumber: data.RollNumber || "",
          fatherName: data.fatherName || "",
          aadharNo: data.aadharNo || "",
          contactNo: data.contactNo || "",
          email: data.email || "",
        });
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-bold text-center mb-6">Student Details</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">S.No</label>
          <input
            type="text"
            value={formData.sNo}
            readOnly
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Student Name</label>
          <input
            type="text"
            value={formData.name}
            className="w-full border px-3 py-2 rounded"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Class</label>
          <input
            type="text"
            value={formData.class}
            className="w-full border px-3 py-2 rounded"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">RollNumber</label>
          <input
            type="text"
            value={formData.RollNumber}
            className="w-full border px-3 py-2 rounded"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="text"
            value={formData.email}
            className="w-full border px-3 py-2 rounded"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Father's Name</label>
          <input
            type="text"
            value={formData.fatherName}
            className="w-full border px-3 py-2 rounded"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Aadhar No</label>
          <input
            type="text"
            value={formData.aadharNo}
            className="w-full border px-3 py-2 rounded"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contact No</label>
          <input
            type="text"
            value={formData.contactNo}
            className="w-full border px-3 py-2 rounded"
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default Studentiview;
