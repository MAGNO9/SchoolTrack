import api from '../../services/api'

export default {
  namespaced: true,
  state: {
    users: [],
    currentUser: null,
    loading: false,
    error: null
  },
  mutations: {
    SET_USERS(state, users) {
      state.users = users
    },
    SET_CURRENT_USER(state, user) {
      state.currentUser = user
    },
    ADD_USER(state, user) {
      state.users.unshift(user)
    },
    UPDATE_USER(state, updatedUser) {
      const index = state.users.findIndex(u => u._id === updatedUser._id)
      if (index !== -1) {
        state.users.splice(index, 1, updatedUser)
      }
      if (state.currentUser?._id === updatedUser._id) {
        state.currentUser = updatedUser
      }
    },
    REMOVE_USER(state, userId) {
      state.users = state.users.filter(u => u._id !== userId)
      if (state.currentUser?._id === userId) {
        state.currentUser = null
      }
    },
    SET_LOADING(state, status) {
      state.loading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async fetchUsers({ commit }, params = {}) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await api.get('/users', { params })
        commit('SET_USERS', response.data.users)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al obtener usuarios')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async fetchUser({ commit }, id) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await api.get(`/users/${id}`)
        commit('SET_CURRENT_USER', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al obtener usuario')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async createUser({ commit }, userData) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await api.post('/users', userData)
        commit('ADD_USER', response.data.user)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al crear usuario')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async updateUser({ commit }, { id, data }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await api.put(`/users/${id}`, data)
        commit('UPDATE_USER', response.data.user)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al actualizar usuario')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async deleteUser({ commit }, id) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        await api.delete(`/users/${id}`)
        commit('REMOVE_USER', id)
        return { success: true }
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al eliminar usuario')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async fetchAvailableDrivers({ commit }) {
      try {
        const response = await api.get('/users/drivers/available')
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al obtener conductores disponibles')
        throw error
      }
    }
  },
  getters: {
    users: state => state.users,
    currentUser: state => state.currentUser,
    isLoading: state => state.loading,
    error: state => state.error,
    drivers: state => state.users.filter(u => u.role === 'driver'),
    admins: state => state.users.filter(u => u.role === 'admin'),
    parents: state => state.users.filter(u => u.role === 'parent'),
    activeUsers: state => state.users.filter(u => u.isActive),
    usersByRole: state => role => state.users.filter(u => u.role === role)
  }
}