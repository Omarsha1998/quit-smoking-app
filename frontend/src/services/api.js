// src/services/api.js - FIXED VERSION
import axios from 'axios'

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  },
)

export const userAPI = {
  // Record app open
  async recordAppOpen(deviceId, isOnline = true) {
    try {
      const response = await api.post(`/users/${deviceId}/app-open`, {
        isOnline,
      })
      return response.data
    } catch (error) {
      console.error('❌ Record app open failed:', error)
      throw error
    }
  },

  // Get app opens statistics
  async getAppOpens(deviceId) {
    try {
      const response = await api.get(`/users/${deviceId}/app-opens`)
      return response.data
    } catch (error) {
      console.error('❌ Get app opens failed:', error)
      throw error
    }
  },

  async register(deviceId, userName) {
    try {
      const response = await api.post('/users/register', {
        deviceId,
        userName,
      })
      return response.data
    } catch (error) {
      console.error('❌ Register failed:', error)
      throw error
    }
  },

  async startTracking(deviceId, userName, quitDate, cigarettesPerDay, pricePerPack) {
    try {
      const response = await api.post('/users/start', {
        deviceId,
        userName,
        quitDate,
        cigarettesPerDay,
        pricePerPack,
      })
      return response.data
    } catch (error) {
      console.error('❌ Start tracking failed:', error)
      throw error
    }
  },

  async getUser(deviceId) {
    try {
      const response = await api.get(`/users/${deviceId}`)
      return response.data
    } catch (error) {
      console.error('❌ Get user failed:', error)
      throw error
    }
  },

  async updateProgress(deviceId, daysSmokeeFree, cigarettesAvoided, moneySaved) {
    try {
      const response = await api.post(`/users/${deviceId}/progress`, {
        daysSmokeeFree,
        cigarettesAvoided,
        moneySaved,
      })
      return response.data
    } catch (error) {
      console.error('❌ Update progress failed:', error)
      throw error
    }
  },

  async getAllUsers() {
    try {
      const response = await api.get('/users')
      return response.data
    } catch (error) {
      console.error('❌ Get all users failed:', error)
      throw error
    }
  },

  async deleteUser(deviceId) {
    try {
      const response = await api.delete(`/users/${deviceId}`)
      return response.data
    } catch (error) {
      console.error('❌ Delete user failed:', error)
      throw error
    }
  },
}

export default api
