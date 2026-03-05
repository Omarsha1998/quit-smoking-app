// composables/useSync.js
// Handles online/offline sync, queue processing, and background sync setup.

import { ref } from 'vue'
import { LocalStorage } from 'quasar'
import { userAPI } from '../services/api'

export function useSync() {
  const isOnline  = ref(navigator.onLine)
  const syncQueue = ref([])

  // ── Online / offline listeners ─────────────────────────────────────────────
  function handleOnline()  { isOnline.value = true  }
  function handleOffline() { isOnline.value = false }

  function addToSyncQueue(type, payload) {
    // For daily_log entries, deduplicate by deviceId + date (not just type)
    const alreadyQueued = syncQueue.value.some(s => {
      if (type === 'daily_log') {
        return s.type === 'daily_log' && s.deviceId === payload.deviceId && s.date === payload.date
      }
      return s.type === type && s.deviceId === payload.deviceId
    })
    if (!alreadyQueued) {
      syncQueue.value.push({ type, ...payload, timestamp: new Date().toISOString() })
    }
  }

  // ── Individual sync helpers ────────────────────────────────────────────────
  async function syncRegistration(deviceId, userName) {
    if (!isOnline.value || !deviceId || !userName) return false
    try {
      const res = await userAPI.register(deviceId, userName)
      if (res?.success) {
        syncQueue.value = syncQueue.value.filter(
          s => !(s.type === 'register' && s.deviceId === deviceId)
        )
        return true
      }
    } catch (error) {
      console.error(error)
      addToSyncQueue('register', { deviceId, userName })
    }
    return false
  }

  async function syncTrackingStart(deviceId, userName, quitDate, cigarettesPerDay, pricePerPack) {
    if (!isOnline.value || !deviceId || !quitDate) return false
    try {
      const res = await userAPI.startTracking(deviceId, userName, quitDate, cigarettesPerDay, pricePerPack)
      if (res?.success) {
        syncQueue.value = syncQueue.value.filter(
          s => !(s.type === 'start_tracking' && s.deviceId === deviceId)
        )
        return true
      }
    } catch (error) {
      console.error(error)
      addToSyncQueue('start_tracking', { deviceId, userName, quitDate, cigarettesPerDay, pricePerPack })
    }
    return false
  }

  async function syncProgress(deviceId, days, cigarettesAvoided, moneySaved) {
    if (!isOnline.value || !deviceId) return false
    try {
      const res = await userAPI.updateProgress(deviceId, days, cigarettesAvoided, parseFloat(moneySaved.toFixed(2)))
      if (res?.success) {
        syncQueue.value = syncQueue.value.filter(s => !(s.deviceId === deviceId && !s.type))
        return true
      }
    } catch (error) {
      console.error(error)
      syncQueue.value = syncQueue.value.filter(s => !(s.deviceId === deviceId && !s.type))
      syncQueue.value.push({ deviceId, days, cigarettesAvoided, moneySaved: parseFloat(moneySaved.toFixed(2)), timestamp: new Date().toISOString() })
    }
    return false
  }

  async function recordAppOpen(deviceId) {
    if (!deviceId) return
    try { await userAPI.recordAppOpen(deviceId, isOnline.value) } catch (error) { console.error(error) }
  }

  // ── Process offline queue ──────────────────────────────────────────────────
  async function processSyncQueue() {
    if (!syncQueue.value.length || !isOnline.value) return

    // Deduplicate: keep latest entry per key
    // daily_log uses deviceId + date so multiple offline days all sync correctly
    const latestMap = {}
    ;[...syncQueue.value]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .forEach(item => {
        const key = item.type === 'daily_log'
          ? `${item.deviceId}_daily_log_${item.date}`
          : `${item.deviceId}_${item.type || 'progress'}`
        latestMap[key] = item
      })

    const failed = []
    for (const item of Object.values(latestMap)) {
      try {
        if (item.type === 'register') {
          await userAPI.register(item.deviceId, item.userName)
        } else if (item.type === 'start_tracking') {
          await userAPI.startTracking(item.deviceId, item.userName, item.quitDate, item.cigarettesPerDay, item.pricePerPack)
        } else if (item.type === 'daily_log') {
          // ── Pass smokedCount through so offline logs are accurate ──────────
          await userAPI.logDailyEntry(item.deviceId, item.date, item.smoked, item.smokedCount || 0)
        } else {
          await userAPI.updateProgress(item.deviceId, item.days, item.cigarettesAvoided, item.moneySaved)
        }
      } catch (error) {
        console.error(error)
        failed.push(item)
      }
    }
    syncQueue.value = failed
  }

  // ── Background / lifecycle sync hooks ─────────────────────────────────────
  function setupBackgroundSync(onResume) {
    document.addEventListener('visibilitychange', async () => {
      if (!document.hidden && isOnline.value) await onResume()
    })
    window.addEventListener('focus', async () => {
      if (isOnline.value) await onResume()
    })
  }

  // ── Persist queue ──────────────────────────────────────────────────────────
  function saveSyncQueue() {
    LocalStorage.set('quit-smoking-sync-queue', syncQueue.value)
  }

  function loadSyncQueue() {
    const saved = LocalStorage.getItem('quit-smoking-sync-queue')
    if (saved && Array.isArray(saved)) syncQueue.value = saved
  }

  return {
    isOnline,
    syncQueue,
    handleOnline,
    handleOffline,
    addToSyncQueue,
    syncRegistration,
    syncTrackingStart,
    syncProgress,
    recordAppOpen,
    processSyncQueue,
    setupBackgroundSync,
    saveSyncQueue,
    loadSyncQueue,
  }
}