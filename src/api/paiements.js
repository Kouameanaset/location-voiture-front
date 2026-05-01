import api from './axios'

export const getPaiements   = (params)   => api.get('/paiements', { params })
export const getPaiement    = (id)       => api.get(`/paiements/${id}`)
export const createPaiement = (data)     => api.post('/paiements', data)
export const updatePaiement = (id, data) => api.put(`/paiements/${id}`, data)
export const deletePaiement = (id)       => api.delete(`/paiements/${id}`)