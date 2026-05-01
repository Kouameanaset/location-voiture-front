import api from './axios'

export const getVoitures         = (params) => api.get('/voitures', { params })
export const getVoiture          = (id)     => api.get(`/voitures/${id}`)
export const createVoiture       = (data)   => api.post('/voitures', data)
export const updateVoiture       = (id, data) => api.put(`/voitures/${id}`, data)
export const deleteVoiture       = (id)     => api.delete(`/voitures/${id}`)
export const getVoitureReservations = (id)  => api.get(`/voitures/${id}/reservations`)