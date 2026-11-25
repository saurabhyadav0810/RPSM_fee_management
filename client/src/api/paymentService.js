import api from './axios';

export const paymentService = {
  recordPayment: (data) => api.post('/payments', data),
  getPayments: (params) => api.get('/payments', { params }),
  getCollectionSummary: (params) => api.get('/payments/summary', { params }),
};
