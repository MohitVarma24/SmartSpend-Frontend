import api from './axios';

export const expenseApi = {
  getExpenses: async (params = {}) => {
    const res = await api.get('/expenses', { params });
    return res.data;
  },

  getExpenseById: async (id) => {
    const res = await api.get(`/expenses/${id}`);
    return res.data;
  },

  createExpense: async (expenseData) => {
    const res = await api.post('/expenses', expenseData);
    return res.data;
  },

  updateExpense: async (id, expenseData) => {
    const res = await api.put(`/expenses/${id}`, expenseData);
    return res.data;
  },

  deleteExpense: async (id) => {
    const res = await api.delete(`/expenses/${id}`);
    return res.data;
  }
};
