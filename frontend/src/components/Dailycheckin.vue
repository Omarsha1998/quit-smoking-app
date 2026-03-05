<template>
  <q-card class="q-mb-md shadow-lg daily-checkin-card">
    <q-card-section class="bg-blue-6 text-white">
      <div class="row items-center justify-between">
        <div class="text-h6 text-weight-bold">
          <q-icon name="today" class="q-mr-sm" />Daily Check-In
        </div>
        <div class="text-caption text-blue-1">{{ todayDateLabel }}</div>
      </div>
    </q-card-section>

    <q-card-section>

      <!-- Already logged today -->
      <div v-if="todayLogged" class="text-center q-py-sm">
        <q-icon
          :name="todaySmoked ? 'sentiment_dissatisfied' : 'emoji_events'"
          :color="todaySmoked ? 'orange-6' : 'green-6'"
          size="40px"
        />
        <div
          class="text-subtitle1 text-weight-bold q-mt-xs"
          :class="todaySmoked ? 'text-orange-8' : 'text-green-8'"
        >
          <template v-if="todaySmoked">
            You smoked {{ todaySmokedCount > 0 ? todaySmokedCount + ' cigarette' + (todaySmokedCount !== 1 ? 's' : '') : 'today' }} 😔
          </template>
          <template v-else>
            You're smoke-free today! 🎉
          </template>
        </div>
        <div v-if="!todaySmoked" class="text-caption text-green-6 q-mt-xs">
          🔥 {{ currentStreak }} day streak · {{ totalSmokeFreedays }} total smoke-free days
        </div>
        <div v-if="todaySmoked && todaySmokedCount > 0 && cigarettesPerDay > 0" class="text-caption text-orange-6 q-mt-xs">
          You avoided {{ Math.max(0, cigarettesPerDay - todaySmokedCount) }} out of {{ cigarettesPerDay }} today
        </div>
      </div>

      <!-- Step 1: Did you smoke? -->
      <div v-else-if="step === 1">
        <div class="text-subtitle2 text-grey-7 q-mb-md text-center">
          Did you smoke today?
        </div>
        <div class="row q-gutter-sm justify-center">
          <q-btn
            @click="onNo"
            label="✅ No — Smoke Free!"
            color="green-6"
            unelevated
            class="col"
          />
          <q-btn
            @click="step = 2"
            label="😔 Yes, I smoked"
            color="orange-6"
            unelevated
            class="col"
          />
        </div>
      </div>

      <!-- Step 2: How many cigarettes? -->
      <div v-else-if="step === 2" class="text-center">
        <q-icon name="smoking_rooms" color="orange-6" size="36px" />
        <div class="text-subtitle2 text-grey-7 q-mt-sm q-mb-xs">
          How many cigarettes did you smoke today?
        </div>
        <div class="text-caption text-grey-5 q-mb-md">
          Your usual: <strong>{{ cigarettesPerDay }}</strong> per day
        </div>

        <!-- Quick-tap number buttons (1 up to daily target, max 12) -->
        <div class="row q-gutter-xs justify-center q-mb-md flex-wrap">
          <q-btn
            v-for="n in quickCounts"
            :key="n"
            :label="String(n)"
            :color="smokedCountInput === n ? 'orange-8' : 'orange-2'"
            :text-color="smokedCountInput === n ? 'white' : 'orange-9'"
            unelevated
            round
            size="md"
            style="min-width:36px"
            @click="smokedCountInput = n"
          />
        </div>

        <!-- Manual input for amounts beyond the quick buttons -->
        <q-input
          v-model.number="smokedCountInput"
          type="number"
          :min="1"
          :max="99"
          outlined
          dense
          label="Or type a number"
          class="q-mx-xl q-mb-sm"
          color="orange-6"
        />

        <!-- Contextual feedback -->
        <div v-if="smokedCountInput > 0 && smokedCountInput > cigarettesPerDay" class="text-caption text-red-6 q-mb-sm">
          ⚠️ That's more than your usual {{ cigarettesPerDay }} — that's okay, tomorrow is a new day
        </div>
        <div v-else-if="smokedCountInput > 0 && smokedCountInput < cigarettesPerDay" class="text-caption text-green-7 q-mb-sm">
          👍 That's less than your usual {{ cigarettesPerDay }} — you're making progress!
        </div>
        <div v-else-if="smokedCountInput > 0 && smokedCountInput === cigarettesPerDay" class="text-caption text-orange-7 q-mb-sm">
          Same as usual — you've got this 💪
        </div>

        <div class="row q-gutter-sm justify-center q-mt-sm">
          <q-btn flat label="Back" color="grey-6" @click="step = 1" />
          <q-btn
            :disable="!smokedCountInput || smokedCountInput < 1"
            label="Log It"
            color="orange-6"
            unelevated
            @click="onConfirmSmoked"
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
    // 1 button per cigarette up to their daily target (capped at 12 to fit screen)
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