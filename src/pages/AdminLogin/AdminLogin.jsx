import { useState } from 'react';
import { loginAdmin } from '../../services/api';
import logo from '../../assets/logo.png';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginAdmin(credentials.email, credentials.password);
      if (data.access_token) {
        onLogin(data.access_token);
      } else {
        throw new Error('لم يتم استلام توكن الدخول');
      }
    } catch (err) {
      setError(err.message || 'فشل تسجيل الدخول. يرجى التحقق من البيانات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e8edf2] flex items-center justify-center p-4">
      <div className="bg-[#e8edf2] rounded-3xl shadow-nm p-8 w-full max-w-sm transition-all duration-300">
        <img src={logo} alt="Logo" className="w-24 h-auto mx-auto mb-4 object-contain" />
        <h2 className="text-xl font-black text-slate-800 text-center mb-6">دخول المسؤول</h2>
        
        {error && (
          <div className="bg-red-50 text-red-500 rounded-xl p-4 text-sm shadow-nm-inset-sm mb-6 flex items-center gap-2">
            <span>⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 mr-2">اسم المستخدم</label>
            <div className="flex items-center shadow-nm-inset rounded-xl px-4 py-3 bg-transparent">
              <span className="text-slate-400 ml-2">👤</span>
              <input
                type="text"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                className="bg-transparent border-none outline-none text-slate-800 w-full placeholder-slate-300"
                placeholder="اسم المستخدم"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 mr-2">كلمة المرور</label>
            <div className="flex items-center shadow-nm-inset rounded-xl px-4 py-3 bg-transparent">
              <span className="text-slate-400 ml-2">🔒</span>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="bg-transparent border-none outline-none text-slate-800 w-full placeholder-slate-300"
                placeholder="********"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:grayscale" 
            disabled={loading}
          >
            {loading ? 'جاري التحقق...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;