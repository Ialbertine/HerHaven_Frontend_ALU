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
import Services from "@/pages/landingpage/services";
import TherapyService from "@/pages/landingpage/TherapyService";
import TherapistLanding from "@/Dashboard/therapist/therapyLanding";
import TherapyManagement from "./Dashboard/admin/TherapyManagement";
import FeedbackManagement from "./Dashboard/admin/FeedbackManagement";
import Profile from "@/Dashboard/therapist/Profile";
import Schedule from "@/Dashboard/therapist/Schedule";
import Sessions from "@/Dashboard/therapist/Session";
import Therapits from "@/Dashboard/user/Therapits";
import UserAppointment from "@/Dashboard/user/UserAppointment";
import Community from "@/pages/community/community";
import HavenChatbot from "@/pages/chatbot/HavenChatbot";
import { ModalProvider } from "@/contexts/ModalContext";


const App: React.FC = () => {
  return (
    <ModalProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="aboutus" element={<About />} />
            <Route
              path="counselorform"
              element={<CounselorApplicationForm mode="new" />}
            />
            <Route path="resources" element={<Resources />} />
            <Route path="contact" element={<Contact />} />
            <Route path="services" element={<Services />} />
            <Route path="therapy" element={<TherapyService />} />
            <Route path="havenchatbot" element={<HavenChatbot />} />
          </Route>

          <Route path="signup" element={<Signup />} />
          <Route path="login" element={<Login />} />
          <Route
            path="counselor/complete-registration/:token"
            element={<CounselorApplicationForm mode="complete" />}
          />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={["super_admin"]} />}>
            <Route path="admin/dashboard" element={<AdminLanding />} />
            <Route
              path="admin/therapy-management"
              element={<TherapyManagement />}
            />
            <Route path="admin/content" element={<FeedbackManagement />} />
            <Route path="admin/community" element={<Community />} />
          </Route>

          {/* User Routes */}
          <Route element={<ProtectedRoute allowedRoles={["user", "guest"]} />}>
            <Route path="user/dashboard" element={<UserLanding />} />
            <Route path="user/resources" element={<Resources />} />
            <Route path="user/community" element={<Community />} />
          </Route>

          {/* User only Routes */}
          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route path="user/therapy" element={<Therapits />} />
            <Route path="user/appointment" element={<UserAppointment />} />
          </Route>

          {/* Counselor Routes */}
          <Route element={<ProtectedRoute allowedRoles={["counselor"]} />}>
            <Route path="counselor/dashboard" element={<TherapistLanding />} />
            <Route path="counselor/profile" element={<Profile />} />
            <Route path="counselor/schedule" element={<Schedule />} />
            <Route path="counselor/appointments" element={<Sessions />} />
            <Route path="counselor/community" element={<Community />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ModalProvider>
  );
};

export default App;