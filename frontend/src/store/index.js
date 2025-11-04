import { createStore } from 'vuex'
import auth from './modules/auth'
import vehicles from './modules/vehicles'
import routes from './modules/routes'
import stops from './modules/stops'
import users from './modules/users'
import locations from './modules/locations'

export default createStore({
  modules: {
    auth,
    vehicles,
    routes,
    stops,
    users,
    locations
  },
  state: {
    isLoading: false,
    notifications: [],
    sidebarCollapsed: false
  },
  mutations: {
    SET_LOADING(state, status) {
      state.isLoading = status
    },
    ADD_NOTIFICATION(state, notification) {
      state.notifications.push({
        id: Date.now(),
        ...notification
      })
    },
    REMOVE_NOTIFICATION(state, id) {
      state.notifications = state.notifications.filter(n => n.id !== id)
    },
    TOGGLE_SIDEBAR(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
    }
  },
  actions: {
    showNotification({ commit }, notification) {
      commit('ADD_NOTIFICATION', notification)
      // Auto remove after 5 seconds
      setTimeout(() => {
        commit('REMOVE_NOTIFICATION', notification.id)
      }, 5000)
    },
    toggleSidebar({ commit }) {
      commit('TOGGLE_SIDEBAR')
    }
  },
  getters: {
    isLoading: state => state.isLoading,
    notifications: state => state.notifications,
    isSidebarCollapsed: state => state.sidebarCollapsed
  }
})