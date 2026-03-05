// composables/useBreathing.js
// Encapsulates the 2-minute 4-4-6 breathing exercise state machine.

import { ref, computed } from 'vue'

const PHASES = [
  { phase: 'inhale',  duration: 4 },
  { phase: 'hold',    duration: 4 },
  { phase: 'exhale',  duration: 6 },
]
const TOTAL_CYCLES = 6

export function useBreathing() {
  const breathingStarted  = ref(false)
  const breathingDone     = ref(false)
  const breathPhase       = ref('inhale')
  const breathCountdown   = ref(4)
  const breathCyclesDone  = ref(0)
  let   breathInterval    = null

  function reset() {
    if (breathInterval) clearInterval(breathInterval)
    breathingStarted.value = false
    breathingDone.value    = false
    breathPhase.value      = 'inhale'
    breathCountdown.value  = 4
    breathCyclesDone.value = 0
  }

  function start() {
    breathingStarted.value = true
    let phaseIdx  = 0
    let countdown = PHASES[phaseIdx].duration

    breathPhase.value     = PHASES[phaseIdx].phase
    breathCountdown.value = countdown

    if (breathInterval) clearInterval(breathInterval)
    breathInterval = setInterval(() => {
      countdown--
      breathCountdown.value = countdown

      if (countdown <= 0) {
        phaseIdx++
        if (phaseIdx >= PHASES.length) {
          phaseIdx = 0
          breathCyclesDone.value++
          if (breathCyclesDone.value >= TOTAL_CYCLES) {
            clearInterval(breathInterval)
            breathingDone.value    = true
            breathingStarted.value = false
            return
          }
        }
        countdown             = PHASES[phaseIdx].duration
        breathPhase.value     = PHASES[phaseIdx].phase
        breathCountdown.value = countdown
      }
    }, 1000)
  }

  function stop() {
    if (breathInterval) clearInterval(breathInterval)
    breathingStarted.value = false
  }

  // ── Computed display helpers ───────────────────────────────────────────────
  const breathLabel = computed(() =>
    ({ inhale: 'Inhale', hold: 'Hold', exhale: 'Exhale' }[breathPhase.value])
  )
  const breathPhaseFull = computed(() => ({
    inhale: 'Breathe in slowly through your nose',
    hold:   'Hold your breath gently',
    exhale: 'Breathe out slowly through your mouth',
  }[breathPhase.value]))

  const breathCircleStyle = computed(() => {
    const size = breathPhase.value === 'exhale' ? '100px' : '150px'
    return { width: size, height: size }
  })

  const breathProgress = computed(() => breathCyclesDone.value / TOTAL_CYCLES)

  return {
    breathingStarted, breathingDone, breathPhase,
    breathCountdown,  breathCyclesDone,
    breathTotalCycles: TOTAL_CYCLES,
    breathLabel, breathPhaseFull, breathCircleStyle, breathProgress,
    startBreathing: start,
    stopBreathing:  stop,
    resetBreathing: reset,
  }
}