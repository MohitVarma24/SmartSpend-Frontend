import api from './axios';

export const analyticsApi = {
  getDashboardSummary: async (month, year) => {
    const res = await api.get('/dashboard/summary', { params: { month, year } });
    return res.data;
  },

  getRecentExpenses: async (limit = 10, month, year) => {
    const res = await api.get('/dashboard/recent-expenses', { params: { limit, month, year } });
    return res.data;
  },

  getCategoryBreakdown: async (month, year) => {
    const res = await api.get('/analytics/category-breakdown', { params: { month, year } });
    return res.data;
  },

  getMonthlyTrend: async () => {
    const res = await api.get('/analytics/monthly-trend');
    return res.data;
  },

  getDailyTrend: async (month, year) => {
    const res = await api.get('/analytics/daily-trend', { params: { month, year } });
    return res.data;
  },

  getMonthComparison: async (month, year) => {
    const res = await api.get('/analytics/month-comparison', { params: { month, year } });
    return res.data;
  }
};
