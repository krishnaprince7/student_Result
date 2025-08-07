import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import html2pdf from "html2pdf.js";

const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

const MarksView = () => {
  const { id } = useParams();
  const [resultData, setResultData] = useState({
    sNo: "",
    name: "",
    class: "",
    RollNumber: "",
    marks: {
      maths: "",
      physics: "",
      chemistry: "",
      english: "",
      computer: "",
    },
  });

  const [loading, setLoading] = useState(true);
  const resultRef = useRef();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/getresult/${id}`);
        const data = res.data.result;
        setResultData({
          sNo: data.sNo || "",
          name: data.name || "",
          class: data.class || "",
          RollNumber: data.RollNumber || "",
          marks: data.marks || {},
        });
      } catch (error) {
        console.error("Failed to fetch result data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  const getTotalMarks = () => {
    const values = Object.values(resultData.marks).map((m) =>
      isNaN(parseInt(m)) ? 0 : parseInt(m)
    );
    return values.reduce((acc, curr) => acc + curr, 0);
  };

  const totalMarks = 500;
  const obtainedMarks = getTotalMarks();
  const percentage = ((obtainedMarks / totalMarks) * 100).toFixed(2);
  const resultClass = percentage >= 60 ? "First Class" : "Second Class";

  const handleDownloadPDF = () => {
    const element = resultRef.current;
    html2pdf()
      .from(element)
      .set({
        margin: 10,
        filename: `${resultData.name}_Result.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .save();
  };

  if (loading)
    return (
      <div className="p-6 text-center text-lg font-medium">Loading...</div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-xl rounded-xl border border-gray-200 relative">
      {/* Header with Title and Download Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-700">
          📘 Student Marks Report
        </h2>
        <button
          onClick={handleDownloadPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md shadow-sm transition duration-200"
        >
          ⬇️ Download PDF
        </button>
      </div>

      {/* PDF Content */}
      <div ref={resultRef}>
        {/* Student info */}
        <div className="mb-6 bg-gray-100 p-4 rounded-md shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-base">
            <p>
              <span className="font-semibold">👤 Name:</span> {resultData.name}
            </p>
            <p>
              <span className="font-semibold">🏫 Class:</span>{" "}
              {resultData.class}
            </p>
            <p>
              <span className="font-semibold">🆔 Roll Number:</span>{" "}
              {resultData.RollNumber}
            </p>
          </div>
        </div>

        {/* Marks Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg mb-6">
            <thead>
              <tr className="bg-blue-100 text-gray-800 text-left">
                <th className="py-2 px-4 border-b text-center">S.No</th>
                <th className="py-2 px-4 border-b">Subject</th>
                <th className="py-2 px-4 border-b text-center">
                  Marks (out of 100)
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(resultData.marks).map(([subject, mark], index) => {
                const numericMark = parseInt(mark);
                const isFail = !isNaN(numericMark) && numericMark < 30;

                return (
                  <tr key={subject} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-center">
                      {index + 1}
                    </td>
                    <td className="py-2 px-4 border-b capitalize">{subject}</td>
                    <td
                      className={`py-2 px-4 border-b text-center font-medium ${
                        isFail ? "text-red-600 font-bold" : "text-gray-800"
                      }`}
                    >
                      {!isNaN(numericMark) && (
                        <>
                          {numericMark}/100{" "}
                          {isFail && <span className="ml-2">(Fail)</span>}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Total & Class */}
        <div className="text-lg text-center font-semibold text-gray-700 mb-2">
          🎯 Total Marks: {obtainedMarks} / {totalMarks} (
          <span className="text-blue-600">{percentage}%</span>)
        </div>
        <div className="text-center text-lg font-semibold text-green-700 mb-4">
          🎓 {resultClass}
        </div>
      </div>
    </div>
  );
};

export default MarksView;
