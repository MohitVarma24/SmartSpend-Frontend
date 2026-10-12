import api from './axios';

export const settingsApi = {
  getSettings: async () => {
    const res = await api.get('/settings');
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.put('/settings/profile', profileData);
    return res.data;
  },

  changePassword: async (passwordData) => {
    const res = await api.put('/settings/password', passwordData);
    return res.data;
  }
};
