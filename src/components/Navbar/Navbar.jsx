import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isAdmin, onLogout }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          نظام تكريم الطلاب
        </Link>
        <ul className="navbar-links">
          <li>
            <Link to="/" className={isActive('/')}>تسجيل الطالب</Link>
          </li>
          
          {isAdmin && (
            <li>
              <Link to="/admin" className={isActive('/admin')}>لوحة التحكم</Link>
            </li>
          )}
          
          {!isAdmin && (
            <li>
              <Link to="/admin/login" className={isActive('/admin/login')}>دخول الأدمن</Link>
            </li>
          )}
        </ul>
        
        {isAdmin && (
          <button onClick={onLogout} className="logout-btn">تسجيل الخروج</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
