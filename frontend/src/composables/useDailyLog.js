// composables/useDailyLog.js
// Handles daily smoke check-in logic, streaks, and totals.

import { ref, computed } from 'vue'
import dayjs from 'dayjs'

export function useDailyLog() {
  const dailyLogs   = ref([])   // [{ date: 'YYYY-MM-DD', smoked: bool, smokedCount: number }]
  const todayLogged = ref(false)
  const todaySmoked = ref(false)

  const todayDate      = computed(() => dayjs().format('YYYY-MM-DD'))
  const todayDateLabel = computed(() => dayjs().format('dddd, MMMM D, YYYY'))

  function checkTodayLog() {
    const log = dailyLogs.value.find(l => l.date === todayDate.value)
    todayLogged.value = !!log
    todaySmoked.value = log ? log.smoked : false
  }

  // ── logDay now also stores smokedCount ────────────────────────────────────
  // smokedCount = 0 for smoke-free days, or the number smoked on bad days
  function logDay(smoked, smokedCount = 0) {
    // Replace any existing entry for today
    dailyLogs.value = dailyLogs.value.filter(l => l.date !== todayDate.value)
    dailyLogs.value.push({
      date:        todayDate.value,
      smoked:      smoked,
      smokedCount: smoked ? (smokedCount || 0) : 0,
    })
    todayLogged.value = true
    todaySmoked.value = smoked
  }

  // ── Current streak: consecutive smoke-free days up to today ───────────────
  const currentStreak = computed(() => {
    let streak = 0
    for (let i = 0; i <= 365; i++) {
      const d   = dayjs().subtract(i, 'day').format('YYYY-MM-DD')
      const log = dailyLogs.value.find(l => l.date === d)

      // Today not yet logged → streak is 0
      if (d === todayDate.value && !todayLogged.value) { streak = 0; break }

      if (log && !log.smoked) {
        streak++
      } else if (log && log.smoked) {
        // Smoked day breaks the streak
        break
      } else if (!log && i > 0) {
        // Gap in logs — streak ends
        break
      }
    }
    return streak
  })

  // ── Total smoke-free days ever logged ─────────────────────────────────────
  const totalSmokeFreedays = computed(() =>
    dailyLogs.value.filter(l => !l.smoked).length
  )

  return {
    dailyLogs,
    todayLogged,
    todaySmoked,
    todayDateLabel,
    checkTodayLog,
    logDay,
    currentStreak,
    totalSmokeFreedays,
  }
}