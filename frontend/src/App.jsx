import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import HCloud from './pages/HCloud';
import Services from './pages/Services';
import CFlow from './pages/CFlow';
import ClientIntake from './pages/ClientIntake';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route element={
              <div className="flex h-screen overflow-hidden selection:bg-indigo-500/30">
                <Sidebar />
                <div className="flex-1 flex flex-col h-screen relative bg-[#fdfbf7] dark:bg-zinc-950 transition-colors duration-500">
                  {/* Premium macOS-style warm ambient background effect */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/40 via-transparent to-transparent pointer-events-none -z-10 dark:from-indigo-900/5 transition-colors duration-500" />
                
                <Topbar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent">
                  <div className="container mx-auto px-6 py-8">
                    <OutletWrapper />
                  </div>
                </main>
              </div>
            </div>
          }>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/hcloud/*" element={<HCloud />} />
              <Route path="/services" element={<Services />} />
              <Route path="/cflow" element={<CFlow />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/intake" element={<ClientIntake />} />
            </Route>
          </Route>
        </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

// Helper to keep layout structure while resolving React Router <Outlet /> inside the layout element
import { Outlet } from 'react-router-dom';
function OutletWrapper() {
  return <Outlet />;
}

export default App;
