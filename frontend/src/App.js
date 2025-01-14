import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Weather from "./components/Weather";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";

function App() {
  const authToken = localStorage.getItem("authToken");
  const isAuthenticated = authToken !== null;
  let isAdmin = false;

  if (isAuthenticated) {
    const payload = JSON.parse(atob(authToken.split('.')[1]));
    isAdmin = payload.roles.includes("ROLE_ADMIN");
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Weather />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/dashboard" element={isAuthenticated && isAdmin ? <Dashboard /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
