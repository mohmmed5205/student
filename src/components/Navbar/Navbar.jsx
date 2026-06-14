import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';

const Navbar = ({ isAdmin, onLogout }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 z-50 w-full px-6 py-3 bg-[#e8edf2] shadow-nm transition-all duration-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-12 h-auto object-contain" />
          <span className="text-xl font-black text-slate-800">جائزة آل باكرمان</span>
        </Link>
        <ul className="flex items-center gap-4">
          <li>
            <Link 
              to="/" 
              className={`px-5 py-2 rounded-full transition-all duration-200 ${
                isActive('/') 
                ? 'shadow-nm-inset text-indigo-600 font-bold' 
                : 'shadow-nm-xs text-slate-600 font-medium hover:text-indigo-600'
              }`}
            >
              تسجيل الطالب
            </Link>
          </li>

          {isAdmin && (
            <li>
              <Link 
                to="/admin" 
                className={`px-5 py-2 rounded-full transition-all duration-200 ${
                  isActive('/admin') 
                  ? 'shadow-nm-inset text-indigo-600 font-bold' 
                  : 'shadow-nm-xs text-slate-600 font-medium hover:text-indigo-600'
                }`}
              >
                لوحة التحكم
              </Link>
            </li>
          )}

          {!isAdmin && (
            <li>
              <Link 
                to="/admin/login" 
                className={`px-5 py-2 rounded-full transition-all duration-200 ${
                  isActive('/admin/login') 
                  ? 'shadow-nm-inset text-indigo-600 font-bold' 
                  : 'shadow-nm-xs text-slate-600 font-medium hover:text-indigo-600'
                }`}
              >
                دخول الأدمن
              </Link>
            </li>
          )}

          {isAdmin && (
            <li>
              <button 
                onClick={onLogout} 
                className="shadow-nm-xs text-red-500 font-bold rounded-full px-5 py-2 transition-all duration-200 hover:shadow-nm-inset-sm"
              >
                تسجيل الخروج
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
