import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost/api'
})

// Intercepteur : afficher les erreurs dans la console en dev
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const msg = error.response?.data?.message || error.message
        console.error('[API Error]', msg)
        return Promise.reject(error)
    }
)

export default api