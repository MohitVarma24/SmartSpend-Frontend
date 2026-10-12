import api from './axios';

export const insightApi = {
  getInsights: async (month, year) => {
    const res = await api.get('/insights', { params: { month, year } });
    return res.data;
  }
};
