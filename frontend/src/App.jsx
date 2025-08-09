import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import PublicLayout from "./layout/PublicLayout";
import Home from "./pages/public/Home.jsx";
import Login from "./pages/public/Login.jsx";
import Signup from "./pages/public/Signup.jsx";
import VerifyEmail from "./pages/public/VerifyEmail.jsx";
import PrivateRoute from "./components/PrivateRoute";
import ProfileSetup from "./pages/private/ProfileSetup.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <Home />
                </PublicLayout>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute requireProfileComplete={true}>
                  <div>Dashboard (Profile Complete)</div>
                </PrivateRoute>
              }
            />
            <Route
              path="/profile-setup"
              element={
                <PrivateRoute>
                  <ProfileSetup />
                </PrivateRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
