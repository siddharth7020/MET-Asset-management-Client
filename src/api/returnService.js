import axios from './axiosInstance';

export const getAllReturns = () => axios.get('/purchase/allreturns');
export const getReturnById = (id) => axios.get(`/purchase/returns/${id}`);
export const createReturn = (data) => axios.post('/purchase/returns/create', data);