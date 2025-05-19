import axios from './axiosInstance';

export const getAllStockStorage = () => axios.get('/purchase/allstock');
export const getStockStorageByItemId = (itemId) => axios.get(`/purchase/stock/${itemId}`);