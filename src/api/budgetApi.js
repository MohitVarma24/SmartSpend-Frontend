import api from './axios';

export const budgetApi = {
  getBudgets: async (month, year) => {
    const res = await api.get('/budgets', { params: { month, year } });
    return res.data;
  },

  createBudget: async (budgetData) => {
    const res = await api.post('/budgets', budgetData);
    return res.data;
  },

  updateBudget: async (id, budgetData) => {
    const res = await api.put(`/budgets/${id}`, budgetData);
    return res.data;
  },

  deleteBudget: async (id) => {
    const res = await api.delete(`/budgets/${id}`);
    return res.data;
  }
};
