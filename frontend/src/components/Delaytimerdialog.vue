<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 320px; max-width: 440px">
      <q-card-section class="bg-purple-6 text-white text-center">
        <div class="text-h6 text-weight-bold"><q-icon name="timer" class="q-mr-sm" />Delay the Urge — 5 Minutes</div>
        <div class="text-caption">Cravings peak at 3 mins. You can outlast it!</div>
      </q-card-section>

      <q-card-section class="text-center q-pa-xl">
        <div class="delay-timer-display text-h1 text-weight-bold text-purple-8 q-mb-md">
          {{ delayMinutes }}:{{ String(delaySeconds).padStart(2, '0') }}
        </div>
        <q-linear-progress :value="delayProgress" color="purple-6" track-color="purple-1" rounded size="12px" />
        <div class="text-body1 text-grey-7 q-mt-md">{{ delayMessage }}</div>
      </q-card-section>

      <q-card-section v-if="delayDone" class="text-center q-pt-none">
        <q-icon name="celebration" color="purple-6" size="48px" />
        <div class="text-h6 text-purple-8 q-mt-sm">You did it! The urge has passed. 🎉</div>
      </q-card-section>

      <q-card-actions align="center" class="q-pb-lg">
        <q-btn v-if="!delayStarted && !delayDone" @click="$emit('start')" color="purple-6" label="Start Timer" unelevated size="lg" />
        <q-btn v-if="delayDone" @click="$emit('update:modelValue', false)" color="purple-6" label="Close" unelevated size="lg" />
        <q-btn flat label="Cancel" color="grey-6" @click="$emit('stop'); $emit('update:modelValue', false)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'DelayTimerDialog',

  props: {
    modelValue:   { type: Boolean, required: true },
    delayStarted: { type: Boolean, required: true },
    delayDone:    { type: Boolean, required: true },
    delayMinutes: { type: Number,  required: true },
    delaySeconds: { type: Number,  required: true },
    delayProgress:{ type: Number,  required: true },
    delayMessage: { type: String,  required: true },
  },

  emits: ['update:modelValue', 'start', 'stop'],
}
</script>