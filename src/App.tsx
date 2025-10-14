import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/layout/layout";
import { Home } from "@/pages/landingpage/Home";
import Signup from "@/pages/auth/Signup";
import Login from "@/pages/auth/Login";
import AdminLanding from "@/Dashboard/admin/AdminLanding";
import UserLanding from "@/Dashboard/user/UserLanding";
import About from "./pages/landingpage/About";
import CounselorApplicationForm from "@/pages/landingpage/therapyForm";
import Contact from "@/pages/landingpage/contact";
import Resources from "@/pages/landingpage/resources";
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="aboutus" element={<About />} />
          <Route path="counselorform" element={<CounselorApplicationForm />} />
          <Route path="resources" element={<Resources />} />
          <Route path="contact" element={<Contact />} />
        </Route>
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="admin/dashboard" element={<AdminLanding />} />
        </Route>

        {/* User Routes */}
        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route path="user/dashboard" element={<UserLanding />} />
        </Route>

        {/* Counselor Routes */}
        <Route element={<ProtectedRoute allowedRoles={["counselor"]} />}>
          <Route
            path="counselor/dashboard"
            element={<div>Counselor Dashboard</div>}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
