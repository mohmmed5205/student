import { useState } from 'react';
import { submitStudent } from '../../services/api';
import './StudentForm.css';

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
  const [additionalImages, setAdditionalImages] = useState([null, null]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

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

    if (certImage) submissionData.append('cert_image', certImage);
    additionalImages.forEach((img, i) => {
      if (img) submissionData.append(`additional_images[${i}]`, img);
    });

    try {
      await submitStudent(submissionData);
      setMessage({ text: 'تم إرسال البيانات بنجاح!', type: 'success' });
      setFormData({
        first_name: '', second_name: '', third_name: '', last_name: '',
        gender: 'male', governorate: '', class: '', school_name: '',
        grade: '', qiyes_grade: '', SAAT_grade: '',
        phone1: '', phone2: '', address: ''
      });
      setCertImage(null);
      setAdditionalImages([null, null]);
      e.target.reset();
    } catch (error) {
      setMessage({ text: error.message || 'فشل في إرسال البيانات', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-form-page">
      <div className="form-card card">
        <h2 className="form-title">تسجيل بيانات الطالب</h2>
        {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>الاسم الأول*</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>اسم الأب*</label>
              <input type="text" name="second_name" value={formData.second_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>اسم الجد*</label>
              <input type="text" name="third_name" value={formData.third_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>اللقب *</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label> العائله*</label>
              <input type='text ' name='famele_name' pattern='باكرمان' readOnly value='باكرمان'></input>

            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>الجنس*</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
            <div className="form-group">
              <label>المنطقة*</label>
              <select name="governorate" value={formData.governorate} onChange={handleChange} required>
                <option value="">اختر المنطقة</option>
                {GOVERNORATES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>الصف الدراسي*</label>
              <select name="class" value={formData.class} onChange={handleChange} required>
                <option value="">اختر الصف</option>
                {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>اسم المدرسة*</label>
              <input type="text" name="school_name" value={formData.school_name} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>المعدل الدراسي (0-100)*</label>
              <input type="number" name="grade" min="0" max="100" step="0.01" value={formData.grade} onChange={handleChange} required />
            </div>
            {formData.class === '12' && (
              <>
                <div className="form-group">
                  <label>درجة القدرات</label>
                  <input type="number" name="qiyes_grade" value={formData.qiyes_grade} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>درجة التحصيلي</label>
                  <input type="number" name="SAAT_grade" value={formData.SAAT_grade} onChange={handleChange} />
                </div>
              </>
            )}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>رقم الهاتف 1</label>
              <input type="text" name="phone1" value={formData.phone1} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>رقم الهاتف 2</label>
              <input type="text" name="phone2" value={formData.phone2} onChange={handleChange} />
            </div>
            <div className="form-group full-width">
              <label>العنوان</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} />
            </div>
          </div>

          <div className="form-files">
            <div className="form-group">
              <label>صورة الشهادة (مطلوب)*</label>
              <input type="file" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e)} required />
            </div>
            <div className="form-group">
              <label>صورة إضافية 1</label>
              <input type="file" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e, 0)} />
            </div>
            <div className="form-group">
              <label>صورة إضافية 2</label>
              <input type="file" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e, 1)} />
            </div>
          </div>

          <button type="submit" className="submit-btn btn-primary" disabled={loading}>
            {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
