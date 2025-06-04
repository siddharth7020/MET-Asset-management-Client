import axios from './axiosInstance';

export const getLocations = () => axios.get('/locations');
export const createLocation = (data) => axios.post('/createLocation', data);
export const updateLocation = (id, data) => axios.put(`/updateLocation/${id}`, data);
export const deleteLocation = (id) => axios.delete(`/deleteLocation/${id}`);