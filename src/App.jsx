import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import UnifiedLayout from './components/Layout/UnifiedLayout';
import Dashboard from './pages/Dashboard';
import CodeEditor from './pages/CodeEditor';
import ProjectManager from './pages/ProjectManager';
import VibeAnalytics from './pages/VibeAnalytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { useAuthStore } from './store/authStore';

function App() {
  const { user } = useAuthStore();

  if (!user) {
    return <Login />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-dark-bg text-white">
        <UnifiedLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/editor" element={<CodeEditor />} />
            <Route path="/projects" element={<ProjectManager />} />
            <Route path="/analytics" element={<VibeAnalytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </UnifiedLayout>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1A1A2E',
              color: '#ffffff',
              border: '1px solid #2D2D44',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;