import api from '../../services/api'

export default {
  namespaced: true,
  state: {
    locations: [],
    currentLocation: null,
    vehicleLocations: new Map(), // vehicleId -> location
    loading: false,
    error: null,
    socket: null
  },
  mutations: {
    SET_LOCATIONS(state, locations) {
      state.locations = locations
    },
    ADD_LOCATION(state, location) {
      state.locations.unshift(location)
      
      // Update vehicle locations map for real-time tracking
      if (location.vehicle) {
        state.vehicleLocations.set(location.vehicle._id || location.vehicle, location)
      }
    },
    SET_CURRENT_LOCATION(state, location) {
      state.currentLocation = location
    },
    SET_VEHICLE_LOCATION(state, { vehicleId, location }) {
      state.vehicleLocations.set(vehicleId, location)
    },
    SET_SOCKET(state, socket) {
      state.socket = socket
    },
    SET_LOADING(state, status) {
      state.loading = status
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async fetchVehicleLocationHistory({ commit }, { vehicleId, params = {} }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await api.get('/locations/history', {
          params: { vehicleId, ...params }
        })
        commit('SET_LOCATIONS', response.data.history)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al obtener historial de ubicaciones')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async calculateETA({ commit }, { vehicleId, destination }) {
      try {
        const response = await api.get('/locations/eta', {
          params: {
            vehicleId,
            lat: destination.latitude,
            lon: destination.longitude
          }
        })
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al calcular ETA')
        throw error
      }
    },
    async fetchRouteVehicles({ commit }, routeId) {
      try {
        const response = await api.get(`/locations/route/${routeId}`)
        
        // Update vehicle locations map
        response.data.vehicles.forEach(({ vehicle, location }) => {
          commit('SET_VEHICLE_LOCATION', {
            vehicleId: vehicle._id,
            location: location
          })
        })
        
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al obtener vehículos de ruta')
        throw error
      }
    },
    async fetchVehiclesInArea({ commit }, bounds) {
      try {
        const response = await api.get('/locations/area', {
          params: bounds
        })
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.message || 'Error al obtener vehículos en área')
        throw error
      }
    },
    initializeSocket({ commit, state }) {
      if (state.socket) return
      
      // Import socket.io client
      const io = require('socket.io-client')
      const socket = io(process.env.VUE_APP_API_URL || 'http://localhost:3000')
      
      commit('SET_SOCKET', socket)
      
      // Listen for location updates
      socket.on('vehicle-location-update', (data) => {
        commit('ADD_LOCATION', data)
      })
      
      socket.on('route-vehicle-update', (data) => {
        commit('SET_VEHICLE_LOCATION', {
          vehicleId: data.vehicleId,
          location: data.location
        })
      })
      
      return socket
    },
    subscribeToRoute({ state }, routeId) {
      if (state.socket) {
        state.socket.emit('subscribe-route', routeId)
      }
    },
    unsubscribeFromRoute({ state }, routeId) {
      if (state.socket) {
        state.socket.emit('unsubscribe-route', routeId)
      }
    },
    disconnectSocket({ commit, state }) {
      if (state.socket) {
        state.socket.disconnect()
        commit('SET_SOCKET', null)
      }
    }
  },
  getters: {
    locations: state => state.locations,
    currentLocation: state => state.currentLocation,
    vehicleLocations: state => state.vehicleLocations,
    getVehicleLocation: state => vehicleId => state.vehicleLocations.get(vehicleId),
    isLoading: state => state.loading,
    error: state => state.error,
    isConnected: state => state.socket && state.socket.connected,
    recentLocations: state => state.locations.slice(0, 50),
    locationsByVehicle: state => vehicleId => 
      state.locations.filter(loc => loc.vehicle === vehicleId)
  }
}