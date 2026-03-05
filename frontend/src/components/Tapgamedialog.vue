<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 320px; max-width: 440px">
      <q-card-section class="bg-deep-orange-6 text-white text-center">
        <div class="text-h6 text-weight-bold"><q-icon name="sports_esports" class="q-mr-sm" />Tap Challenge</div>
        <div class="text-caption">Tap as fast as you can for 60 seconds!</div>
      </q-card-section>

      <q-card-section class="text-center q-pa-lg">
        <!-- Pre-game -->
        <div v-if="!tapGameStarted && !tapGameDone">
          <q-icon name="touch_app" size="80px" color="deep-orange-4" class="q-mb-md" />
          <div class="text-body1 text-grey-7">Ready to beat your cravings with focus?</div>
        </div>

        <!-- In-game -->
        <div v-else-if="tapGameStarted && !tapGameDone">
          <div class="text-h1 text-weight-bold text-deep-orange-8 q-mb-sm">{{ tapCount }}</div>
          <div class="text-caption text-grey-6 q-mb-md">taps</div>
          <q-linear-progress :value="tapProgress" color="deep-orange-6" track-color="orange-1" rounded size="10px" class="q-mb-md" />
          <div class="text-h5 text-grey-7">{{ tapTimeLeft }}s left</div>
          <div class="tap-button q-mt-lg" @click="$emit('tap')" @touchstart.prevent="$emit('tap')">
            <q-btn round color="deep-orange-5" size="xl" icon="touch_app" class="tap-btn-animate" />
          </div>
        </div>

        <!-- Result -->
        <div v-else>
          <q-icon name="emoji_events" size="64px" color="deep-orange-5" />
          <div class="text-h4 text-weight-bold text-deep-orange-8 q-mt-sm">{{ tapCount }} taps!</div>
          <div class="text-body1 text-grey-7 q-mt-sm">{{ resultMessage }}</div>
          <div class="text-caption text-grey-6 q-mt-xs">Your craving is gone. You crushed it!</div>
        </div>
      </q-card-section>

      <q-card-actions align="center" class="q-pb-lg">
        <q-btn v-if="!tapGameStarted && !tapGameDone" @click="$emit('start')" color="deep-orange-6" label="Start!" unelevated size="lg" />
        <q-btn v-if="tapGameDone" @click="$emit('reset')" color="deep-orange-6" label="Play Again" unelevated />
        <q-btn flat label="Close" color="grey-6" @click="$emit('stop'); $emit('update:modelValue', false)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'TapGameDialog',

  props: {
    modelValue:   { type: Boolean, required: true },
    tapGameStarted:{ type: Boolean, required: true },
    tapGameDone:  { type: Boolean, required: true },
    tapCount:     { type: Number,  required: true },
    tapTimeLeft:  { type: Number,  required: true },
    tapProgress:  { type: Number,  required: true },
    resultMessage:{ type: String,  required: true },
  },

  emits: ['update:modelValue', 'start', 'stop', 'reset', 'tap'],
}
</script>