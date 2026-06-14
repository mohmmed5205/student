import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';

const Navbar = ({ isAdmin, onLogout }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // أغلق القائمة عند تغيير الصفحة
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // أغلق القائمة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const linkClass = (path) =>
    `block px-5 py-2 rounded-full transition-all duration-200 ${
      isActive(path)
        ? 'shadow-nm-inset text-indigo-600 font-bold'
        : 'shadow-nm-xs text-slate-600 font-medium hover:text-indigo-600'
    }`;

  const mobileLinkClass = (path) =>
    `block px-4 py-3 rounded-xl text-center font-bold transition-all duration-200 ${
      isActive(path)
        ? 'shadow-nm-inset text-indigo-600'
        : 'shadow-nm-xs text-slate-600 hover:text-indigo-600'
    }`;

  return (
    <nav className="fixed top-0 z-50 w-full px-4 md:px-6 py-3 bg-[#e8edf2] shadow-nm transition-all duration-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center" ref={menuRef}>
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-10 md:w-12 h-auto object-contain" />
          <span className="text-lg md:text-xl font-black text-slate-800">جائزة آل باكرمان</span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-4">
          <li>
            <Link to="/" className={linkClass('/')}>
              تسجيل الطالب
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link to="/admin" className={linkClass('/admin')}>
                لوحة التحكم
              </Link>
            </li>
          )}
          {!isAdmin && (
            <li>
              <Link to="/admin/login" className={linkClass('/admin/login')}>
                الأدمن
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

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden shadow-nm-xs rounded-xl p-2 text-slate-600 text-xl transition-all duration-200 hover:shadow-nm-inset-sm active:scale-95"
          aria-label="القائمة"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="absolute top-full left-4 right-4 mt-2 bg-[#e8edf2] shadow-nm rounded-2xl p-4 flex flex-col gap-2 md:hidden animate-fade-in">
            <Link to="/" className={mobileLinkClass('/')}>
              تسجيل الطالب
            </Link>
            {isAdmin && (
              <Link to="/admin" className={mobileLinkClass('/admin')}>
                لوحة التحكم
              </Link>
            )}
            {!isAdmin && (
              <Link to="/admin/login" className={mobileLinkClass('/admin/login')}>
                الأدمن
              </Link>
            )}
            {isAdmin && (
              <button
                onClick={() => { onLogout(); setMenuOpen(false); }}
                className="shadow-nm-xs text-red-500 font-bold rounded-xl px-4 py-3 text-center transition-all duration-200 hover:shadow-nm-inset-sm"
              >
                تسجيل الخروج
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
