import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import EmergencyCallButton from "@/components/EmergencyCall";
import { FloatingChatbot } from "@/components/chatbot";

const SkipLink: React.FC = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-purple-600 focus:text-white focus:px-4 focus:py-2 focus:rounded"
  >
    Skip to main content
  </a>
);

export default function Layout() {
  return (
    <div className="">
      <SkipLink />
      <Navbar />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
      <EmergencyCallButton />
      <FloatingChatbot />
    </div>
  );
}
