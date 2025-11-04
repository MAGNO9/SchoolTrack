// C:\schooltrack\schooltrack\frontend\src\store\modules\vehicles.js
import axios from 'axios'

export default {
  namespaced: true,
  state: {
    vehicles: []
  },
  getters: {
    vehicles(state) {
      return state.vehicles || []
    },
    activeVehicles(state) {
      return state.vehicles.filter(v => v.status === 'active') || []
    }
  },
  mutations: {
    SET_VEHICLES(state, vehicles) {
      state.vehicles = vehicles
    }
  },
  actions: {
    async fetchVehicles({ commit }) {
      try {
        const response = await axios.get('http://localhost:3000/api/vehicles')
        commit('SET_VEHICLES', response.data)
      } catch (error) {
        console.error('Error fetching vehicles:', error)
        commit('SET_VEHICLES', [])
      }
    }
  }
}