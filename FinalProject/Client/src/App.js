// App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, UserContext } from './UserContext';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import ProjectManagement from './ProjectManagement';
import Feedback from './Feedback';
import BrowserStudio from './BrowserStudio';
import Navbar from './Navbar';
import AdminPage from './AdminPage';

// Layout that includes Navbar if user is logged in
const AuthenticatedLayout = ({ children }) => {
  const { currentUser } = useContext(UserContext);
  return (
    <>
      {currentUser && <Navbar />}
      {children}
    </>
  );
};

// Protect routes from unauthorized access
const ProtectedRoute = ({ children }) => {
  const { currentUser, isLoading } = useContext(UserContext);

  if (isLoading) return <div>Loading...</div>;
  if (!currentUser) return <Navigate to="/Login" />;
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
};

// Route that redirects root based on auth state
const RootRedirect = () => {
  const { currentUser, isLoading } = useContext(UserContext);
  if (isLoading) return <div>Loading...</div>;
  return currentUser ? <Navigate to="/dashboard" /> : <Navigate to="/Login" />;
};

// ✅ Final App component
const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/Login" element={<Login />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/admin" element={<AdminPage />} />

          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ProjectManagement" 
            element={
              <ProtectedRoute>
                <ProjectManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/BrowserStudio" 
            element={
              <ProtectedRoute>
                <BrowserStudio />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/Feedback" 
            element={
              <ProtectedRoute>
                <Feedback />
              </ProtectedRoute>
            } 
          />

          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
