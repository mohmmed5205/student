import { useState, useEffect } from 'react';
import { submitStudent } from '../../services/api';
import SuccessModal from '../../components/SuccessModal/SuccessModal';

const GOVERNORATES = [
  { id: 1, name: 'الرياض' }, { id: 2, name: 'مكة المكرمة' }, { id: 3, name: 'المدينة المنورة' },
  { id: 4, name: 'القصيم' }, { id: 5, name: 'المنطقة الشرقية' }, { id: 6, name: 'عسير' },
  { id: 7, name: 'تبوك' }, { id: 8, name: 'حائل' }, { id: 9, name: 'الحدود الشمالية' },
  { id: 10, name: 'جازان' }, { id: 11, name: 'نجران' }, { id: 12, name: 'الباحة' }
];

const CLASSES = [
  { id: 1, name: 'أول ابتدائي' }, { id: 2, name: 'ثاني ابتدائي' }, { id: 3, name: 'ثالث ابتدائي' },
  { id: 4, name: 'رابع ابتدائي' }, { id: 5, name: 'خامس ابتدائي' }, { id: 6, name: 'سادس ابتدائي' },
  { id: 7, name: 'أول متوسط' }, { id: 8, name: 'ثاني متوسط' }, { id: 9, name: 'ثالث متوسط' },
  { id: 10, name: 'أول ثانوي' }, { id: 11, name: 'ثاني ثانوي' }, { id: 12, name: 'ثالث ثانوي' }
];

