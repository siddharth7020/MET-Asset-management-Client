import axios from './axiosInstance';

export const getPurchaseOrders = () => axios.get('/purchase/');
export const getPurchaseOrder = (id) => axios.get(`/purchase/${id}`);

export const createPurchaseOrder = (data) => {
  const formData = new FormData();
  formData.append('poDate', data.poDate);
  formData.append('instituteId', data.instituteId);
  formData.append('financialYearId', data.financialYearId);
  formData.append('vendorId', data.vendorId);
  formData.append('requestedBy', data.requestedBy);
  formData.append('remark', data.remark || '');
  if (data.document) {
    formData.append('document', data.document);
  }
  formData.append('orderItems', JSON.stringify(data.orderItems));

  return axios.post('/purchase/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updatePurchaseOrder = (id, data) => {
  const formData = new FormData();
  formData.append('poDate', data.poDate);
  formData.append('instituteId',  data.instituteId);
  formData.append('financialYearId', data.financialYearId);
  formData.append('vendorId', data.vendorId);
  formData.append('requestedBy', data.requestedBy);
  formData.append('remark', data.remark || '');
  if (data.document) {
    formData.append('document', data.document);
  }
  formData.append('orderItems', JSON.stringify(data.orderItems));

  return axios.put(`/purchase/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deletePurchaseOrder = (id) => axios.delete(`/purchase/${id}`);