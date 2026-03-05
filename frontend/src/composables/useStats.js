// composables/useStats.js
// Encapsulates all smoke-free statistics calculation logic.
// Used by the main dashboard and admin views.

import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { DISEASE_RISK_MILESTONES } from '../constants/content'

export function useStats(quitDate, cigarettesPerDay, pricePerPack, dailyLogs) {
  const stats = ref({
    days: 0,
    hours: 0,
    minutes: 0,
    cigarettesAvoided: 0,
    moneySaved: 0,
    lifeRegained: 0,
    healthBoost: 0,
  })

  function calculate() {
    if (!quitDate.value || !cigarettesPerDay.value || !pricePerPack.value) return

    const quitDateStr = quitDate.value.endsWith('Z')
      ? quitDate.value.slice(0, -1)
      : quitDate.value

    const quitTime = dayjs(quitDateStr)
    const now      = dayjs()
    const diffMs   = now.diff(quitTime)

    if (diffMs < 0) {
      stats.value = { days: 0, hours: 0, minutes: 0, cigarettesAvoided: 0, moneySaved: 0, lifeRegained: 0, healthBoost: 0 }
      return
    }

    const totalMinutes = Math.floor(diffMs / (1000 * 60))
    const totalHours   = Math.floor(diffMs / (1000 * 60 * 60))

    // ── Days smoke-free: count only logged days where smoked === false ──────
    // Falls back to calendar days if the user hasn't logged yet.
    const logs = dailyLogs?.value ?? []
    const smokeFreeDays = logs.length > 0
      ? logs.filter(l => l.smoked === false).length
      : Math.floor(diffMs / (1000 * 60 * 60 * 24))

    // Cigarettes avoided is based on actual smoke-free days (not calendar days)
    const cigarettesAvoided = Math.floor(smokeFreeDays * cigarettesPerDay.value)
    const moneySaved        = (cigarettesAvoided / 20) * pricePerPack.value

    stats.value = {
      days:              smokeFreeDays,
      hours:             totalHours % 24,
      minutes:           totalMinutes % 60,
      cigarettesAvoided,
      moneySaved,
      lifeRegained:      cigarettesAvoided * 11,
      healthBoost:       smokeFreeDays < 30 ? Math.round((smokeFreeDays / 30) * 100) : 100,
    }
  }

  // ── Savings breakdown ──────────────────────────────────────────────────────
  const dailySavings   = computed(() => {
    if (!cigarettesPerDay.value || !pricePerPack.value) return 0
    return (cigarettesPerDay.value / 20) * pricePerPack.value
  })
  const weeklySavings  = computed(() => dailySavings.value * 7)
  const monthlySavings = computed(() => dailySavings.value * 30)

  // ── Disease risk milestones ────────────────────────────────────────────────
  const diseaseRiskMilestones = computed(() =>
    DISEASE_RISK_MILESTONES.map(m => ({
      ...m,
      daysDone: Math.min(stats.value.days, m.target),
      daysLeft: Math.max(m.target - stats.value.days, 0),
      progress: Math.min(stats.value.days / m.target, 1),
    }))
  )

  return {
    stats,
    calculate,
    dailySavings,
    weeklySavings,
    monthlySavings,
    diseaseRiskMilestones,
  }
}