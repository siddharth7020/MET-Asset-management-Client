import axios from './axiosInstance';

export const getCategories = () => axios.get('/categories');
export const createCategory = (data) => axios.post('/createCategory', data);
export const updateCategory = (id, data) => axios.put(`/updateCategory/${id}`, data);
export const deleteCategory = (id) => axios.delete(`/deleteCategory/${id}`);
