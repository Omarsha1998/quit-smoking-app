// composables/useDailyLog.js
// Handles daily smoke check-in logic, streaks, and totals.

import { ref, computed } from 'vue'
import dayjs from 'dayjs'

export function useDailyLog() {
  const dailyLogs   = ref([])   // [{ date: 'YYYY-MM-DD', smoked: bool }]
  const todayLogged = ref(false)
  const todaySmoked = ref(false)

  const todayDate = computed(() => dayjs().format('YYYY-MM-DD'))
  const todayDateLabel = computed(() => dayjs().format('dddd, MMMM D, YYYY'))

  function checkTodayLog() {
    const log = dailyLogs.value.find(l => l.date === todayDate.value)
    todayLogged.value = !!log
    todaySmoked.value = log ? log.smoked : false
  }

  function logDay(smoked) {
    // Replace any existing entry for today
    dailyLogs.value = dailyLogs.value.filter(l => l.date !== todayDate.value)
    dailyLogs.value.push({ date: todayDate.value, smoked })
    todayLogged.value = true
    todaySmoked.value = smoked
  }

  const currentStreak = computed(() => {
    let streak = 0
    for (let i = 0; i <= 365; i++) {
      const d   = dayjs().subtract(i, 'day').format('YYYY-MM-DD')
      const log = dailyLogs.value.find(l => l.date === d)
      if (d === todayDate.value && !todayLogged.value) { streak = 0; break }
      if (log && !log.smoked) streak++
      else if (log && log.smoked) break
      else if (!log && i > 0) break
    }
    return streak
  })

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