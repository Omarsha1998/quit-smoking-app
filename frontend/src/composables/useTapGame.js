// composables/useTapGame.js
// 60-second tap challenge mini-game logic.

import { ref, computed } from 'vue'

const GAME_DURATION   = 60
const HITS_TO_DESTROY = 60  // ← taps needed to destroy the cigarette

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
        tapInterval          = null
        tapGameDone.value    = true
        tapGameStarted.value = false
      }
    }, 1000)
  }

  function registerTap() {
    if (!tapGameStarted.value || tapGameDone.value) return  // ← guard
    if (tapCount.value >= HITS_TO_DESTROY) return           // ← cap taps

    tapCount.value++

    // End game early if cigarette is fully destroyed
    if (tapCount.value >= HITS_TO_DESTROY) {
      if (tapInterval) { clearInterval(tapInterval); tapInterval = null }
      tapGameDone.value    = true
      tapGameStarted.value = false
    }
  }

  function stop() {
    if (tapInterval) clearInterval(tapInterval)
    tapGameStarted.value = false
  }

  const tapProgress = computed(() => 1 - (tapTimeLeft.value / GAME_DURATION))

  const tapResultMessage = computed(() => {
    if (tapCount.value >= HITS_TO_DESTROY) return '🔥 You destroyed it! Craving crushed!'
    if (tapCount.value > 40)               return '💪 So close! Nearly destroyed!'
    if (tapCount.value > 20)               return '👍 Nice try! Play again!'
    return '😤 Keep tapping next time!'
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