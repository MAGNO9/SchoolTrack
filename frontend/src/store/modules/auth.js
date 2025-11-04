// frontend/src/store/modules/auth.js
// ------------------------------------------------------
// Módulo Vuex para autenticación en SchoolTrack.
// Gestiona token, usuario, inicialización y logout seguro.
// ------------------------------------------------------

import api from '../../services/api'

export default {
  namespaced: true,

  // ---------------------------
  // Estado global del módulo
  // ---------------------------
  state: {
    token: localStorage.getItem('token') || null,
    user: null,
    initialized: false,
  },

  // ---------------------------
  // Mutaciones sincronas
  // ---------------------------
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } else {
        localStorage.removeItem('token')
        delete api.defaults.headers.common['Authorization']
      }
    },

    SET_USER(state, user) {
      state.user = user
    },

    SET_INITIALIZED(state, value) {
      state.initialized = value
    },

    LOGOUT(state) {
      state.token = null
      state.user = null
      state.initialized = false
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    },
  },

  // ---------------------------
  // Acciones asincrónicas
  // ---------------------------
  actions: {
    // Login de usuario
    async login({ commit }, credentials) {
      try {
        const { data } = await api.post('/auth/login', credentials)
        commit('SET_TOKEN', data.token)
        commit('SET_USER', data.user)
        return data
      } catch (error) {
        console.error('Error en login:', error)
        throw error
      }
    },

    // Obtiene el perfil actual desde el backend
    async fetchProfile({ commit, state }) {
      if (!state.token) return
      try {
        const { data } = await api.get('/auth/profile')
        commit('SET_USER', data)
      } catch (error) {
        console.error('Error al obtener perfil:', error)
        commit('LOGOUT')
      }
    },

    // Inicializa la sesión desde localStorage
    async initializeAuth({ commit, state, dispatch }) {
      try {
        if (state.initialized) return
        const token = state.token || localStorage.getItem('token')
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          await dispatch('fetchProfile') // corregido: sin this.dispatch
        }
      } catch (error) {
        console.error('Error inicializando autenticación:', error)
        commit('LOGOUT')
      } finally {
        commit('SET_INITIALIZED', true)
      }
    },

    // Logout completo
    logout({ commit }) {
      commit('LOGOUT')
    },
  },

  // ---------------------------
  // Getters
  // ---------------------------
  getters: {
    isAuthenticated: (state) => !!state.token,
    user: (state) => state.user,
    token: (state) => state.token,
  },
}
