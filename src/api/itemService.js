import axios from './axiosInstance';

export const getItems = () => axios.get('/items');
export const createItem = (data) => axios.post('/createItem', data);
export const updateItem = (id, data) => axios.put(`/updateItem/${id}`, data);
export const deleteItem = (id) => axios.delete(`/deleteItem/${id}`);