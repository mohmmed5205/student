const BASE_URL = '/api/';

const getHeaders = () => {
  const token = localStorage.getItem('admin_token');
  const headers = {
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const loginAdmin = async (email, password) => {
  const response = await fetch(`${BASE_URL}admin/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ username: email, password }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'فشل تسجيل الدخول');
  }
  return await response.json();
};

export const logoutAdmin = async () => {
  const response = await fetch(`${BASE_URL}logout`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('فشل تسجيل الخروج');
  return await response.json();
};

export const getStudents = async () => {
  const response = await fetch(`${BASE_URL}admin/students`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('فشل جلب بيانات الطلاب');
  return await response.json();
};

export const getStudent = async (id) => {
  const response = await fetch(`${BASE_URL}admin/students/${id}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('فشل جلب بيانات الطالب');
  return await response.json();
};

export const addStudent = async (formData) => {
  const response = await fetch(`${BASE_URL}admin/students`, {
    method: 'POST',
    headers: getHeaders(),
    body: formData,
  });
  if (!response.ok) throw new Error('فشل إضافة الطالب');
  return await response.json();
};

export const updateStudent = async (id, formData) => {
  const response = await fetch(`${BASE_URL}admin/students/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: formData,
  });
  if (!response.ok) throw new Error('فشل تحديث بيانات الطالب');
  return await response.json();
};

export const deleteStudent = async (id) => {
  const response = await fetch(`${BASE_URL}admin/students/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('فشل حذف الطالب');
  return await response.json();
};

export const submitStudent = async (formData) => {
  const response = await fetch(`${BASE_URL}students`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'فشل إرسال الطلب');
  }
  return await response.json();
};