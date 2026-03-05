// composables/useDelayTimer.js
// 5-minute craving delay countdown logic.

import { ref, computed } from 'vue'

const TOTAL_SECONDS = 300

export function useDelayTimer() {
  const delayStarted     = ref(false)
  const delayDone        = ref(false)
  const delaySecondsLeft = ref(TOTAL_SECONDS)
  let   delayInterval    = null

  function reset() {
    if (delayInterval) clearInterval(delayInterval)
    delayStarted.value     = false
    delayDone.value        = false
    delaySecondsLeft.value = TOTAL_SECONDS
  }

  function start() {
    delayStarted.value = true
    delayInterval = setInterval(() => {
      delaySecondsLeft.value--
      if (delaySecondsLeft.value <= 0) {
        clearInterval(delayInterval)
        delayDone.value    = true
        delayStarted.value = false
      }
    }, 1000)
  }

  function stop() {
    if (delayInterval) clearInterval(delayInterval)
    delayStarted.value = false
  }

  const delayMinutes = computed(() => Math.floor(delaySecondsLeft.value / 60))
  const delaySeconds = computed(() => delaySecondsLeft.value % 60)
  const delayProgress = computed(() => 1 - (delaySecondsLeft.value / TOTAL_SECONDS))

  const delayMessage = computed(() => {
    if (!delayStarted.value)           return "Ready when you are."
    if (delaySecondsLeft.value > 240)  return "Just breathe. You've got this."
    if (delaySecondsLeft.value > 180)  return "Cravings peak at 3 minutes. Stay strong!"
    if (delaySecondsLeft.value > 120)  return "You're past the peak. Almost there!"
    if (delaySecondsLeft.value > 60)   return "Nearly done! The urge is fading."
    return "Last stretch — you're almost free!"
  })

  return {
    delayStarted, delayDone, delaySecondsLeft,
    delayMinutes, delaySeconds, delayProgress, delayMessage,
    startDelayTimer: start,
    stopDelayTimer:  stop,
    resetDelayTimer: reset,
  }
}