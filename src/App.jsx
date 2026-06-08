import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import StudentForm from './pages/StudentForm/StudentForm';
import AdminLogin from './pages/AdminLogin/AdminLogin';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import './App.css';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAdmin(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('admin_token', token);
    setIsAdmin(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAdmin(false);
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <Router>
      <Navbar isAdmin={isAdmin} onLogout={handleLogout} />
      <div className="container" style={{ paddingTop: '80px' }}>
        <Routes>
          <Route path="/" element={<StudentForm />} />
          
          <Route 
            path="/admin/login" 
            element={
              isAdmin ? <Navigate to="/admin" /> : <AdminLogin onLogin={handleLogin} />
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              isAdmin ? <AdminDashboard /> : <Navigate to="/admin/login" />
            } 
          />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
