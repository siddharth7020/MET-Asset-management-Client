import axios from './axiosInstance';

export const getAllDistributions = () => axios.get('/purchase/alldistributions');
export const getDistributionById = (id) => axios.get(`/purchase/distributions/${id}`);
export const createDistribution = (data, config) => axios.post('/purchase/distribution/create', data, config);
export const updateDistribution = (id, data, config) => axios.put(`/purchase/distributions/${id}`, data, config);