import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AllergiesList from './pages/AllergiesList';
import ScanProduct from './pages/ScanProduct';
import ScanHistory from './pages/ScanHistory';
import ScanDetail from './pages/ScanDetail';
import SmartMealRecommendations from './pages/SmartMealRecommendations';
import RestaurantMenuScanner from './pages/RestaurantMenuScanner';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/allergies" 
            element={
              <ProtectedRoute>
                <AllergiesList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/scan" 
            element={
              <ProtectedRoute>
                <ScanProduct />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <ScanHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history/:id" 
            element={
              <ProtectedRoute>
                <ScanDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recommendations" 
            element={
              <ProtectedRoute>
                <SmartMealRecommendations />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/menu-scanner" 
            element={
              <ProtectedRoute>
                <RestaurantMenuScanner />
              </ProtectedRoute>
            } 
          />
        </Routes>
        <ToastContainer position="top-right" autoClose={5000} />
      </AuthProvider>
    </Router>
  );
}

export default App;