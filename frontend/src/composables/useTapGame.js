// composables/useTapGame.js
// 60-second tap challenge mini-game logic.

import { ref, computed } from 'vue'

const GAME_DURATION = 60

export function useTapGame() {
  const tapGameStarted = ref(false)
  const tapGameDone    = ref(false)
  const tapCount       = ref(0)
  const tapTimeLeft    = ref(GAME_DURATION)
  let   tapInterval    = null

  function reset() {
    if (tapInterval) clearInterval(tapInterval)
    tapGameStarted.value = false
    tapGameDone.value    = false
    tapCount.value       = 0
    tapTimeLeft.value    = GAME_DURATION
  }

  function start() {
    tapGameStarted.value = true
    tapCount.value       = 0
    tapTimeLeft.value    = GAME_DURATION
    tapInterval = setInterval(() => {
      tapTimeLeft.value--
      if (tapTimeLeft.value <= 0) {
        clearInterval(tapInterval)
        tapGameDone.value    = true
        tapGameStarted.value = false
      }
    }, 1000)
  }

  function registerTap() {
    if (tapGameStarted.value) tapCount.value++
  }

  function stop() {
    if (tapInterval) clearInterval(tapInterval)
    tapGameStarted.value = false
  }

  const tapProgress = computed(() => 1 - (tapTimeLeft.value / GAME_DURATION))

  const tapResultMessage = computed(() => {
    if (tapCount.value > 80) return '🔥 Incredible focus!'
    if (tapCount.value > 50) return '💪 Great job!'
    return '👍 Nice try!'
  })

  return {
    tapGameStarted, tapGameDone, tapCount, tapTimeLeft,
    tapProgress, tapResultMessage,
    startTapGame:  start,
    stopTapGame:   stop,
    resetTapGame:  reset,
    registerTap,
  }
}