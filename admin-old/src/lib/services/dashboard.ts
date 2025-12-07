import api from '../api';

export interface DashboardStats {
  totalUsers: number;
  totalSeekers: number;
  totalRecruiters: number;
  totalJobs: number;
  activeJobs: number;
  totalEmailsSent: number;
  emailsSentToday: number;
  activeSubscriptions: number;
  newUsersToday: number;
}

interface DashboardResponse {
  stats: DashboardStats;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardResponse>('/api/admin/dashboard');
  return response.data.stats;
};
