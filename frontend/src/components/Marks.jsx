import React, { useEffect, useState } from "react";
import axios from "axios";
import { IoEyeSharp } from "react-icons/io5";
import { MdOutlineEditCalendar } from "react-icons/md";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const Marks = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
  const token = localStorage.getItem("access_token");

  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

const location = useLocation();

const [activeTab, setActiveTab] = useState(() => {
  const fromNav = location.state?.activeTab;
  const role = localStorage.getItem('user_role');
  return fromNav || (role === 'teacher' ? 'form' : 'directory');
});

useEffect(() => {
  const role = localStorage.getItem('user_role');
  setUserRole(role || '');
  
  // Automatically show directory for students
  if (role === 'student') {
    setActiveTab('directory');
    getapi(); // Load data immediately for students
  }
}, []);
  const [formData, setFormData] = useState({
    name: "",
    RollNumber: "",
    class: "",
    marks: {
      maths: "",
      physics: "",
      chemistry: "",
      english: "",
      computer: "",
    },
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
      ["maths", "physics", "chemistry", "english", "computer"].includes(name)
    ) {
      setFormData((prev) => ({
        ...prev,
        marks: {
          ...prev.marks,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      delete newErrors.message;
      return newErrors;
    });
  };

  const handleSubmit = async () => {
    setErrors({});
    try {
      const payload = {
        ...formData,
        marks: Object.fromEntries(
          Object.entries(formData.marks).map(([key, val]) => [key, Number(val)])
        ),
      };
      await api.post("/result", payload);
      toast.success("Result Submit Sucessfully!");
      setFormData({
        name: "",
        RollNumber: "",
        class: "",
        marks: {
          maths: "",
          physics: "",
          chemistry: "",
          english: "",
          computer: "",
        },
      });
      getapi();
      setActiveTab("directory");
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.message) {
        setErrors({ RollNumber: errorData.message });
      } else if (errorData?.errors) {
        setErrors(errorData.errors);
      }
    }
  };

  const [marks, setmarks] = useState([]);

async function getapi() {
  try {
    const res = await api.get("/getresult");
    
    // Handle both response structures
    const data = res.data.result || res.data.results;
    
    // Always convert to array
    const processedData = Array.isArray(data) ? data : [data].filter(Boolean);
    
    setmarks(processedData);
    console.log('Processed data:', processedData); // Debug log
    
  } catch (error) {
    console.error("Error fetching results:", error);
    setmarks([]);
  }
}
  useEffect(() => {
    getapi();
  }, []);

  const navigate = useNavigate()


  const [userRole, setUserRole] = useState(''); // Add this near your other state declarations

// Add this useEffect to get the user role when component mounts
useEffect(() => {
  const role = localStorage.getItem('user_role'); // Assuming you store role in localStorage
  setUserRole(role || '');
}, []);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <Toaster position="top-right" />
      {console.log('Current marks state:', marks)}
      <div className="flex justify-center mb-6">
        <div className="flex rounded overflow-hidden shadow">
  {userRole === 'teacher' && (
    <button
      onClick={() => setActiveTab("form")}
      className={`px-6 py-2 transition font-medium ${
        activeTab === "form"
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      Enter Marks
    </button>
  )}
  <button
    onClick={() => {
      setActiveTab("directory");
      getapi();
    }}
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
        <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold">Enter Student Marks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["name", "class", "RollNumber"].map((field) => (
              <div key={field}>
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 ${
                    errors[field] ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors[field] && (
                  <p className="text-red-500 text-sm mt-1">
                    {Array.isArray(errors[field])
                      ? errors[field][0]
                      : errors[field]}
                  </p>
                )}
              </div>
            ))}

            {Object.keys(formData.marks).map((subject) => (
              <div key={subject}>
                <input
                  type="number"
                  name={subject}
                  value={formData.marks[subject]}
                  onChange={handleChange}
                  placeholder={`${
                    subject.charAt(0).toUpperCase() + subject.slice(1)
                  } Marks`}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 ${
                    errors[subject] ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors[subject] && (
                  <p className="text-red-500 text-sm mt-1">
                    {Array.isArray(errors[subject])
                      ? errors[subject][0]
                      : errors[subject]}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
            >
              Submit
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-md p-6 rounded">
          <h2 className="text-lg font-semibold mb-4">Marks Directory</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-blue-100">
                <tr>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Roll No</th>
                  <th className="p-2 border">Class</th>
                    <th className="p-2 border">
      {userRole === 'student' ? 'Result' : 'Action'}
    </th>
                </tr>
              </thead>
<tbody>
  {marks && marks.length > 0 ? (
    marks
      .filter(item => item && typeof item === 'object') // Strict filtering
      .map((value, idx) => {
        // Debug individual items if needed
        // console.log('Rendering item:', value);
        return (
          <tr key={value?.sNo || idx} className="hover:bg-gray-50">
            <td className="p-2 border">{value?.name || "-"}</td>
            <td className="p-2 border">{value?.RollNumber || "-"}</td>
            <td className="p-2 border">{value?.class || "-"}</td>
            <td className="p-2 border">
  <div className="flex gap-6">
    <IoEyeSharp
      onClick={() => navigate(`/marks/marksView/${value?.sNo || ''}`)}
      className="cursor-pointer"
      title="View Marks"
    />
    {userRole === 'teacher' && (
      <MdOutlineEditCalendar
        onClick={() => navigate(`/marks/marksedit/${value?.sNo || ''}`)}
        className="cursor-pointer"
        title="Edit Marks"
      />
    )}
  </div>
</td>
          </tr>
        );
      })
  ) : (
    <tr>
      <td colSpan="4" className="text-center text-gray-500 p-4">
        {marks === null ? 'Loading results...' : 'No results found'}
      </td>
    </tr>
  )}
</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marks;
