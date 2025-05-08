// purchaseOrderService.js
import axios from './axiosInstance';

export const getPurchaseOrders = () => axios.get('/purchase/');
export const getPurchaseOrder   = (id) => axios.get(`/purchase/${id}`);
export const createPurchaseOrder = (data) => axios.post('/purchase/create', data);
export const updatePurchaseOrder = (id, data) => axios.put(`/purchase/${id}`, data);
export const deletePurchaseOrder = (id) => axios.delete(`/purchase/${id}`);
