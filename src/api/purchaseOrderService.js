import axios from './axiosInstance';

export const getPurchaseOrders = () => axios.get('/purchase/');
export const getPurchaseOrder = (id) => axios.get(`/purchase/${id}`);

export const createPurchaseOrder = (data) => {
  return axios.post('/purchase/create', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const updatePurchaseOrder = (id, data) => {
  return axios.put(`/purchase/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const deletePurchaseOrder = (id) => axios.delete(`/purchase/${id}`);