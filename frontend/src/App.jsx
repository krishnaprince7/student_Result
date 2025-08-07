// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import RegisterPage from "./components/RgisterPage";
import Login from "./components/Login";
import Home from "./components/Home";
import StudentInformation from "./components/StudentInformation";
import MainLayout from "./layout/MainLayout"; 
import Studentiview from "./route/Studentiview";
import StudentEdit from "./route/StudentEdit";
import Marks from "./components/Marks";
import MarksView from "./route/MarksView";
import MarksEdit from "./route/MarksEdit";
import ProtectedRoute from "./route/ProtectedRoute"; // ⬅️ import the guard
import SendOtp from "./route/SendOtp";
import VerifyPassword from "./route/VerifyPassword";

const App = () => {
  return (
    <Routes>
      {/* Public Route: Login Page (no navbar, no auth required) */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<SendOtp />} />
        <Route path="/verify-password" element={<VerifyPassword />} />

      {/* Protected Routes (with navbar via MainLayout) */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/studentinformation" element={<StudentInformation />} />
        <Route path="/studentinformation/studentview/:id" element={<Studentiview />} />
        <Route path="/studentinformation/studentedit/:id" element={<StudentEdit />} />
        <Route path="/marks" element={<Marks />} />
        <Route path="/marks/marksView/:id" element={<MarksView />} />
        <Route path="/marks/marksedit/:id" element={<MarksEdit />} />
        <Route path="/usermanagement" element={<RegisterPage />} />
      </Route>
    </Routes>
  );
};

export default App;
