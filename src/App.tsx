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
import ArticleDetails from "@/pages/landingpage/ArticleDetails";
import Services from "@/pages/landingpage/services";
import TherapyService from "@/pages/landingpage/TherapyService";
import TherapistLanding from "@/Dashboard/therapist/therapyLanding";
import TherapyManagement from "./Dashboard/admin/TherapyManagement";
import FeedbackManagement from "./Dashboard/admin/FeedbackManagement";
import ContactManagement from "./Dashboard/admin/ContactManagement";
import UserManagement from "./Dashboard/admin/UserManagement";
import ViewUser from "./Dashboard/admin/ViewUser";
import AssessmentManagement from "./Dashboard/admin/AssessmentManagement";
import ViewAssessmentTemplate from "./Dashboard/admin/ViewAssessmentTemplate";
import Profile from "@/Dashboard/therapist/Profile";
import Schedule from "@/Dashboard/therapist/Schedule";
import Sessions from "@/Dashboard/therapist/Session";
import Therapits from "@/Dashboard/user/Therapits";
import UserAppointment from "@/Dashboard/user/UserAppointment";
import Community from "@/pages/community/community";
import HavenChatbot from "@/pages/chatbot/HavenChatbot";
import { ModalProvider } from "@/contexts/ModalContext";
import { TextSizeProvider } from "@/contexts/TextSizeContext";
import EmergencyContactsManager from "@/pages/Emergency";
import EmergencySOS from "@/pages/EmergencySOS";
import AssessmentList from "@/pages/assessment/AssessmentList";
import AssessmentDashboard from "@/pages/assessment/AssessmentDashboard";
import TakeAssessment from "@/pages/assessment/TakeAssessment";
import AssessmentResults from "@/pages/assessment/AssessmentResults";
import AssessmentHistory from "@/Dashboard/user/AssessmentHistory";
import CounselorAssessments from "@/Dashboard/therapist/Assessments";
import AssessmentAnalytics from "@/Dashboard/user/AssessmentAnalytics";

const App: React.FC = () => {
  return (
    <TextSizeProvider>
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
              <Route path="resources/:id" element={<ArticleDetails />} />
              <Route path="contact" element={<Contact />} />
              <Route path="services" element={<Services />} />
              <Route path="therapy" element={<TherapyService />} />
              <Route path="assessments" element={<AssessmentList />} />
              <Route path="assessments/:id" element={<TakeAssessment />} />
              <Route path="assessments/:id/results" element={<AssessmentResults />} />
              <Route path="assessment/take/:id" element={<TakeAssessment />} />
              <Route path="assessment/results/:id" element={<AssessmentResults />} />
              <Route path="havenchatbot" element={<HavenChatbot />} />
            </Route>

            <Route path="signup" element={<Signup />} />
            <Route path="login" element={<Login />} />
            <Route path="emergency-sos" element={<EmergencySOS />} />
            <Route
              path="counselor/complete-registration/:token"
              element={<CounselorApplicationForm mode="complete" />}
            />

            {/* Admin Routes */}
            <Route
              path="admin"
              element={<ProtectedRoute allowedRoles={["super_admin"]} />}
            >
              <Route path="dashboard" element={<AdminLanding />} />
              <Route path="therapy-management" element={<TherapyManagement />} />
              <Route path="user-management" element={<UserManagement />} />
              <Route path="users/:userId" element={<ViewUser />} />
              <Route path="assessments" element={<AssessmentManagement />} />
              <Route path="assessments/:templateId" element={<ViewAssessmentTemplate />} />
              <Route path="community" element={<Community />} />
              <Route path="feedbacks" element={<FeedbackManagement />} />
              <Route path="contacts" element={<ContactManagement />} />
            </Route>

            {/* User Routes accessible to both user and guest */}
            <Route
              path="user"
              element={<ProtectedRoute allowedRoles={["user", "guest"]} />}
            >
              <Route path="dashboard" element={<UserLanding />} />
              <Route path="resources" element={<Resources />} />
              <Route path="community" element={<Community />} />
            </Route>

            {/* User only Routes */}
            <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
              <Route path="user/therapy" element={<Therapits />} />
              <Route path="user/appointment" element={<UserAppointment />} />
              <Route
                path="user/emergency-contacts"
                element={<EmergencyContactsManager />}
              />
              <Route path="user/assessments" element={<AssessmentDashboard />} />
              <Route path="user/assessments/:id" element={<TakeAssessment />} />
              <Route path="user/assessments/:id/results" element={<AssessmentResults />} />
              <Route path="user/assessment-history" element={<AssessmentHistory />} />
              <Route path="user/assessment-analytics" element={<AssessmentAnalytics />} />
            </Route>

            {/* Counselor Routes */}
            <Route
              path="counselor"
              element={<ProtectedRoute allowedRoles={["counselor"]} />}
            >
              <Route path="dashboard" element={<TherapistLanding />} />
              <Route path="profile" element={<Profile />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="appointments" element={<Sessions />} />
              <Route path="assessments" element={<CounselorAssessments />} />
              <Route path="community" element={<Community />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ModalProvider>
    </TextSizeProvider>
  );
};

export default App;
