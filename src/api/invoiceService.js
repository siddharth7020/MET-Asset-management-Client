import axios from './axiosInstance';

export const getAllInvoices = () => axios.get(`/allinvoices`);
export const getInvoiceById = (id) => axios.get(`/invoices/${id}`);
export const createInvoice = (data) => axios.post(`/invoice/create`, data);
export const updateInvoice = (id, data) => axios.put(`/invoiceupdate/${id}`, data);