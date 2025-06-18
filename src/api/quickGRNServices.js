import axios from './axiosInstance';

export const getQuickGRNs = () => axios.get('/purchase/allquick-grns');
export const getQuickGRNById = (id) => axios.get(`/purchase/quick-grns/${id}`);
export const createQuickGRN = (data) => {
    return axios.post('/purchase/quick-grns', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  };