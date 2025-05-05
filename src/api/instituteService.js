import axios from './axiosInstance';

export const getInstitutes = () => axios.get('/institutes');
export const createInstitute = (data) => axios.post('/createInstitute', data);
export const updateInstitute = (id, data) => axios.put(`/updateInstitute/${id}`, data);
export const deleteInstitute = (id) => axios.delete(`/deleteInstitute/${id}`);
