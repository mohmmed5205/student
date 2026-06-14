import React from 'react';
import logo from '../../assets/logo.png';

const WelcomeModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300" onClick={onClose}>
      <div className="bg-[#e8edf2] rounded-3xl shadow-nm p-8 max-w-sm w-full mx-4 text-center transform transition-all duration-300" onClick={(e) => e.stopPropagation()}>
        <div className="inline-block mb-6 bg-white rounded-2xl p-3 shadow-nm">
          <img src={logo} alt="جائزة آل باكرمان" className="w-48 h-auto object-contain" />
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-2">أهلاً وسهلاً</h1>
        <div className="w-12 h-1 bg-gradient-to-r from-indigo-600 to-indigo-400 mx-auto mb-4 rounded-full"></div>
        <div className="space-y-2 mb-8">
          <p className="text-slate-600 font-bold">في الموقع الرسمي لجائزة عائلة الباكرمان</p>
          <p className="text-slate-500 text-sm">في دورتها الثانية عشر</p>
          <p className="text-slate-400 text-xs">الخاص بطلاب وطالبات الباكرمان</p>
        </div>
        <button 
          onClick={onClose}
          className="shadow-nm-sm rounded-full px-12 py-3 text-indigo-600 font-bold transition-all duration-200 hover:shadow-nm-inset-sm active:scale-95"
        >
          ابدأ الآن
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;