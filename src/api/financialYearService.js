import axios from './axiosInstance';

export const getFinancialYears = () => axios.get('/financialYears');
export const createFinancialYear = (data) => axios.post('/createFinancialYear', data);
export const updateFinancialYear = (id, data) =>
  axios.put(`/updateFinancialYear/${id}`, data);
export const deleteFinancialYear = (id) =>
  axios.delete(`/deleteFinancialYear/${id}`);
