import axios from './axiosInstance';

export const getGrns = () => axios.get(`/purchase/allgrns`);
export const getGrnById = (id) => axios.get(`/purchase/grn/${id}`);
export const createGrn = (poId, data) => axios.post(`/purchase/${poId}/creategrn`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateGrn = (grnId, data) => axios.put(`/purchase/grns/${grnId}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteGrn = (grnId) => axios.delete(`/purchase/grn/${grnId}`);