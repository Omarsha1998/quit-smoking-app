<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 320px; max-width: 440px; border-radius: 20px; overflow: hidden; border: 1.5px solid #e8aab8;">

      <!-- Header — Dusty Rose (energetic, playful) -->
      <q-card-section style="background: linear-gradient(135deg, #c97a8a 0%, #a85c6e 100%);" class="text-white text-center">
        <div class="text-h6 text-weight-bold" style="letter-spacing: 0.5px;">
          <q-icon name="sports_esports" class="q-mr-sm" />Tap Challenge
        </div>
        <div class="text-caption" style="opacity: 0.85;">Tap as fast as you can for 60 seconds!</div>
      </q-card-section>

      <q-card-section class="text-center q-pa-lg" style="background: #f5ead8;">

        <!-- Pre-game -->
        <div v-if="!tapGameStarted && !tapGameDone">
          <q-icon name="touch_app" size="80px" class="q-mb-md" style="color: #e8aab8;" />
          <div class="text-body1" style="color: #7a6040;">Ready to beat your cravings with focus?</div>
        </div>

        <!-- In-game -->
        <div v-else-if="tapGameStarted && !tapGameDone">
          <div class="text-h1 text-weight-bold q-mb-sm" style="color: #a85c6e;">{{ tapCount }}</div>
          <div class="text-caption q-mb-md" style="color: #9aaa90;">taps</div>
          <q-linear-progress
            :value="tapProgress"
            rounded
            size="10px"
            class="q-mb-md"
            style="background: #fce8ee;"
            color="pink-5"
          />
          <div class="text-h5" style="color: #7a6040;">{{ tapTimeLeft }}s left</div>
          <div class="tap-button q-mt-lg" @click="$emit('tap')" @touchstart.prevent="$emit('tap')">
            <q-btn
              round size="xl"
              icon="touch_app"
              class="tap-btn-animate"
              unelevated
              style="background: linear-gradient(135deg, #c97a8a, #a85c6e); color: white; box-shadow: 0 4px 18px rgba(201,122,138,0.40);"
            />
          </div>
        </div>

        <!-- Result -->
        <div v-else>
          <!-- Trophy in sage green — victory! -->
          <q-icon name="emoji_events" size="64px" style="color: #7eab7e;" />
          <div class="text-h4 text-weight-bold q-mt-sm" style="color: #a85c6e;">{{ tapCount }} taps!</div>
          <div class="text-body1 q-mt-sm" style="color: #7a6040;">{{ resultMessage }}</div>
          <div class="text-caption q-mt-xs" style="color: #9aaa90;">Your craving is gone. You crushed it!</div>
        </div>

      </q-card-section>

      <!-- Actions -->
      <q-card-actions align="center" class="q-pb-lg" style="background: #ede0c4; border-top: 1px solid #d4c4a0; gap: 12px;">
        <q-btn
          v-if="!tapGameStarted && !tapGameDone"
          @click="$emit('start')"
          unelevated label="Start!" size="lg"
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
    modelValue:    { type: Boolean, required: true },
    tapGameStarted:{ type: Boolean, required: true },
    tapGameDone:   { type: Boolean, required: true },
    tapCount:      { type: Number,  required: true },
    tapTimeLeft:   { type: Number,  required: true },
    tapProgress:   { type: Number,  required: true },
    resultMessage: { type: String,  required: true },
  },

  emits: ['update:modelValue', 'start', 'stop', 'reset', 'tap'],
}
</script>