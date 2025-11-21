import axios from 'axios'

// Crear instancia de axios con configuración optimizada
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000/api',
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptor de solicitudes
api.interceptors.request.use(
  (config) => {
    // Añadir token JWT si existe
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Añadir identificador de sesión si existe
    const sessionId = document.cookie
      .split('; ')
      .find(row => row.startsWith('schooltrack.sid'))
    if (sessionId) {
      config.headers['X-Session-Id'] = sessionId.split('=')[1]
    }

    // Log en desarrollo
    if (process.env.VUE_APP_ENVIRONMENT === 'development') {
      console.log(`📤 ${config.method.toUpperCase()} ${config.url}`)
    }

    return config
  },
  (error) => {
    console.error('❌ Error en solicitud:', error)
    return Promise.reject(error)
  }
)

// Interceptor de respuestas
api.interceptors.response.use(
  (response) => {
    // Log en desarrollo
    if (process.env.VUE_APP_ENVIRONMENT === 'development') {
      console.log(`📥 ${response.status} ${response.config.url}`)
    }
    return response
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || 'Error de conexión'

    // Manejo de errores específicos
    if (status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      document.cookie = 'schooltrack.sid=; Max-Age=0'
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?reason=expired'
      }
    } else if (status === 403) {
      // Acceso denegado
      console.error('❌ Acceso denegado:', message)
    } else if (status === 404) {
      // No encontrado
      console.warn('⚠️ Recurso no encontrado:', error.config.url)
    } else if (status === 500) {
      // Error del servidor
      console.error('❌ Error del servidor:', message)
    }

    console.error('API Error:', {
      status,
      message,
      url: error.config?.url,
      method: error.config?.method
    })

    return Promise.reject(error)
  }
)

export default api