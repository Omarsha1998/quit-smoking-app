<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 320px; max-width: 440px; border-radius: 20px; overflow: hidden; border: 1.5px solid #e8aab8;">

      <!-- Header -->
      <q-card-section style="background: linear-gradient(135deg, #c97a8a 0%, #a85c6e 100%);" class="text-white text-center">
        <div class="text-h6 text-weight-bold" style="letter-spacing: 0.5px;">
          <q-icon name="sports_esports" class="q-mr-sm" />Destroy the Cigarette!
        </div>
        <div class="text-caption" style="opacity: 0.85;">Tap it to pieces before 60 seconds!</div>
      </q-card-section>

      <q-card-section class="text-center q-pa-lg" style="background: #f5ead8; min-height: 260px; display: flex; flex-direction: column; align-items: center; justify-content: center;">

        <!-- Pre-game -->
        <div v-if="!tapGameStarted && !tapGameDone" style="width: 100%;">
          <div style="font-size: 90px; line-height: 1; height: 100px; display: flex; align-items: center; justify-content: center;">🚬</div>
          <div class="text-body1 q-mt-md" style="color: #7a6040;">Tap the cigarette to destroy your craving!</div>
        </div>

        <!-- In-game -->
        <div v-else-if="tapGameStarted && !tapGameDone" style="width: 100%;">

          <!-- Fixed-size container — ONLY the emoji animates, dialog never resizes -->
          <div
            style="height: 110px; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; user-select: none;"
            @click="$emit('tap')"
            @touchstart.prevent="$emit('tap')"
          >
            <div
              :style="{
                fontSize: '90px',
                lineHeight: 1,
                filter: cigFilter,
                transform: 'rotate(' + cigRotation + 'deg)',
                transition: 'filter 0.2s, transform 0.1s',
                position: 'absolute',
              }"
            >{{ cigEmoji }}</div>

            <!-- Damage particles absolutely positioned so they never push layout -->
            <div v-if="destructionLevel >= 1" style="position: absolute; inset: 0; pointer-events: none; font-size: 28px;">
              <span v-if="destructionLevel >= 1" style="position: absolute; top: 5%; left: 5%;">💨</span>
              <span v-if="destructionLevel >= 2" style="position: absolute; top: 5%; right: 5%;">✨</span>
              <span v-if="destructionLevel >= 3" style="position: absolute; bottom: 5%; left: 5%;">💥</span>
              <span v-if="destructionLevel >= 4" style="position: absolute; bottom: 5%; right: 5%;">🔥</span>
            </div>
          </div>

          <!-- Health bar -->
          <div class="text-caption q-mb-xs q-mt-sm" style="color: #a85c6e; font-weight: 600;">Cigarette HP</div>
          <q-linear-progress
            :value="cigHpPercent"
            rounded
            size="14px"
            class="q-mb-md"
            :style="{ background: '#fce8ee' }"
            :color="cigHpColor"
          />

          <div class="text-h4 text-weight-bold" style="color: #a85c6e;">
            {{ tapCount }} <span style="font-size:16px; color:#9aaa90;">/ 60 hits</span>
          </div>
          <div class="text-h6 q-mt-xs" style="color: #7a6040;">{{ tapTimeLeft }}s left</div>
        </div>

        <!-- Result — positive emojis only! -->
        <div v-else style="width: 100%;">
          <div style="font-size: 64px; height: 80px; display: flex; align-items: center; justify-content: center;">
            {{ tapCount >= hitsToDestroy ? '🎉' : '💪' }}
          </div>
          <div class="text-h4 text-weight-bold q-mt-sm" style="color: #a85c6e;">
            {{ tapCount >= hitsToDestroy ? 'Destroyed!' : tapCount + ' hits!' }}
          </div>
          <div class="text-body1 q-mt-sm" style="color: #7a6040;">{{ resultMessage }}</div>
          <div class="text-caption q-mt-xs" style="color: #9aaa90;">Your craving is gone. You crushed it! 🌿</div>
        </div>

      </q-card-section>

      <!-- Actions -->
      <q-card-actions align="center" class="q-pb-lg" style="background: #ede0c4; border-top: 1px solid #d4c4a0; gap: 12px;">
        <q-btn
          v-if="!tapGameStarted && !tapGameDone"
          @click="$emit('start')"
          unelevated label="Destroy It!" size="lg"
          style="background: linear-gradient(135deg, #c97a8a, #a85c6e); color: white; border-radius: 12px; padding: 8px 36px; font-weight: 600;"
        />
        <q-btn
          v-if="tapGameDone"
          @click="$emit('reset')"
          unelevated label="Play Again"
          style="background: linear-gradient(135deg, #c97a8a, #a85c6e); color: white; border-radius: 10px; padding: 6px 24px; font-weight: 600;"
        />
        <q-btn
          flat label="Close"
          style="color: #9aaa90; font-weight: 500;"
          @click="$emit('stop'); $emit('update:modelValue', false)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'TapGameDialog',

  props: {
    modelValue:     { type: Boolean, required: true },
    tapGameStarted: { type: Boolean, required: true },
    tapGameDone:    { type: Boolean, required: true },
    tapCount:       { type: Number,  required: true },
    tapTimeLeft:    { type: Number,  required: true },
    tapProgress:    { type: Number,  required: true },
    resultMessage:  { type: String,  required: true },
    hitsToDestroy:  { type: Number,  default: 60 },
  },

  emits: ['update:modelValue', 'start', 'stop', 'reset', 'tap'],

  computed: {
    destructionLevel () {
      const pct = Math.min(this.tapCount / this.hitsToDestroy, 1)
      return Math.floor(pct * 5)
    },

    cigEmoji () {
      // Positive stages only — cigarette fades away, no skull!
      const stages = ['🚬', '🚬', '🚬', '💨', '✨']
      return stages[Math.min(this.destructionLevel, 4)]
    },

    cigFilter () {
      const pct = Math.min(this.tapCount / this.hitsToDestroy, 1)
      return `blur(${pct * 2}px) saturate(${Math.max(0, 1 - pct * 0.7)})`
    },

    cigRotation () {
      return (this.tapCount % 2 === 0 ? 1 : -1) * this.destructionLevel * 8
    },

    cigHpPercent () {
      return Math.max(0, 1 - this.tapCount / this.hitsToDestroy)
    },

    cigHpColor () {
      if (this.cigHpPercent > 0.6) return 'green-5'
      if (this.cigHpPercent > 0.3) return 'orange-5'
      return 'red-5'
    },
  },
}
</script>