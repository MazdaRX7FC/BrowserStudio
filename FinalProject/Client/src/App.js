// App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, UserContext } from './UserContext';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard'; // You'll need to create this component
import ProjectManagement from './ProjectManagement';
import Feedback from './Feedback';
import BrowserStudio from './BrowserStudio'; // Assuming this exists
import Navbar from './Navbar';

// Layout component that includes Navbar for authenticated users
const AuthenticatedLayout = ({ children }) => {
  const { currentUser } = useContext(UserContext);
  
  return (
    <>
      {currentUser && <Navbar />}
      {children}
    </>
  );
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, isLoading } = useContext(UserContext);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // Redirect to login if user is not authenticated
  if (!currentUser) {
    return <Navigate to="/Login" />;
  }
  
  // Render children if user is authenticated
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
};

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Public routes - accessible without authentication */}
          <Route path="/Login" element={<Login />} />
          <Route path="/Signup" element={<Signup />} />
          
          {/* Protected routes - require authentication */}
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
          
          {/* Redirect root to dashboard if authenticated, otherwise to login */}
          <Route 
            path="/" 
            element={<RootRedirect />} 
          />
          
          {/* Catch all other routes and redirect */}
          <Route 
            path="*" 
            element={<Navigate to="/" />} 
          />
        </Routes>
      </Router>
    </UserProvider>
  );
}

// Component to redirect from root path based on auth state
const RootRedirect = () => {
  const { currentUser, isLoading } = useContext(UserContext);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return currentUser ? <Navigate to="/dashboard" /> : <Navigate to="/Login" />;
};

export default App;