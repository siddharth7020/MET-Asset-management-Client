import axios from './axiosInstance';

export const getUnits = () => axios.get('/units');
export const createUnit = (data) => axios.post('/createUnit', data);
export const updateUnit = (id, data) => axios.put(`/updateUnit/${id}`, data);
export const deleteUnit = (id) => axios.delete(`/deleteUnit/${id}`);
