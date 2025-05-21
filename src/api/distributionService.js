import axios from './axiosInstance';

export const getAllDistributions = () => axios.get('/purchase/alldistributions');
export const getDistributionById = (id) => axios.get(`/purchase/distributions/${id}`);
export const createDistribution = (data) => axios.post('/purchase/distribution/create', data);
export const updateDistribution = (id, data) => axios.put(`/purchase/distributions/${id}`, data);