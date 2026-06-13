import { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
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

const IMAGE_BASE_URL = 'https://vpkxfiywlhsdowqosuqi.supabase.co/storage/v1/object/public/certificates/';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

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
    if (g >= 90) return '#10b981';
    if (g >= 75) return '#8b5cf6';
    return '#f59e0b';
  };

  const fetchImageBuffer = async (filename) => {
    if (!filename) return null;
    try {
      const fullUrl = filename.startsWith('http') ? filename : `${IMAGE_BASE_URL}${filename}`;
      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error('failed');
      return await response.arrayBuffer();
    } catch {
      return null;
    }
  };

  const exportToExcel = async (males, females, className, classId) => {
    setExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const sections = [
        { name: 'طلاب', data: males },
        { name: 'طالبات', data: females }
      ];

      for (const section of sections) {
        if (section.data.length === 0) continue;
        const worksheet = workbook.addWorksheet(section.name);
        worksheet.views = [{ rightToLeft: true }];

        const columns = [
          { header: 'الترتيب', key: 'index', width: 10 },
          { header: 'الاسم الكامل', key: 'fullName', width: 30 },
          { header: 'المدرسة', key: 'school', width: 25 },
          { header: 'المنطقة', key: 'region', width: 20 },
          { header: 'الدرجة', key: 'grade', width: 15 },
        ];

        if (classId === 12) {
          columns.push({ header: 'درجة القدرات', key: 'qiyes_grade', width: 15 });
          columns.push({ header: 'درجة التحصيلي', key: 'SAAT_grade', width: 15 });
        }

        columns.push({ header: 'رقم الجوال 1', key: 'phone1', width: 20 });
        columns.push({ header: 'رقم الجوال 2', key: 'phone2', width: 20 });
        columns.push({ header: 'صورة الشهادة', key: 'cert_img', width: 25 });

        if (classId === 12) {
          columns.push({ header: 'شهادة القدرات', key: 'qiyes_cert_img', width: 25 });
          columns.push({ header: 'شهادة التحصيلي', key: 'SAAT_cert_img', width: 25 });
        }

        worksheet.columns = columns;

        worksheet.getRow(1).eachCell(cell => {
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
        worksheet.getRow(1).height = 30;

        for (let i = 0; i < section.data.length; i++) {
          const s = section.data[i];

          const rowData = {
            index: i + 1,
            fullName: `${s.first_name} ${s.second_name} ${s.third_name} ${s.last_name}`,
            school: s.school_name,
            region: GOVERNORATES[s.governorate] || s.governorate,
            grade: s.grade,
            phone1: s.phone1 || '-',
            phone2: s.phone2 || '-',
          };

          if (classId === 12) {
            rowData.qiyes_grade = s.qiyes_grade || '-';
            rowData.SAAT_grade = s.SAAT_grade || '-';
          }

          const row = worksheet.addRow(rowData);
          row.height = 90;
          row.eachCell(cell => {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          });

          // صورة الشهادة
          const certColIndex = columns.findIndex(c => c.key === 'cert_img') + 1;
          if (s.cert_image) {
            const buffer = await fetchImageBuffer(s.cert_image);
            if (buffer) {
              const imageId = workbook.addImage({ buffer, extension: 'jpeg' });
              worksheet.addImage(imageId, {
                tl: { col: certColIndex - 1, row: row.number - 1 },
                ext: { width: 120, height: 85 }
              });
            } else {
              worksheet.getCell(row.number, certColIndex).value = 'لا توجد صورة';
            }
          } else {
            worksheet.getCell(row.number, certColIndex).value = 'لا توجد صورة';
          }

          // صور ثالث ثانوي
          if (classId === 12) {
            const qiyesColIndex = columns.findIndex(c => c.key === 'qiyes_cert_img') + 1;
            const SAATColIndex = columns.findIndex(c => c.key === 'SAAT_cert_img') + 1;

            if (s.qiyes_cert_image) {
              const buffer = await fetchImageBuffer(s.qiyes_cert_image);
              if (buffer) {
                const imageId = workbook.addImage({ buffer, extension: 'jpeg' });
                worksheet.addImage(imageId, {
                  tl: { col: qiyesColIndex - 1, row: row.number - 1 },
                  ext: { width: 120, height: 85 }
                });
              } else {
                worksheet.getCell(row.number, qiyesColIndex).value = 'لا توجد صورة';
              }
            } else {
              worksheet.getCell(row.number, qiyesColIndex).value = 'لا توجد صورة';
            }

            if (s.SAAT_cert_image) {
              const buffer = await fetchImageBuffer(s.SAAT_cert_image);
              if (buffer) {
                const imageId = workbook.addImage({ buffer, extension: 'jpeg' });
                worksheet.addImage(imageId, {
                  tl: { col: SAATColIndex - 1, row: row.number - 1 },
                  ext: { width: 120, height: 85 }
                });
              } else {
                worksheet.getCell(row.number, SAATColIndex).value = 'لا توجد صورة';
              }
            } else {
              worksheet.getCell(row.number, SAATColIndex).value = 'لا توجد صورة';
            }
          }
        }
      }

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `بيانات_${className.replace(/\s+/g, '_')}.xlsx`);
    } catch (err) {
      alert('فشل تصدير الملف: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const renderStudentTable = (title, list, classId) => {
    if (list.length === 0) return null;

    return (
      <div className="gender-table-container">
        <div className="table-header">
          <h3 className="gender-table-title">{title}</h3>
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
                {classId === 12 && (
                  <>
                    <th>القدرات</th>
                    <th>التحصيلي</th>
                  </>
                )}
                <th>رقم الجوال 1</th>
                <th>رقم الجوال 2</th>
                <th>المستوى</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s, index) => (
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
                  {classId === 12 && (
                    <>
                      <td>{s.qiyes_grade || '-'}</td>
                      <td>{s.SAAT_grade || '-'}</td>
                    </>
                  )}
                  <td>{s.phone1 || '-'}</td>
                  <td>{s.phone2 || '-'}</td>
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
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (error) return <div className="alert error">{error}</div>;

  const stats = calculateStats();

  return (
    <div className="admin-dashboard">
      {exporting && (
        <div className="export-overlay">
          <div className="export-message">
            <div className="spinner"></div>
            <p>جاري تصدير الملف مع الصور...</p>
          </div>
        </div>
      )}

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
        const classStudents = students.filter(s => parseInt(s.class) === cls.id);
        const males = classStudents.filter(s => s.gender === 'male').sort((a, b) => b.grade - a.grade);
        const females = classStudents.filter(s => s.gender === 'female').sort((a, b) => b.grade - a.grade);

        if (classStudents.length === 0) return null;

        return (
          <div key={cls.id} className="class-section card">
            <div className="section-header">
              <h2>{cls.name}</h2>
              <button
                onClick={() => exportToExcel(males, females, cls.name, cls.id)}
                className="export-btn btn-primary"
                disabled={exporting}
              >
                {exporting ? 'جاري التصدير...' : 'تصدير Excel 📥'}
              </button>
            </div>
            {renderStudentTable(`طلاب ${cls.name}`, males, cls.id)}
            {renderStudentTable(`طالبات ${cls.name}`, females, cls.id)}
          </div>
        );
      })}
    </div>
  );
};

export default AdminDashboard;