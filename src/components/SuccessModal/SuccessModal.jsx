import React from 'react';

const SuccessModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-[100] transition-all duration-300" onClick={onClose}>
      <div className="bg-[#e8edf2] rounded-[2.5rem] shadow-nm p-10 max-w-xs w-full mx-4 text-center transform transition-all duration-300" onClick={(e) => e.stopPropagation()}>
        <div className="w-24 h-24 bg-[#e8edf2] shadow-nm rounded-full flex items-center justify-center mx-auto mb-6 p-2">
          <div className="w-full h-full bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-full flex items-center justify-center shadow-lg text-3xl text-white">
            ✅
          </div>
        </div>
        <h2 className="text-xl font-black text-slate-800 mb-2">تم الإرسال بنجاح!</h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
          تم استلام بيانات الطالب بنجاح، سيتم مراجعتها قريباً من قبل اللجنة المنظمة
        </p>
        <button 
          className="w-full shadow-nm-sm text-indigo-600 font-bold px-8 py-3 rounded-full transition-all duration-200 hover:shadow-nm-inset-sm active:scale-95 bg-white/20" 
          onClick={onClose}
        >
          حسناً
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
