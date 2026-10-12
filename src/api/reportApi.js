import api from './axios';

export const reportApi = {
  getMonthlyReport: async (month, year) => {
    const res = await api.get('/reports/monthly', { params: { month, year } });
    return res.data;
  },

  downloadPdfReport: async (month, year) => {
    const response = await api.get('/reports/monthly/pdf', {
      params: { month, year },
      responseType: 'blob'
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SmartSpend_Report_${month}_${year}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  downloadCsvReport: async (month, year) => {
    const response = await api.get('/reports/monthly/csv', {
      params: { month, year },
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SmartSpend_Expenses_${month}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};
