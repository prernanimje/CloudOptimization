/**
 * Main App Component - Router and Layout
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, Bot, Moon, Sun, User } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/Upload';
import Auth from './pages/Auth';
import LandingPage from './pages/LandingPage';
import ServerSelector from './components/ServerSelector';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';
import { instancesAPI } from './api';
import './App.css';
import './styles/AppLayout.css';

const AIChatbotOverlay = lazy(() => import('./components/AIChatbotOverlay'));

function AppContent() {
  const [instances, setInstances] = useState([]);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    // Apply the theme to the body or root element
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const loadInstances = async (silent = false) => {
    try {
      const response = await instancesAPI.getAllInstances();
      setInstances(response);
      if (response.length > 0 && !selectedInstance && !silent) {
        setSelectedInstance(response[0]);
      } else if (response.length > 0 && selectedInstance && silent) {
        const updatedSelected = response.find(i => i.id === selectedInstance?.id);
        if (updatedSelected) setSelectedInstance(updatedSelected);
      }
    } catch (err) {
      console.error('Failed to load instances', err);
    }
  };

  useEffect(() => {
    loadInstances();

    // Listen for custom event from Upload page to refresh instances
    const handleInstancesUpdated = () => loadInstances();
    window.addEventListener('instancesUpdated', handleInstancesUpdated);

    return () => {
      window.removeEventListener('instancesUpdated', handleInstancesUpdated);
    };
  }, []);

  return (
    <div className="app-layout-container">
      {/* Sidebar */}
      <aside className={`app-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div
          className="sidebar-header"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          title="Toggle Sidebar"
        >
          <div className="sidebar-logo-icon">
            <span>☁️</span>
          </div>
          <span className="sidebar-title">Picasso</span>
        </div>
        <nav className="sidebar-nav">
          <Link
            to="/app"
            className={`sidebar-nav-item ${location.pathname === '/app' ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/app/upload"
            className={`sidebar-nav-item ${location.pathname === '/app/upload' ? 'active' : ''}`}
          >
            <UploadCloud size={20} />
            <span>Upload Data</span>
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user-profile" style={{ flexWrap: 'wrap' }}>
            <div className="user-avatar" style={{ cursor: 'pointer' }} onClick={handleLogout} title="Click to log out">
              <User size={20} />
            </div>
            {!isSidebarCollapsed && currentUser && (
              <div className="user-info">
                <span className="user-name">{currentUser.username}</span>
                <span className="user-role" onClick={handleLogout} style={{ color: '#ef4444', cursor: 'pointer', marginTop: '4px' }}>Log Out</span>
              </div>
            )}
          </div>
          <div className="version-info">
            v1.0.0 &copy; 2026
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className="app-main-area"
        onClick={() => {
          if (!isSidebarCollapsed) {
            setIsSidebarCollapsed(true);
          }
        }}
      >
        {/* Header */}
        <header className="app-header">
          {/* Status Card on Left */}
          {selectedInstance ? (
            <div className="header-status-card">
              {/* Online Status derived from uptime/downtime/status */}
              {(() => {
                const isOnline = selectedInstance.status !== 'critical' && selectedInstance.uptime_hours > 0;
                const statusStr = isOnline ? 'Online' : 'Offline';
                const statusClass = isOnline ? 'healthy' : 'offline';
                return (
                  <div className="header-status-item">
                    <div className="status-dot-container">
                      <div className={`status-dot ${statusClass}`}></div>
                      <div className={`status-dot-pulse ${statusClass}`}></div>
                    </div>
                    <div className="status-info">
                      <span className="status-label">Availability</span>
                      <span className={`status-value ${statusClass}`}>{statusStr}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="header-status-divider"></div>

              {/* Health Status Dashboard-Reactive */}
              <div className="header-status-item">
                <div className="status-dot-container">
                  <div className={`status-dot ${selectedInstance.status || 'healthy'}`}></div>
                  <div className={`status-dot-pulse ${selectedInstance.status || 'healthy'}`}></div>
                </div>
                <div className="status-info">
                  <span className="status-label">Health</span>
                  <span className={`status-value ${selectedInstance.status || 'healthy'}`}>
                    {selectedInstance.status ?
                      selectedInstance.status.charAt(0).toUpperCase() + selectedInstance.status.slice(1) :
                      'Healthy'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="header-status-card" style={{ opacity: 0.5 }}>
              <div className="status-info">
                <span className="status-label">System Monitor</span>
                <span className="status-value">Select server to view status</span>
              </div>
            </div>
          )}

          {/* Header Actions grouped on the right */}
          <div className="header-actions">
            <div className="header-server-selector">
              <ServerSelector
                instances={instances}
                selectedInstance={selectedInstance}
                onSelect={setSelectedInstance}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="btn-ai-assistant"
              >
                <Bot size={20} />
                Ask AI Assistant
              </button>
              {isChatOpen && (
                <Suspense fallback={null}>
                  <AIChatbotOverlay
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    selectedInstance={selectedInstance}
                  />
                </Suspense>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title="Toggle Light/Dark Mode"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </header>

        {/* Scrollable Routes */}
        <main className="app-content-scrollable">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  instances={instances}
                  selectedInstance={selectedInstance}
                  setSelectedInstance={setSelectedInstance}
                  refreshInstances={loadInstances}
                />
              }
            />
            <Route path="/upload" element={<UploadPage />} />
            <Route
              path="*"
              element={
                <Dashboard
                  instances={instances}
                  selectedInstance={selectedInstance}
                  setSelectedInstance={setSelectedInstance}
                  refreshInstances={loadInstances}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/app/*"
            element={
              <PrivateRoute>
                <AppContent />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
