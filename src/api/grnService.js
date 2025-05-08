//grnService.js
import axios from './axiosInstance';

export const getGrns = () => axios.get(`/purchase/allgrns`);
export const getGrnById = (id) => axios.get(`/purchase/grn/${id}`);
export const createGrn = (poId, data) => axios.post(`/purchase/${poId}/creategrn`, data);
export const updateGrn = (poId, grnId, data) => axios.put(`/purchase/${poId}/grn/${grnId}`, data);
export const deleteGrn = (poId, grnId) => axios.delete(`/purchase/${poId}/grn/${grnId}`);