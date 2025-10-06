import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/layout/layout";
import { Home } from "@/pages/landingpage/Home";
import Signup from "@/pages/auth/Signup";
import Login from "@/pages/auth/Login";
import AdminLanding from "./Dashboard/admin/AdminLanding";
import UserLanding from "./Dashboard/user/UserLanding";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
        </Route>
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />

        {/* Protected Routes, this is admin dashboard */}
         <Route path="dashboard">
          <Route
            path="admin"
            element={<ProtectedRoute allowedRoles={["admin"]} />}
          >
            <Route path="/admin/dashboard" element={<AdminLanding />} />
          </Route>
        </Route>

        {/* Protected Routes, this is user dashboard */}
        <Route path="dashboard">
          <Route
            path="user"
            element={<ProtectedRoute allowedRoles={["user"]} />}
          >
            <Route path="/user/dashboard" element={<UserLanding />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;
