import api from './axios'

export const getCategories  = (params) => api.get('/categories', { params })
export const getCategorie   = (id)     => api.get(`/categories/${id}`)
export const createCategorie= (data)   => api.post('/categories', data)
export const updateCategorie= (id, data) => api.put(`/categories/${id}`, data)
export const deleteCategorie= (id)     => api.delete(`/categories/${id}`)

// ajout recent test
export const getCategorieVoitures = (id, params) => api.get(`/categories/${id}/voitures`, { params })