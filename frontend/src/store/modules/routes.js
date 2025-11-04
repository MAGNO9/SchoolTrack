import api from '../../services/api'

export default {
  namespaced: true,
  state: {
    routes: [],
    currentRoute: null,
    loading: false,
    error: null
  },
  mutations: {
    SET_ROUTES(state, routes) {
      state.routes = routes
    },
    SET_CURRENT_ROUTE(state, route) {
      state.currentRoute = route
    },
    ADD_ROUTE(state, route) {
      state.routes.unshift(route)
    },
    UPDATE_ROUTE(state, updatedRoute) {
      const index = state.routes.findIndex(r => r._id === updatedRoute._id)
      if (index !== -1) {
        state.routes.splice(index, 1, updatedRoute)
      }
      if (state.currentRoute?._id === updatedRoute._id) {
        state.currentRoute = updatedRoute
      }
    },
    REMOVE_ROUTE(state, routeId) {
      state.routes = state.routes.filter(r => r._id !== routeId)
      if (state.currentRoute?._id === routeId) {
        state.currentRoute = null
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
    async fetchRoutes({ commit }, params = {}) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await api.get('/routes', { params })
        commit('SET_ROUTES', response.data.routes)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al obtener rutas')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async fetchRoute({ commit }, id) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await api.get(`/routes/${id}`)
        commit('SET_CURRENT_ROUTE', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al obtener ruta')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async createRoute({ commit }, routeData) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await api.post('/routes', routeData)
        commit('ADD_ROUTE', response.data.route)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al crear ruta')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async updateRoute({ commit }, { id, data }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await api.put(`/routes/${id}`, data)
        commit('UPDATE_ROUTE', response.data.route)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al actualizar ruta')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async deleteRoute({ commit }, id) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        await api.delete(`/routes/${id}`)
        commit('REMOVE_ROUTE', id)
        return { success: true }
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al eliminar ruta')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async assignVehicle({ commit }, { routeId, vehicleId }) {
      try {
        const response = await api.post(`/routes/${routeId}/assign-vehicle`, { vehicleId })
        commit('UPDATE_ROUTE', response.data.route)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al asignar vehículo')
        throw error
      }
    },
    async removeVehicle({ commit }, { routeId, vehicleId }) {
      try {
        const response = await api.delete(`/routes/${routeId}/remove-vehicle`, { 
          data: { vehicleId } 
        })
        commit('UPDATE_ROUTE', response.data.route)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al remover vehículo')
        throw error
      }
    },
    async fetchActiveRoutes({ commit }) {
      try {
        const response = await api.get('/routes/active')
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al obtener rutas activas')
        throw error
      }
    }
  },
  getters: {
    routes: state => state.routes,
    currentRoute: state => state.currentRoute,
    isLoading: state => state.loading,
    error: state => state.error,
    activeRoutes: state => state.routes.filter(r => r.status === 'active'),
    routesByStatus: state => status => state.routes.filter(r => r.status === status),
    routesBySchool: state => schoolId => state.routes.filter(r => r.school._id === schoolId)
  }
}