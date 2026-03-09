<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 320px; max-width: 440px; border-radius: 20px; overflow: hidden; border: 1.5px solid #ddc8a8;">

      <!-- Header — Honey Beige (warm, grounding) -->
      <q-card-section style="background: linear-gradient(135deg, #c8a870 0%, #a87840 100%);" class="text-white text-center">
        <div class="text-h6 text-weight-bold" style="letter-spacing: 0.5px;">
          <q-icon name="timer" class="q-mr-sm" />Delay the Urge — 5 Minutes
        </div>
        <div class="text-caption" style="opacity: 0.85;">Cravings peak at 3 mins. You can outlast it!</div>
      </q-card-section>

      <!-- Timer body — Warm Beige -->
      <q-card-section class="text-center q-pa-xl" style="background: #f5ead8;">
        <div class="text-h1 text-weight-bold q-mb-md" style="color: #a87840; letter-spacing: 2px;">
          {{ delayMinutes }}:{{ String(delaySeconds).padStart(2, '0') }}
        </div>
        <q-linear-progress
          :value="delayProgress"
          rounded
          size="12px"
          style="background: #ede0c4;"
          color="amber-8"
        />
        <div class="text-body1 q-mt-md" style="color: #7a6040;">{{ delayMessage }}</div>
      </q-card-section>

      <!-- Done state — Dusty Rose celebration -->
      <q-card-section v-if="delayDone" class="text-center q-pt-none" style="background: #f5ead8;">
        <q-icon name="celebration" size="48px" style="color: #c97a8a;" />
        <div class="text-h6 q-mt-sm" style="color: #5d9460;">You did it! The urge has passed. 🎉</div>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions align="center" class="q-pb-lg" style="background: #ede0c4; border-top: 1px solid #d4c4a0; gap: 12px;">
        <q-btn
          v-if="!delayStarted && !delayDone"
          @click="$emit('start')"
          unelevated
          label="Start Timer"
          size="lg"
          style="background: linear-gradient(135deg, #c8a870, #a87840); color: white; border-radius: 12px; padding: 8px 36px; font-weight: 600;"
        />
        <q-btn
          v-if="delayDone"
          @click="$emit('update:modelValue', false)"
          unelevated
          label="Close"
          size="lg"
          style="background: linear-gradient(135deg, #7eab7e, #5d9460); color: white; border-radius: 12px; padding: 8px 36px; font-weight: 600;"
        />
        <q-btn
          flat
          label="Cancel"
          style="color: #9aaa90; font-weight: 500;"
          @click="$emit('stop'); $emit('update:modelValue', false)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'DelayTimerDialog',

  props: {
    modelValue:    { type: Boolean, required: true },
    delayStarted:  { type: Boolean, required: true },
    delayDone:     { type: Boolean, required: true },
    delayMinutes:  { type: Number,  required: true },
    delaySeconds:  { type: Number,  required: true },
    delayProgress: { type: Number,  required: true },
    delayMessage:  { type: String,  required: true },
  },

  emits: ['update:modelValue', 'start', 'stop'],
}
</script>