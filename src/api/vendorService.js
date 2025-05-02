import axios from './axiosInstance';

export const getVendors = () => axios.get('/vendors');
export const createVendor = (data) => axios.post('/createVendor', data);
export const updateVendor = (id, data) => axios.put(`/updateVendor/${id}`, data);
export const deleteVendor = (id) => axios.delete(`/deleteVendor/${id}`);