const StudentForm = () => {
  const [formData, setFormData] = useState({
    first_name: '', second_name: '', third_name: '', last_name: '',
    gender: 'male', governorate: '', class: '', school_name: '',
    grade: '', qiyes_grade: '', SAAT_grade: '',
    phone1: '', phone2: '', address: ''
  });
  const [certImage, setCertImage] = useState(null);
  const [qiyesCertImage, setQiyesCertImage] = useState(null);
  const [SAATCertImage, setSAATCertImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([null, null]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let timer;
    if (showSuccess) {
      timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showSuccess]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, index = -1) => {
    const file = e.target.files[0];
    if (index === -1) {
      setCertImage(file);
    } else {
      const newFiles = [...additionalImages];
      newFiles[index] = file;
      setAdditionalImages(newFiles);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    const submissionData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) submissionData.append(key, formData[key]);
    });

    if (formData.class === '12') {
      if (qiyesCertImage) submissionData.append('qiyes_cert_image', qiyesCertImage);
      if (SAATCertImage) submissionData.append('SAAT_cert_image', SAATCertImage);
    }

    if (certImage) submissionData.append('cert_image', certImage);
    additionalImages.forEach((img, i) => {
      if (img) submissionData.append(`additional_images[${i}]`, img);
    });

    try {
      await submitStudent(submissionData);
      setShowSuccess(true);
      setFormData({
        first_name: '', second_name: '', third_name: '', last_name: '',
        gender: 'male', governorate: '', class: '', school_name: '',
        grade: '', qiyes_grade: '', SAAT_grade: '',
        phone1: '', phone2: '', address: ''
      });
      setCertImage(null);
      setQiyesCertImage(null);
      setSAATCertImage(null);
      setAdditionalImages([null, null]);
      e.target.reset();
    } catch (error) {
      setMessage({ text: error.message || 'فشل في إرسال البيانات', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e8edf2] py-20 px-4">
      {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)} />}
      
      <div className="bg-[#e8edf2] rounded-[2rem] shadow-nm p-8 max-w-2xl mx-auto transition-all duration-300">
        <div className="mb-8 text-center sm:text-right">
          <h2 className="text-2xl font-black text-slate-800 mb-1">تسجيل بيانات الطالب</h2>
          <p className="text-slate-500 text-sm">برجاء ملء البيانات بدقة لضمان التسجيل الصحيح</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl shadow-nm-inset-sm text-sm ${
            message.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-emerald-600'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 mr-2">الاسم الأول*</label>
              <input 
                type="text" name="first_name" value={formData.first_name} onChange={handleChange} required 
                className="bg-[#e8edf2] shadow-nm-inset rounded-xl px-4 py-3 border-none outline-none text-slate-800 w-full transition-all duration-200 focus:shadow-nm-inset-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 mr-2">اسم الأب*</label>
              <input 
                type="text" name="second_name" value={formData.second_name} onChange={handleChange} required 
                className="bg-[#e8edf2] shadow-nm-inset rounded-xl px-4 py-3 border-none outline-none text-slate-800 w-full transition-all duration-200 focus:shadow-nm-inset-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 mr-2">اسم الجد*</label>
              <input 
                type="text" name="third_name" value={formData.third_name} onChange={handleChange} required 
                className="bg-[#e8edf2] shadow-nm-inset rounded-xl px-4 py-3 border-none outline-none text-slate-800 w-full transition-all duration-200 focus:shadow-nm-inset-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 mr-2">اللقب*</label>
              <input 
                type="text" name="last_name" value={formData.last_name} onChange={handleChange} required 
                className="bg-[#e8edf2] shadow-nm-inset rounded-xl px-4 py-3 border-none outline-none text-slate-800 w-full transition-all duration-200 focus:shadow-nm-inset-sm"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-500 mr-2">العائلة*</label>
              <input 
                type="text" name="famele_name" pattern="باكرمان" readOnly value="باكرمان" 
                className="bg-[#f0f4f8] shadow-nm-inset rounded-xl px-4 py-3 border-none outline-none text-slate-400 w-full cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 mr-2">الجنس*</label>
              <select 
                name="gender" value={formData.gender} onChange={handleChange} required
                className="bg-[#e8edf2] shadow-nm-inset rounded-xl px-4 py-3 border-none outline-none text-slate-800 w-full appearance-none cursor-pointer transition-all duration-200 focus:shadow-nm-inset-sm"
              >
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 mr-2">المنطقة*</label>
              <select 
                name="governorate" value={formData.governorate} onChange={handleChange} required
                className="bg-[#e8edf2] shadow-nm-inset rounded-xl px-4 py-3 border-none outline-none text-slate-800 w-full appearance-none cursor-pointer transition-all duration-200 focus:shadow-nm-inset-sm"
              >
                <option value="">اختر المنطقة</option>
                {GOVERNORATES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 mr-2">الصف الدراسي*</label>
              <select 
                name="class" value={formData.class} onChange={handleChange} required
                className="bg-[#e8edf2] shadow-nm-inset rounded-xl px-4 py-3 border-none outline-none text-slate-800 w-full appearance-none cursor-pointer transition-all duration-200 focus:shadow-nm-inset-sm"
              >
                <option value="">اختر الصف</option>
                {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 mr-2">اسم المدرسة*</label>
              <input 
                type="text" name="school_name" value={formData.school_name} onChange={handleChange} required 
                className="bg-[#e8edf2] shadow-nm-inset rounded-xl px-4 py-3 border-none outline-none text-slate-800 w-full transition-all duration-200 focus:shadow-nm-inset-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className={`space-y-1 ${formData.class === '12' ? '' : 'sm:col-span-2'}`}>
              <label className="text-xs font-bold text-slate-500 mr-2">المعدل الدراسي (0-100)*</label>
              <input 
                type="number" name="grade" min="0" max="100" step="0.01" value={formData.grade} onChange={handleChange} required 
                className="bg-[#e8edf2] shadow-nm-inset rounded-xl px-4 py-3 border-none outline-none text-slate-800 w-full transition-all duration-200 focus:shadow-nm-inset-sm"
              />
            </div>
            {formData.class === '12' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 mr-2">درجة القدرات</label>
                  <input 
                    type="number" name="qiyes_grade" value={formData.qiyes_grade} onChange={handleChange} 
                    className="bg-[#e8edf2] shadow-nm-inset rounded-xl px-4 py-3 border-none outline-none text-slate-800 w-full transition-all duration-200 focus:shadow-nm-inset-sm"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 mr-2">درجة التحصيلي</label>
                  <input 
                    type="number" name="SAAT_grade" value={formData.SAAT_grade} onChange={handleChange} 
                    className="bg-[#e8edf2] shadow-nm-inset rounded-xl px-4 py-3 border-none outline-none text-slate-800 w-full transition-all duration-200 focus:shadow-nm-inset-sm"
                  />
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 mr-2">رقم الهاتف 1</label>
              <input 
                type="text" name="phone1" value={formData.phone1} onChange={handleChange} 
                className="bg-[#e8edf2] shadow-nm-inset rounded-xl px-4 py-3 border-none outline-none text-slate-800 w-full transition-all duration-200 focus:shadow-nm-inset-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 mr-2">رقم الهاتف 2</label>
              <input 
                type="text" name="phone2" value={formData.phone2} onChange={handleChange} 
                className="bg-[#e8edf2] shadow-nm-inset rounded-xl px-4 py-3 border-none outline-none text-slate-800 w-full transition-all duration-200 focus:shadow-nm-inset-sm"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-500 mr-2">العنوان</label>
              <input 
                type="text" name="address" value={formData.address} onChange={handleChange} 
                className="bg-[#e8edf2] shadow-nm-inset rounded-xl px-4 py-3 border-none outline-none text-slate-800 w-full transition-all duration-200 focus:shadow-nm-inset-sm"
              />
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <h3 className="text-sm font-black text-slate-700 border-r-4 border-indigo-600 pr-2">المرفقات والشهادات</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">صورة الشهادة (مطلوب)*</label>
                <div className="relative group">
                  <input 
                    type="file" accept="image/png, image/jpeg" onChange={(e) => setCertImage(e.target.files[0])} required 
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                  />
                  <div className="shadow-nm rounded-xl p-4 text-center text-slate-500 border-2 border-dashed border-slate-200 group-hover:border-indigo-400 transition-all duration-200">
                    <span className="text-xl">📁</span> {certImage ? certImage.name : 'اختر ملف الصورة'}
                  </div>
                </div>
              </div>
              {formData.class === '12' && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">صورة شهادة القدرات</label>
                    <input type="file" accept="image/png, image/jpeg" onChange={(e) => setQiyesCertImage(e.target.files[0])} className="text-xs text-slate-500 file:bg-[#e8edf2] file:shadow-nm file:border-none file:rounded-full file:px-4 file:py-2 file:ml-4 file:text-indigo-600 file:font-bold cursor-pointer" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">صورة شهادة التحصيلي</label>
                    <input type="file" accept="image/png, image/jpeg" onChange={(e) => setSAATCertImage(e.target.files[0])} className="text-xs text-slate-500 file:bg-[#e8edf2] file:shadow-nm file:border-none file:rounded-full file:px-4 file:py-2 file:ml-4 file:text-indigo-600 file:font-bold cursor-pointer" />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">صورة إضافية 1</label>
                <input type="file" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e, 0)} className="text-xs text-slate-500 file:bg-[#e8edf2] file:shadow-nm file:border-none file:rounded-full file:px-4 file:py-2 file:ml-4 file:text-indigo-600 file:font-bold cursor-pointer" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">صورة إضافية 2</label>
                <input type="file" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e, 1)} className="text-xs text-slate-500 file:bg-[#e8edf2] file:shadow-nm file:border-none file:rounded-full file:px-4 file:py-2 file:ml-4 file:text-indigo-600 file:font-bold cursor-pointer" />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-black py-5 rounded-2xl shadow-lg shadow-indigo-200 text-lg mt-8 transition-all duration-200 hover:scale-[1.01] active:scale-95 disabled:opacity-70" 
            disabled={loading}
          >
            {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
