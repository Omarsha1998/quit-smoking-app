<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 320px; max-width: 440px">
      <q-card-section class="bg-teal-6 text-white text-center">
        <div class="text-h6 text-weight-bold"><q-icon name="air" class="q-mr-sm" />2-Minute Breathing</div>
        <div class="text-caption">Focus on your breath. Cravings pass.</div>
      </q-card-section>

      <q-card-section class="text-center q-pa-xl">
        <div class="breathing-circle-wrapper q-mb-lg">
          <div class="breathing-circle" :class="breathPhase" :style="circleStyle">
            <div class="text-h6 text-white text-weight-bold">{{ breathLabel }}</div>
          </div>
        </div>
        <div class="text-h4 text-weight-bold text-teal-8 q-mb-xs">{{ breathCountdown }}s</div>
        <div class="text-caption text-grey-6">{{ breathPhaseFull }}</div>
        <q-linear-progress :value="breathProgress" color="teal-6" track-color="teal-1" rounded size="8px" class="q-mt-md" />
        <div class="text-caption text-grey-6 q-mt-sm">{{ breathCyclesDone }} / {{ breathTotalCycles }} cycles complete</div>
      </q-card-section>

      <q-card-section v-if="breathingDone" class="text-center q-pt-none">
        <q-icon name="check_circle" color="teal-6" size="48px" />
        <div class="text-h6 text-teal-8 q-mt-sm">Well done! You survived the craving. 💪</div>
      </q-card-section>

      <q-card-actions align="center" class="q-pb-lg">
        <q-btn v-if="!breathingStarted && !breathingDone" @click="$emit('start')" color="teal-6" label="Start" unelevated size="lg" />
        <q-btn v-if="breathingDone" @click="$emit('update:modelValue', false)" color="teal-6" label="Close" unelevated size="lg" />
        <q-btn flat label="Cancel" color="grey-6" v-close-popup @click="$emit('stop')" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'BreathingDialog',

  props: {
    modelValue:      { type: Boolean, required: true },
    breathingStarted:{ type: Boolean, required: true },
    breathingDone:   { type: Boolean, required: true },
    breathPhase:     { type: String,  required: true },
    breathCountdown: { type: Number,  required: true },
    breathCyclesDone:{ type: Number,  required: true },
    breathTotalCycles:{ type: Number, required: true },
    breathLabel:     { type: String,  required: true },
    breathPhaseFull: { type: String,  required: true },
    circleStyle:     { type: Object,  required: true },
    breathProgress:  { type: Number,  required: true },
  },

  emits: ['update:modelValue', 'start', 'stop'],
}
</script>