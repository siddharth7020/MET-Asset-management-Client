import axios from './axiosInstance';

export const getQuickInvoices = () => axios.get('/purchase/allquickinvoices');
export const getQuickInvoiceById = (id) => axios.get(`/purchase/quick-invoices/${id}`);
export const createQuickInvoice = (data) => axios.post('/purchase/quickinvoice/create', data);
export const updateQuickInvoice = (id, data) => axios.put(`/purchase/quick-invoices/${id}`, data);