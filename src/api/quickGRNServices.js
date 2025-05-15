import axios from './axiosInstance';

export const getQuickGRNs = () => axios.get('/purchase/allquick-grns');
export const getQuickGRNById = (id) => axios.get(`/purchase/quick-grns/${id}`);
export const createQuickGRN = (data) => axios.post('/purchase/quick-grns', data);
export const updateQuickGRN = (id, data) => axios.put(`/purchase/quick-grns/${id}`, data);
export const deleteQuickGRN = (id) => axios.delete(`/purchase/quick-grns/${id}`);