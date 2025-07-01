import axios from './axiosInstance';

export const getGrns = () => axios.get(`/purchase/allgrns`);
export const getGrnById = (id) => axios.get(`/purchase/grn/${id}`);
export const createGrn = (poId, data) => axios.post(`/purchase/${poId}/creategrn`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});