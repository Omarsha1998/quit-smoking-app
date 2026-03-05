// src/services/api.js
import axios from 'axios'

const API_BASE_URL = process.env.API_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const fullUrl = `${config.baseURL || ''}${config.url}`
    console.log(`🚀 Calling Endpoint: [${config.method.toUpperCase()}] ${fullUrl}`)
    if (config.data) {
      console.log('📦 Request Data:', config.data)
    }
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  },
)

export const userAPI = {

  // ── App opens ──────────────────────────────────────────────────────────────
  async recordAppOpen(deviceId, isOnline = true) {
    try {
      const response = await api.post(`/users/${deviceId}/app-open`, { isOnline })
      return response.data
    } catch (error) {
      console.error('❌ Record app open failed:', error)
      throw error
    }
  },

  async getAppOpens(deviceId) {
    try {
      const response = await api.get(`/users/${deviceId}/app-opens`)
      return response.data
    } catch (error) {
      console.error('❌ Get app opens failed:', error)
      throw error
    }
  },

  // ── Registration & setup ───────────────────────────────────────────────────
  async register(deviceId, userName) {
    try {
      const response = await api.post('/users/register', { deviceId, userName })
      return response.data
    } catch (error) {
      console.error('❌ Register failed:', error)
      throw error
    }
  },

  async startTracking(deviceId, userName, quitDate, cigarettesPerDay, pricePerPack) {
    try {
      const response = await api.post('/users/start', {
        deviceId, userName, quitDate, cigarettesPerDay, pricePerPack,
      })
      return response.data
    } catch (error) {
      console.error('❌ Start tracking failed:', error)
      throw error
    }
  },

  // ── User data ──────────────────────────────────────────────────────────────
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
        daysSmokeeFree, cigarettesAvoided, moneySaved,
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

  // ── Daily check-in log ─────────────────────────────────────────────────────

  /**
   * Save (or upsert) a daily smoke check-in to the database.
   * POST /users/:deviceId/daily-log
   * Body: { date: 'YYYY-MM-DD', smoked: boolean, smokedCount: number }
   *
   * smokedCount = 0 if smoke-free, otherwise how many cigarettes they smoked.
   */
  async logDailyEntry(deviceId, date, smoked, smokedCount = 0) {
    try {
      const response = await api.post(`/users/${deviceId}/daily-log`, {
        date,
        smoked,
        smokedCount: smoked ? (parseInt(smokedCount) || 0) : 0,
      })
      return response.data
    } catch (error) {
      console.error('❌ Log daily entry failed:', error)
      throw error
    }
  },

  /**
   * Fetch all daily log entries for a user.
   * GET /users/:deviceId/daily-logs
   * Returns: [{ date: 'YYYY-MM-DD', smoked: boolean, smokedCount: number }, ...]
   */
  async getDailyLogs(deviceId) {
    try {
      const response = await api.get(`/users/${deviceId}/daily-logs`)
      return response.data
    } catch (error) {
      console.error('❌ Get daily logs failed:', error)
      throw error
    }
  },
}

export default api