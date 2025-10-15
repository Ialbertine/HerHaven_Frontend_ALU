import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './sidebar';
import DashboardHeader from './DashboardHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: 'user' | 'counselor' | 'admin';
  userName: string;
  notificationCount?: number;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  userType, 
  userName,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add your logout logic here
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <Sidebar 
        userType={userType}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        onLogout={handleLogout}
      />
      
      <div className="lg:ml-64 min-h-screen flex flex-col">
        <DashboardHeader 
          userName={userName}
          onMenuToggle={() => setIsMobileOpen(true)}
        />
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;