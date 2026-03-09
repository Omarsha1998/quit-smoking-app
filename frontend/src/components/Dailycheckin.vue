<template>
  <q-card class="q-mb-md shadow-lg" style="border-radius: 18px; overflow: hidden; border: 1.5px solid #b8d4b0;">

    <!-- Header — Light Sage Green -->
    <q-card-section style="background: linear-gradient(135deg, #7eab7e 0%, #5d9460 100%);" class="text-white">
      <div class="row items-center justify-between">
        <div class="text-h6 text-weight-bold">
          <q-icon name="today" class="q-mr-sm" />Daily Check-In
        </div>
        <div class="text-caption" style="opacity: 0.85;">{{ todayDateLabel }}</div>
      </div>
    </q-card-section>

    <q-card-section style="background: #faf2e4;">

      <!-- Already logged today -->
      <div v-if="todayLogged" class="text-center q-py-sm">
        <q-icon
          :name="todaySmoked ? 'sentiment_dissatisfied' : 'emoji_events'"
          :style="todaySmoked ? 'color: #c97a8a;' : 'color: #7eab7e;'"
          size="40px"
        />
        <div
          class="text-subtitle1 text-weight-bold q-mt-xs"
          :style="todaySmoked ? 'color: #a85c6e;' : 'color: #5d9460;'"
        >
          <template v-if="todaySmoked">
            You smoked {{ todaySmokedCount > 0 ? todaySmokedCount + ' cigarette' + (todaySmokedCount !== 1 ? 's' : '') : 'today' }} 😔
          </template>
          <template v-else>
            You're smoke-free today! 🎉
          </template>
        </div>
        <div v-if="!todaySmoked" class="text-caption q-mt-xs" style="color: #5d9460;">
          🔥 {{ currentStreak }} day streak · {{ totalSmokeFreedays }} total smoke-free days
        </div>
        <div v-if="todaySmoked && todaySmokedCount > 0 && cigarettesPerDay > 0" class="text-caption q-mt-xs" style="color: #c97a8a;">
          You avoided {{ Math.max(0, cigarettesPerDay - todaySmokedCount) }} out of {{ cigarettesPerDay }} today
        </div>
      </div>

      <!-- Step 1: Did you smoke? -->
      <div v-else-if="step === 1">
        <div class="text-subtitle2 q-mb-md text-center" style="color: #7a6040;">
          Did you smoke today?
        </div>
        <div class="row q-gutter-sm justify-center">
          <q-btn
            @click="onNo"
            label="✅ No — Smoke Free!"
            unelevated
            class="col"
            style="background: linear-gradient(135deg, #7eab7e, #5d9460); color: white; border-radius: 10px; font-weight: 600;"
          />
          <q-btn
            @click="step = 2"
            label="😔 Yes, I smoked"
            unelevated
            class="col"
            style="background: linear-gradient(135deg, #c97a8a, #a85c6e); color: white; border-radius: 10px; font-weight: 600;"
          />
        </div>
      </div>

      <!-- Step 2: How many cigarettes? -->
      <div v-else-if="step === 2" class="text-center">
        <q-icon name="smoking_rooms" size="36px" style="color: #c97a8a;" />
        <div class="text-subtitle2 q-mt-sm q-mb-xs" style="color: #7a6040;">
          How many cigarettes did you smoke today?
        </div>
        <div class="text-caption q-mb-md" style="color: #9aaa90;">
          Your usual: <strong style="color: #7a6040;">{{ cigarettesPerDay }}</strong> per day
        </div>

        <!-- Quick-tap number buttons -->
        <div class="row q-gutter-xs justify-center q-mb-md flex-wrap">
          <q-btn
            v-for="n in quickCounts"
            :key="n"
            :label="String(n)"
            unelevated
            round
            size="md"
            style="min-width:36px; border-radius: 50%;"
            :style="smokedCountInput === n
              ? 'background: #c97a8a; color: white;'
              : 'background: #fce8ee; color: #a85c6e;'"
            @click="smokedCountInput = n"
          />
        </div>

        <!-- Manual input -->
        <q-input
          v-model.number="smokedCountInput"
          type="number"
          :min="1"
          :max="99"
          outlined
          dense
          label="Or type a number"
          class="q-mx-xl q-mb-sm rose-input"
        />

        <!-- Contextual feedback -->
        <div v-if="smokedCountInput > 0 && smokedCountInput > cigarettesPerDay" class="text-caption q-mb-sm" style="color: #a85c6e;">
          ⚠️ That's more than your usual {{ cigarettesPerDay }} — that's okay, tomorrow is a new day
        </div>
        <div v-else-if="smokedCountInput > 0 && smokedCountInput < cigarettesPerDay" class="text-caption q-mb-sm" style="color: #5d9460;">
          👍 That's less than your usual {{ cigarettesPerDay }} — you're making progress!
        </div>
        <div v-else-if="smokedCountInput > 0 && smokedCountInput === cigarettesPerDay" class="text-caption q-mb-sm" style="color: #a87840;">
          Same as usual — you've got this 💪
        </div>

        <div class="row q-gutter-sm justify-center q-mt-sm">
          <q-btn flat label="Back" style="color: #9aaa90;" @click="step = 1" />
          <q-btn
            :disable="!smokedCountInput || smokedCountInput < 1"
            label="Log It"
            unelevated
            @click="onConfirmSmoked"
            style="background: linear-gradient(135deg, #c97a8a, #a85c6e); color: white; border-radius: 10px; font-weight: 600; padding: 6px 28px;"
          />
        </div>
      </div>

    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: 'DailyCheckIn',

  props: {
    todayDateLabel:     { type: String,            default: '' },
    todayLogged:        { type: Boolean,           default: false },
    todaySmoked:        { type: [Boolean, Number], default: false },
    todaySmokedCount:   { type: Number,            default: 0 },
    currentStreak:      { type: Number,            default: 0 },
    totalSmokeFreedays: { type: Number,            default: 0 },
    cigarettesPerDay:   { type: Number,            default: 0 },
  },

  emits: ['log'],

  data() {
    return {
      step:             1,
      smokedCountInput: null,
    }
  },

  computed: {
    quickCounts() {
      const max = Math.min(Math.max(this.cigarettesPerDay || 10, 5), 12)
      return Array.from({ length: max }, (_, i) => i + 1)
    },
  },

  methods: {
    onNo() {
      this.$emit('log', { smoked: false, smokedCount: 0 })
      this.step = 1
    },

    onConfirmSmoked() {
      const count = parseInt(this.smokedCountInput) || 1
      this.$emit('log', { smoked: true, smokedCount: count })
      this.step             = 1
      this.smokedCountInput = null
    },
  },
}
</script>

<style scoped>
/* Dusty rose input focus */
.rose-input :deep(.q-field__control) {
  border-radius: 10px;
  background: white;
}
.rose-input :deep(.q-field__label) {
  color: #9aaa90;
}
.rose-input :deep(.q-field--outlined .q-field__control:before) {
  border-color: #e8aab8;
}
.rose-input :deep(.q-field--outlined.q-field--focused .q-field__control:after) {
  border-color: #c97a8a;
}
</style>