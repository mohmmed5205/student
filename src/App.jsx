import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import StudentForm from './pages/StudentForm/StudentForm';
import AdminLogin from './pages/AdminLogin/AdminLogin';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import WelcomeModal from './components/WelcomeModal/WelcomeModal';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(true);

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

  if (loading) return (
    <div className="min-h-screen bg-[#e8edf2] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin shadow-nm"></div>
    </div>
  );

  return (
    <Router>
      {showModal && <WelcomeModal onClose={() => setShowModal(false)} />}
      <Navbar isAdmin={isAdmin} onLogout={handleLogout} />
      <div className="min-h-screen bg-[#e8edf2]">
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
