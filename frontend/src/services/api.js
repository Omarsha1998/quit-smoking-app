// src/services/api.js
import axios from 'axios'

const API_BASE_URL = process.env.VITE_API_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

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

  // ── Admin check ────────────────────────────────────────────────────────────
  async checkAdmin(deviceId) {
    try {
      const response = await api.get(`/users/${deviceId}/is-admin`)
      return response.data.isAdmin === true
    } catch (error) {
      console.error('❌ Admin check failed:', error)
      throw error
    }
  },

  // ── Admin: get all users ───────────────────────────────────────────────────
  async getAllUsers(deviceId) {
    try {
      const response = await api.get('/admin/users', {
        headers: { 'x-device-id': deviceId },
      })
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

  async getDailyLogs(deviceId) {
    try {
      const response = await api.get(`/users/${deviceId}/daily-logs`)
      return response.data
    } catch (error) {
      console.error('❌ Get daily logs failed:', error)
      throw error
    }
  },

  // ── Community ──────────────────────────────────────────────────────────────

  // Post an anonymous message to the encouragement wall
  async postCommunityMessage(deviceId, alias, message) {
    try {
      const response = await api.post('/community/messages', { deviceId, alias, message })
      return response.data
    } catch (error) {
      console.error('❌ Post community message failed:', error)
      throw error
    }
  },

  // Get latest 30 encouragement wall messages (anonymous)
  async getCommunityMessages() {
    try {
      const response = await api.get('/community/messages')
      return response.data
    } catch (error) {
      console.error('❌ Get community messages failed:', error)
      throw error
    }
  },

  // Join the 7-day challenge
  async joinChallenge(deviceId, alias) {
    try {
      const response = await api.post('/community/challenge/join', { deviceId, alias })
      return response.data
    } catch (error) {
      console.error('❌ Join challenge failed:', error)
      throw error
    }
  },

  // Get leaderboard (alias + days only — no personal info)
  async getLeaderboard() {
    try {
      const response = await api.get('/community/leaderboard')
      return response.data
    } catch (error) {
      console.error('❌ Get leaderboard failed:', error)
      throw error
    }
  },

  // Get total participants count
  async getCommunityParticipants() {
    try {
      const response = await api.get('/community/participants')
      return response.data.count || 0
    } catch (error) {
      console.error('❌ Get participants failed:', error)
      throw error
    }
  },
}

export default api