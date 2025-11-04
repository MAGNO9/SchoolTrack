import api from '../../services/api'

export default {
  namespaced: true,
  state: {
    stops: [],
    currentStop: null,
    loading: false,
    error: null
  },
  mutations: {
    SET_STOPS(state, stops) {
      state.stops = stops
    },
    SET_CURRENT_STOP(state, stop) {
      state.currentStop = stop
    },
    ADD_STOP(state, stop) {
      state.stops.unshift(stop)
    },
    UPDATE_STOP(state, updatedStop) {
      const index = state.stops.findIndex(s => s._id === updatedStop._id)
      if (index !== -1) {
        state.stops.splice(index, 1, updatedStop)
      }
      if (state.currentStop?._id === updatedStop._id) {
        state.currentStop = updatedStop
      }
    },
    REMOVE_STOP(state, stopId) {
      state.stops = state.stops.filter(s => s._id !== stopId)
      if (state.currentStop?._id === stopId) {
        state.currentStop = null
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
    async fetchStops({ commit }, params = {}) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await api.get('/stops', { params })
        commit('SET_STOPS', response.data.stops)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al obtener paradas')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async fetchStop({ commit }, id) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await api.get(`/stops/${id}`)
        commit('SET_CURRENT_STOP', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al obtener parada')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async createStop({ commit }, stopData) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await api.post('/stops', stopData)
        commit('ADD_STOP', response.data.stop)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al crear parada')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async updateStop({ commit }, { id, data }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await api.put(`/stops/${id}`, data)
        commit('UPDATE_STOP', response.data.stop)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al actualizar parada')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async deleteStop({ commit }, id) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        await api.delete(`/stops/${id}`)
        commit('REMOVE_STOP', id)
        return { success: true }
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al eliminar parada')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async fetchStopsByRoute({ commit }, routeId) {
      try {
        const response = await api.get(`/stops/route/${routeId}`)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al obtener paradas de ruta')
        throw error
      }
    },
    async fetchNearbyStops({ commit }, { lat, lng, radius }) {
      try {
        const response = await api.get(`/stops/nearby/${lat}/${lng}`, {
          params: { radius }
        })
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al obtener paradas cercanas')
        throw error
      }
    }
  },
  getters: {
    stops: state => state.stops,
    currentStop: state => state.currentStop,
    isLoading: state => state.loading,
    error: state => state.error,
    stopsByRoute: state => routeId => state.stops.filter(s => s.route === routeId),
    stopsByStatus: state => status => state.stops.filter(s => s.status === status),
    stopsByType: state => type => state.stops.filter(s => s.type === type),
    activeStops: state => state.stops.filter(s => s.status === 'active')
  }
}