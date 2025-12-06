import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem('auth-storage');
  if (authStorage) {
    const { state } = JSON.parse(authStorage);
    if (state.token) {
      config.headers.Authorization = `Bearer ${state.token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  signup: (data: { name: string; email: string; password: string; role?: string }) => api.post('/auth/signup', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  verifyOtp: (email: string, otp: string) => api.post('/auth/verify-otp', { email, otp }),
  resetPassword: (email: string, otp: string, newPassword: string) => api.post('/auth/reset-password', { email, otp, newPassword }),
  changePassword: (currentPassword: string, newPassword: string) => api.post('/auth/change-password', { currentPassword, newPassword }),
};

export const userApi = {
  getMe: () => api.get('/users/me'),
  updateOnboarding: (data: object) => api.post('/users/onboarding', data),
  updateProfile: (data: object) => api.put('/users/profile', data),
  uploadResume: (formData: FormData) => api.post('/users/upload-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getSavedItems: () => api.get('/users/saved-items'),
  saveItem: (type: string, itemId: string) => api.post('/users/saved-items', { type, itemId }),
  removeSavedItem: (type: string, itemId: string) => api.delete(`/users/saved-items/${type}/${itemId}`),
  getActivity: () => api.get('/users/activity'),
};

export const jobsApi = {
  getJobs: (params?: object) => api.get('/jobs', { params }),
  getFilters: () => api.get('/jobs/filters'),
  getJobsWithMatchScore: (params?: object) => api.get('/jobs/with-match-score', { params }),
  getJobById: (id: string) => api.get(`/jobs/${id}`),
  getMatchScore: (jobId: string) => api.get(`/jobs/${jobId}/match-score`),
};

export const emailApi = {
  getStats: () => api.get('/email/stats'),
  sendEmail: (data: { recipientEmail: string; subject: string; body: string; jobId?: string }) => api.post('/email/send', data),
  sendBulkEmails: (emails: Array<{ recipientEmail: string; subject: string; body: string }>) => api.post('/email/bulk', { emails }),
  getLogs: (params?: object) => api.get('/email/logs', { params }),
  getTemplates: () => api.get('/email/templates'),
  createTemplate: (data: { name: string; subject: string; body: string }) => api.post('/email/templates', data),
  updateTemplate: (id: string, data: { name?: string; subject?: string; body?: string }) => api.put(`/email/templates/${id}`, data),
  deleteTemplate: (id: string) => api.delete(`/email/templates/${id}`),
  getRecruiters: (params?: object) => api.get('/email/recruiters', { params }),
};

export const subscriptionApi = {
  getStatus: () => api.get('/subscription/status'),
  createOrder: (plan: string, amount: number) => api.post('/subscription/create-order', { plan, amount }),
  verifyPayment: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; plan: string }) => 
    api.post('/subscription/verify-payment', data),
  getHistory: () => api.get('/subscription/history'),
};

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params?: object) => api.get('/admin/users', { params }),
  banUser: (userId: string, isBanned: boolean) => api.post(`/admin/users/${userId}/ban`, { isBanned }),
  getJobs: (params?: object) => api.get('/admin/jobs', { params }),
  deleteJob: (jobId: string) => api.delete(`/admin/jobs/${jobId}`),
  getEmailLogs: (params?: object) => api.get('/admin/email-logs', { params }),
  getRecruiters: () => api.get('/admin/recruiters'),
  createRecruiter: (data: { name: string; email: string; company: string }) => api.post('/admin/recruiters', data),
  updateRecruiter: (id: string, data: { name?: string; email?: string; company?: string }) => api.put(`/admin/recruiters/${id}`, data),
  deleteRecruiter: (id: string) => api.delete(`/admin/recruiters/${id}`),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data: object) => api.put('/admin/settings', data),
};

export const recruiterApi = {
  getProfile: () => api.get('/recruiters/profile'),
  updateProfile: (data: object) => api.put('/recruiters/profile', data),
  getDashboard: () => api.get('/recruiters/dashboard'),
  getJobs: () => api.get('/recruiters/jobs'),
  createJob: (data: object) => api.post('/recruiters/jobs', data),
  updateJob: (id: string, data: object) => api.put(`/recruiters/jobs/${id}`, data),
  deleteJob: (id: string) => api.delete(`/recruiters/jobs/${id}`),
  getCandidates: (jobId?: string) => api.get('/recruiters/candidates', { params: { jobId } }),
};

export default api;
