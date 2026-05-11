// src/services/api.js
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  },
)

// ─────────────────────────────────────────────────────────────────────────────
// Retry helper — backs off on 429, gives up after maxRetries
// ─────────────────────────────────────────────────────────────────────────────

async function withRetry(fn, maxRetries = 3, baseDelayMs = 1000) {
  let lastError
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      const status = error.response?.status
      // Only retry on 429 (rate limit) or 5xx (server error)
      if (status !== 429 && (status < 500 || status > 599)) throw error
      if (attempt === maxRetries) break
      const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 200
      console.warn(
        `⚠️  Attempt ${attempt + 1} failed (${status}), retrying in ${Math.round(delay)}ms…`,
      )
      await new Promise((r) => setTimeout(r, delay))
    }
  }
  throw lastError
}

export const userAPI = {
  // ── App opens ──────────────────────────────────────────────────────────────
  async recordAppOpen(deviceId, isOnline = true) {
    // ❌ NO withRetry here — app-open must fire ONCE and never retry
    const response = await api.post(`/users/${deviceId}/app-open`, { isOnline })
    return response.data
  },

  async getAppOpens(deviceId) {
    const response = await api.get(`/users/${deviceId}/app-opens`)
    return response.data
  },

  // ── Registration & setup ───────────────────────────────────────────────────
  async register(deviceId, userName) {
    return withRetry(async () => {
      const response = await api.post('/users/register', { deviceId, userName })
      return response.data
    })
  },

  async startTracking(deviceId, userName, quitDate, cigarettesPerDay, pricePerPack) {
    return withRetry(async () => {
      const response = await api.post('/users/start', {
        deviceId,
        userName,
        quitDate,
        cigarettesPerDay,
        pricePerPack,
      })
      return response.data
    })
  },

  // ── User data ──────────────────────────────────────────────────────────────
  async getUser(deviceId) {
    const response = await api.get(`/users/${deviceId}`)
    return response.data
  },

  async updateProgress(deviceId, daysSmokeeFree, cigarettesAvoided, moneySaved) {
    return withRetry(async () => {
      const response = await api.post(`/users/${deviceId}/progress`, {
        daysSmokeeFree,
        cigarettesAvoided,
        moneySaved,
      })
      return response.data
    })
  },

  // ── Admin ──────────────────────────────────────────────────────────────────
  async verifyAdminPin(pin) {
    const response = await api.post('/admin/verify', { pin })
    return response.data.token
  },

  async getAllUsers(deviceId, adminToken) {
    const response = await api.get('/admin/users', {
      headers: {
        'x-device-id': deviceId,
        'x-admin-token': adminToken,
      },
    })
    return response.data
  },

  async deleteUser(deviceId) {
    const response = await api.delete(`/users/${deviceId}`)
    return response.data
  },

  // ── Daily log ──────────────────────────────────────────────────────────────
  async logDailyEntry(deviceId, date, smoked, smokedCount = 0) {
    return withRetry(async () => {
      const response = await api.post(`/users/${deviceId}/daily-log`, {
        date,
        smoked,
        smokedCount: smoked ? parseInt(smokedCount) || 0 : 0,
      })
      return response.data
    })
  },

  async getDailyLogs(deviceId) {
    const response = await api.get(`/users/${deviceId}/daily-logs`)
    return response.data
  },

  // ── Community ──────────────────────────────────────────────────────────────
  async postCommunityMessage(deviceId, alias, message) {
    return withRetry(async () => {
      const response = await api.post('/community/messages', { deviceId, alias, message })
      return response.data
    })
  },

  async getCommunityMessages() {
    const response = await api.get('/community/messages')
    return response.data
  },

  async joinChallenge(deviceId, alias) {
    return withRetry(async () => {
      const response = await api.post('/community/challenge/join', { deviceId, alias })
      return response.data
    })
  },

  async getLeaderboard() {
    const response = await api.get('/community/leaderboard')
    return response.data
  },

  async getCommunityParticipants() {
    const response = await api.get('/community/participants')
    return response.data.count || 0
  },

  // ── Bulk sync on app open ──────────────────────────────────────────────────
  // Fires all startup sync calls sequentially with a small gap between each
  // to avoid burst-triggering rate limits.
  async syncOnOpen({
    deviceId,
    userName,
    quitDate,
    cigarettesPerDay,
    pricePerPack,
    stats,
    hasStarted,
  }) {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms))

    // 1. Record app open
    try {
      await this.recordAppOpen(deviceId, navigator.onLine)
    } catch (e) {
      console.warn('app-open sync failed:', e.message)
    }
    await delay(150)

    // 2. Ensure user record exists
    try {
      await this.register(deviceId, userName)
    } catch (e) {
      console.warn('register sync failed:', e.message)
    }
    await delay(150)

    // 3. Sync tracking setup (only if user has started)
    if (hasStarted && quitDate) {
      try {
        await this.startTracking(deviceId, userName, quitDate, cigarettesPerDay, pricePerPack)
      } catch (e) {
        console.warn('start sync failed:', e.message)
      }
      await delay(150)
    }

    // 4. Sync progress (only if user has started)
    if (hasStarted && stats) {
      try {
        await this.updateProgress(deviceId, stats.days, stats.cigarettesAvoided, stats.moneySaved)
      } catch (e) {
        console.warn('progress sync failed:', e.message)
      }
    }
  },

  // ── Activity logging ───────────────────────────────────────────────────────
  async logActivity(deviceId, activity) {
    // No retry — fire and forget
    try {
      const response = await api.post(`/users/${deviceId}/activity`, { activity })
      return response.data
    } catch (e) {
      console.warn('activity log failed:', e.message)
    }
  },

  async getActivityStats(adminToken) {
    const response = await api.get('/admin/activities', {
      headers: { 'x-admin-token': adminToken },
    })
    return response.data
  },

  async getUserDailyLogsAdmin(deviceId, adminToken) {
    const response = await api.get(`/admin/users/${deviceId}/daily-logs`, {
      headers: { 'x-admin-token': adminToken },
    })
    return response.data
  },
}

export default api
