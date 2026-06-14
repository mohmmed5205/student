import { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { getStudents } from '../../services/api';

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
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4 mx-6">
          <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
          <h3 className="text-sm font-bold text-indigo-600 shadow-nm-inset-sm px-4 py-1 rounded-lg border-r-2 border-indigo-600 bg-white/50">{title}</h3>
        </div>
        <div className="overflow-x-auto px-6">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-xs font-bold text-slate-400 px-4 py-4">الترتيب</th>
                <th className="text-xs font-bold text-slate-400 px-4 py-4">الاسم الكامل</th>
                <th className="text-xs font-bold text-slate-400 px-4 py-4">المدرسة</th>
                <th className="text-xs font-bold text-slate-400 px-4 py-4">المنطقة</th>
                <th className="text-xs font-bold text-slate-400 px-4 py-4">الدرجة</th>
                {classId === 12 && (
                  <>
                    <th className="text-xs font-bold text-slate-400 px-4 py-4">القدرات</th>
                    <th className="text-xs font-bold text-slate-400 px-4 py-4">التحصيلي</th>
                  </>
                )}
                <th className="text-xs font-bold text-slate-400 px-4 py-4">التقدم</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s, index) => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-white/30 transition-colors">
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg shadow-nm-xs text-sm font-black ${
                      index === 0 ? 'text-yellow-600 bg-yellow-50' : 
                      index === 1 ? 'text-slate-400 bg-slate-50' : 
                      index === 2 ? 'text-orange-600 bg-orange-50' : 'text-slate-500'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-bold text-slate-700">{`${s.first_name} ${s.second_name} ${s.third_name} ${s.last_name}`}</td>
                  <td className="px-4 py-4 text-slate-600 text-sm">{s.school_name}</td>
                  <td className="px-4 py-4 text-slate-500 text-sm">{GOVERNORATES[s.governorate] || s.governorate}</td>
                  <td className="px-4 py-4 font-black text-indigo-600">{s.grade}%</td>
                  {classId === 12 && (
                    <>
                      <td className="px-4 py-4 text-slate-600 font-bold">{s.qiyes_grade || '-'}</td>
                      <td className="px-4 py-4 text-slate-600 font-bold">{s.SAAT_grade || '-'}</td>
                    </>
                  )}
                  <td className="px-4 py-4">
                    <div className="h-2 w-24 bg-white shadow-nm-inset-sm rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-l from-indigo-600 to-indigo-400 transition-all duration-500"
                        style={{ width: `${s.grade}%` }}
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

  if (loading) return (
    <div className="min-h-screen bg-[#e8edf2] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin shadow-nm"></div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-[#e8edf2] p-8">
      <div className="bg-red-50 text-red-500 p-6 rounded-3xl shadow-nm-inset max-w-md mx-auto text-center font-bold">
        ❌ {error}
      </div>
    </div>
  );

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-[#e8edf2] py-24 px-6">
      {exporting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-[#e8edf2] p-8 rounded-3xl shadow-nm text-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
            <p className="font-black text-slate-800">جاري تصدير الملف مع الصور...</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-black text-slate-800 mb-8 border-r-8 border-indigo-600 pr-4 inline-block">لوحة التحكم</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#e8edf2] rounded-[2rem] shadow-nm p-6 text-center transition-all duration-300 hover:scale-[1.02]">
            <div className="w-14 h-14 bg-white shadow-nm-sm rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">👥</div>
            <p className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-wider">إجمالي الطلاب</p>
            <h3 className="text-4xl font-black text-slate-800">{stats.total}</h3>
          </div>
          <div className="bg-[#e8edf2] rounded-[2rem] shadow-nm p-6 text-center transition-all duration-300 hover:scale-[1.02]">
            <div className="w-14 h-14 bg-white shadow-nm-sm rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">📊</div>
            <p className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-wider">متوسط الدرجات</p>
            <h3 className="text-4xl font-black text-slate-800">{stats.avg}%</h3>
          </div>
          <div className="bg-[#e8edf2] rounded-[2rem] shadow-nm p-6 text-center transition-all duration-300 hover:scale-[1.02]">
            <div className="w-14 h-14 bg-white shadow-nm-sm rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🏆</div>
            <p className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-wider">أعلى درجة</p>
            <h3 className="text-4xl font-black text-slate-800">{stats.top}%</h3>
          </div>
        </div>

        <div className="space-y-12">
          {CLASSES.map(cls => {
            const classStudents = students.filter(s => parseInt(s.class) === cls.id);
            const males = classStudents.filter(s => s.gender === 'male').sort((a, b) => b.grade - a.grade);
            const females = classStudents.filter(s => s.gender === 'female').sort((a, b) => b.grade - a.grade);

            if (classStudents.length === 0) return null;

            return (
              <div key={cls.id} className="bg-[#e8edf2] rounded-[2.5rem] shadow-nm overflow-hidden transition-all duration-300">
                <div className="px-8 py-6 flex justify-between items-center bg-white/40">
                  <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                    {cls.name}
                  </h2>
                  <button
                    onClick={() => exportToExcel(males, females, cls.name, cls.id)}
                    className="shadow-nm-xs text-emerald-600 font-bold text-sm px-6 py-2 rounded-full transition-all duration-200 hover:shadow-nm-inset-sm active:scale-95 flex items-center gap-2"
                    disabled={exporting}
                  >
                    <span>Excel</span> 📥
                  </button>
                </div>
                
                <div className="py-6">
                  {renderStudentTable(`كشف الطلاب - ${cls.name}`, males, cls.id)}
                  {renderStudentTable(`كشف الطالبات - ${cls.name}`, females, cls.id)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;