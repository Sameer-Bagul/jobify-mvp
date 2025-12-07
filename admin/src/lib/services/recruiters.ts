import api from '../api';

export interface Recruiter {
  _id: string;
  recruiterName: string | null;
  recruiterEmail: string;
  companyName: string | null;
  phone?: string | null;
  linkedinUrl?: string | null;
  industry?: string | null;
  location?: string | null;
  notes?: string | null;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecruiterInput {
  recruiterName: string;
  recruiterEmail: string;
  companyName: string;
  phone?: string;
  linkedinUrl?: string;
  industry?: string;
  location?: string;
  notes?: string;
}

interface RecruitersResponse {
  recruiters: Recruiter[];
}

interface RecruiterResponse {
  message: string;
  recruiter: Recruiter;
}

interface UploadResponse {
  message: string;
  results: {
    total: number;
    success: number;
    failed: number;
    errors: string[];
  };
}

export const getRecruiters = async (): Promise<Recruiter[]> => {
  const response = await api.get<RecruitersResponse>('/api/admin/recruiters');
  return response.data.recruiters;
};

export const addRecruiter = async (data: RecruiterInput): Promise<RecruiterResponse> => {
  const response = await api.post<RecruiterResponse>('/api/admin/recruiters', data);
  return response.data;
};

export const updateRecruiter = async (id: string, data: Partial<RecruiterInput>): Promise<RecruiterResponse> => {
  const response = await api.put<RecruiterResponse>(`/api/admin/recruiters/${id}`, data);
  return response.data;
};

export const deleteRecruiter = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/api/admin/recruiters/${id}`);
  return response.data;
};

export const uploadRecruitersCSV = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<UploadResponse>('/api/admin/recruiters/upload-csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
