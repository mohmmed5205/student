import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { getStudents } from '../../services/api';
import './AdminDashboard.css';

const CLASSES = [
  { id: 1, name: 'أول ابتدائي' }, { id: 2, name: 'ثاني ابتدائي' }, { id: 3, name: 'ثالث ابتدائي' },
  { id: 4, name: 'رابع ابتدائي' }, { id: 5, name: 'خامس ابتدائي' }, { id: 6, name: 'سادس ابتدائي' },
  { id: 7, name: 'أول متوسط' }, { id: 8, name: 'ثاني متوسط' }, { id: 9, name: 'ثالث متوسط' },
  { id: 10, name: 'أول ثانوي' }, { id: 11, name: 'ثاني ثانوي' }, { id: 12, name: 'ثالث ثانوي' }
];

const GOVERNORATES = {
  1: 'الرياض', 2: 'مكة المكرمة', 3: 'المدينة المنورة', 4: 'القصيم',
  5: 'المنطقة الشرقية', 6: 'عسير', 7: 'تبوك', 8: 'حائل',
  9: 'الحدود الشمالية', 10: 'جازان', 11: 'نجران', 12: 'الباحة'
};

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getStudents();
      setStudents(data.data || []);
    } catch (err) {
      setError(err.message || 'فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (students.length === 0) return { total: 0, avg: 0, top: 0 };
    const total = students.length;
    const avg = students.reduce((acc, s) => acc + parseFloat(s.grade), 0) / total;
    const top = Math.max(...students.map(s => parseFloat(s.grade)));
    return { total, avg: avg.toFixed(2), top: top.toFixed(2) };
  };

  const getGradeColor = (grade) => {
    const g = parseFloat(grade);
    if (g >= 90) return '#10b981'; // Green
    if (g >= 75) return '#8b5cf6'; // Purple
    return '#f59e0b'; // Orange
  };

  const exportToExcel = (classId, className) => {
    const classStudents = students.filter(s => parseInt(s.class) === classId);
    const males = classStudents.filter(s => s.gender === 'male').sort((a, b) => b.grade - a.grade);
    const females = classStudents.filter(s => s.gender === 'female').sort((a, b) => b.grade - a.grade);

    const formatData = (list) => list.map((s, index) => {
      const row = {
        'الترتيب': index + 1,
        'الاسم الكامل': `${s.first_name} ${s.second_name} ${s.third_name} ${s.last_name}`,
        'المدرسة': s.school_name,
        'المنطقة': GOVERNORATES[s.governorate] || s.governorate,
        'الدرجة': s.grade
      };
      if (classId === 12) {
        row['درجة القدرات'] = s.qudrat_score || '-';
        row['درجة التحصيلي'] = s.tahsili_score || '-';
      }
      return row;
    });

    const wb = XLSX.utils.book_new();

    if (males.length > 0) {
      const maleWs = XLSX.utils.json_to_sheet(formatData(males));
      maleWs['!dir'] = 'rtl';
      XLSX.utils.book_append_sheet(wb, maleWs, 'الذكور');
    }

    if (females.length > 0) {
      const femaleWs = XLSX.utils.json_to_sheet(formatData(females));
      femaleWs['!dir'] = 'rtl';
      XLSX.utils.book_append_sheet(wb, femaleWs, 'الإناث');
    }

    XLSX.writeFile(wb, `${className}_students.xlsx`);
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (error) return <div className="alert error">{error}</div>;

  const stats = calculateStats();

  return (
    <div className="admin-dashboard">
      <div className="stats-grid">
        <div className="stats-card card">
          <div className="stats-icon">👥</div>
          <div className="stats-info">
            <h3>إجمالي الطلاب</h3>
            <p>{stats.total}</p>
          </div>
        </div>
        <div className="stats-card card">
          <div className="stats-icon">📊</div>
          <div className="stats-info">
            <h3>متوسط الدرجات</h3>
            <p>{stats.avg}%</p>
          </div>
        </div>
        <div className="stats-card card">
          <div className="stats-icon">🏆</div>
          <div className="stats-info">
            <h3>أعلى درجة</h3>
            <p>{stats.top}%</p>
          </div>
        </div>
      </div>

      {CLASSES.map(cls => {
        const classStudents = students
          .filter(s => parseInt(s.class) === cls.id)
          .sort((a, b) => b.grade - a.grade);

        if (classStudents.length === 0) return null;

        return (
          <div key={cls.id} className="class-section card">
            <div className="section-header">
              <h2>{cls.name}</h2>
              <button
                onClick={() => exportToExcel(cls.id, cls.name)}
                className="export-btn btn-primary"
              >
                تصدير Excel 📥
              </button>
            </div>

            <div className="table-responsive">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>الترتيب</th>
                    <th>الاسم الكامل</th>
                    <th>المدرسة</th>
                    <th>المنطقة</th>
                    <th>الدرجة</th>
                    {cls.id === 12 && (
                      <>
                        <th>القدرات</th>
                        <th>التحصيلي</th>
                      </>
                    )}
                    <th>المستوى</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map((s, index) => (
                    <tr key={s.id}>
                      <td>
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && index + 1}
                      </td>
                      <td>{`${s.first_name} ${s.second_name} ${s.third_name} ${s.last_name}`}</td>
                      <td>{s.school_name}</td>
                      <td>{GOVERNORATES[s.governorate] || s.governorate}</td>
                      <td>{s.grade}%</td>
                      {cls.id === 12 && (
                        <>
                          <td>{s.qudrat_score || '-'}</td>
                          <td>{s.tahsili_score || '-'}</td>
                        </>
                      )}
                      <td>
                        <div className="progress-bar-bg">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${s.grade}%`,
                              backgroundColor: getGradeColor(s.grade)
                            }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminDashboard;
