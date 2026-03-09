// composables/useStats.js
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
    // ── New fields for transparency ──
    totalDaysSinceQuit: 0,   // total calendar days since quit date
    smokedDaysCount: 0,      // days they logged smoking
    unloggedDays: 0,         // days between quit and today with no log
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
      stats.value = {
        days: 0, hours: 0, minutes: 0,
        cigarettesAvoided: 0, moneySaved: 0,
        lifeRegained: 0, healthBoost: 0,
        totalDaysSinceQuit: 0, smokedDaysCount: 0, unloggedDays: 0,
      }
      return
    }

    const totalMinutes       = Math.floor(diffMs / (1000 * 60))
    const totalHours         = Math.floor(diffMs / (1000 * 60 * 60))
    const totalDaysSinceQuit = now.diff(quitTime, 'day')

    const logs = dailyLogs?.value ?? []

    // ── Build a set of all dates that have been logged ───────────────────────
    const loggedDates = new Set(logs.map(l => l.date))

    // ── Count smoked days from logs ──────────────────────────────────────────
    const smokedDaysCount = logs.filter(l => l.smoked === true).length

    // ── Count unlogged days (assumed smoke-free) ─────────────────────────────
    // Loop through each day from quit date to yesterday
    // (today might not be logged yet — that's fine, still counts)
    let unloggedDays = 0
    for (let i = 0; i < totalDaysSinceQuit; i++) {
      const dateStr = quitTime.add(i, 'day').format('YYYY-MM-DD')
      if (!loggedDates.has(dateStr)) unloggedDays++
    }

    // ── Smoke-free days = total days - days they smoked ──────────────────────
    const smokeFreeDays = Math.max(0, totalDaysSinceQuit - smokedDaysCount)

    // ── Cigarettes avoided ───────────────────────────────────────────────────
    // Logged smoke-free days: full cigarettesPerDay avoided
    // Logged smoked days: max(0, cigarettesPerDay - smokedCount)
    // Unlogged days: assumed full cigarettesPerDay avoided
    const cigarettesAvoided = logs.reduce((sum, l) => {
      if (!l.smoked) return sum + Number(cigarettesPerDay.value)
      return sum + Math.max(0, Number(cigarettesPerDay.value) - (l.smokedCount || 0))
    }, 0) + (unloggedDays * Number(cigarettesPerDay.value))

    const moneySaved = (cigarettesAvoided / 20) * Number(pricePerPack.value)

    stats.value = {
      days:               smokeFreeDays,
      hours:              totalHours % 24,
      minutes:            totalMinutes % 60,
      cigarettesAvoided:  Math.floor(cigarettesAvoided),
      moneySaved,
      lifeRegained:       Math.floor(cigarettesAvoided) * 11,
      healthBoost:        smokeFreeDays < 30 ? Math.round((smokeFreeDays / 30) * 100) : 100,
      totalDaysSinceQuit,
      smokedDaysCount,
      unloggedDays,
    }
  }

  // ── Savings breakdown ──────────────────────────────────────────────────────
  const dailySavings   = computed(() => {
    if (!cigarettesPerDay.value || !pricePerPack.value) return 0
    return (Number(cigarettesPerDay.value) / 20) * Number(pricePerPack.value)
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