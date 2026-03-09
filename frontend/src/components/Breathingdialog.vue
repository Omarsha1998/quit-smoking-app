<!-- BreathingDialog.vue -->
<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 320px; max-width: 440px; border-radius: 20px; overflow: hidden; border: 1.5px solid #b8d4b0;">

      <!-- Header — Light Sage Green -->
      <q-card-section style="background: linear-gradient(135deg, #7eab7e 0%, #5d9460 100%);" class="text-white text-center">
        <div class="text-h6 text-weight-bold" style="letter-spacing: 0.5px;">
          <q-icon name="air" class="q-mr-sm" />2-Minute Breathing
        </div>
        <div class="text-caption" style="opacity: 0.85;">Focus on your breath. Cravings pass.</div>
      </q-card-section>

      <!-- Breathing circle -->
      <q-card-section class="text-center q-pa-xl" style="background: #f5ead8;">
        <div class="breathing-circle-wrapper q-mb-lg">
          <div class="breathing-circle" :class="breathPhase" :style="mergedCircleStyle">
            <div class="text-h6 text-white text-weight-bold" style="letter-spacing: 1px;">{{ breathLabel }}</div>
          </div>
        </div>

        <div class="text-h4 text-weight-bold q-mb-xs" style="color: #5d9460;">{{ breathCountdown }}s</div>
        <div class="text-caption q-mb-sm" style="color: #9aaa90;">{{ breathPhaseFull }}</div>

        <q-linear-progress
          :value="breathProgress"
          rounded
          size="10px"
          class="q-mt-md"
          style="background: #d6efd6;"
          color="green-6"
        />

        <div class="text-caption q-mt-sm" style="color: #9aaa90;">
          {{ breathCyclesDone }} / {{ breathTotalCycles }} cycles complete
        </div>
      </q-card-section>

      <!-- Done state -->
      <q-card-section v-if="breathingDone" class="text-center q-pt-none" style="background: #f5ead8;">
        <!-- Dusty rose check for celebration -->
        <q-icon name="check_circle" size="48px" style="color: #c97a8a;" />
        <div class="text-h6 q-mt-sm" style="color: #5d9460;">Well done! You survived the craving. 💪</div>
      </q-card-section>

      <!-- Actions — Warm Beige -->
      <q-card-actions align="center" class="q-pb-lg" style="background: #ede0c4; border-top: 1px solid #d4c4a0; gap: 12px;">
        <q-btn
          v-if="!breathingStarted && !breathingDone"
          @click="$emit('start')"
          unelevated
          label="Start"
          size="lg"
          style="background: linear-gradient(135deg, #7eab7e, #5d9460); color: white; border-radius: 12px; padding: 8px 36px; font-weight: 600;"
        />
        <q-btn
          v-if="breathingDone"
          @click="$emit('update:modelValue', false)"
          unelevated
          label="Close"
          size="lg"
          style="background: linear-gradient(135deg, #7eab7e, #5d9460); color: white; border-radius: 12px; padding: 8px 36px; font-weight: 600;"
        />
        <q-btn
          flat
          label="Cancel"
          v-close-popup
          @click="$emit('stop')"
          style="color: #9aaa90; font-weight: 500;"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'BreathingDialog',

  props: {
    modelValue:       { type: Boolean, required: true },
    breathingStarted: { type: Boolean, required: true },
    breathingDone:    { type: Boolean, required: true },
    breathPhase:      { type: String,  required: true },
    breathCountdown:  { type: Number,  required: true },
    breathCyclesDone: { type: Number,  required: true },
    breathTotalCycles:{ type: Number,  required: true },
    breathLabel:      { type: String,  required: true },
    breathPhaseFull:  { type: String,  required: true },
    circleStyle:      { type: Object,  required: true },
    breathProgress:   { type: Number,  required: true },
  },

  emits: ['update:modelValue', 'start', 'stop'],

  computed: {
    mergedCircleStyle() {
      return {
        ...this.circleStyle,
        background: this.circleStyle?.background
          ? this.circleStyle.background
              .replace(/#00bcd4/gi, '#7eab7e')
              .replace(/#009688/gi, '#5d9460')
              .replace(/teal/gi, '#7eab7e')
          : 'radial-gradient(circle, #7eab7e 0%, #5d9460 100%)',
        boxShadow: '0 0 40px rgba(126,171,126,0.35)',
      }
    },
  },
}
</script>

<style scoped>
.breathing-circle-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.breathing-circle {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, #8ec08e 0%, #5d9460 100%);
  box-shadow: 0 0 40px rgba(126, 171, 126, 0.35);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  border: 3px solid rgba(255,255,255,0.25);
}

.breathing-circle.inhale {
  transform: scale(1.18);
  box-shadow: 0 0 60px rgba(126, 171, 126, 0.5);
}

.breathing-circle.hold {
  transform: scale(1.18);
  /* Dusty rose glow on hold — a moment of stillness with warmth */
  box-shadow: 0 0 50px rgba(201, 122, 138, 0.35);
}

.breathing-circle.exhale {
  transform: scale(0.9);
  box-shadow: 0 0 20px rgba(126, 171, 126, 0.2);
}
</style>