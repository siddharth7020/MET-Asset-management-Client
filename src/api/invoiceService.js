import axios from './axiosInstance';

export const getAllInvoices = () => axios.get(`/purchase/allinvoices`);
export const getInvoiceById = (id) => axios.get(`/purchase/invoices/${id}`);
export const createInvoice = (data) => axios.post(`/purchase/invoice/create`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateInvoice = (id, data) => axios.put(`/purchase/invoices/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });