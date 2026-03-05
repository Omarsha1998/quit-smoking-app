<template>
  <div class="row justify-center items-center" style="min-height: 80vh">
    <div class="col-12 col-md-6">

      <q-card class="setup-card animate-fade-in">

        <!-- Header -->
        <q-card-section class="setup-header text-center">
          <div class="setup-icon-wrap q-mb-md">
            <q-icon name="emoji_events" size="40px" color="white" />
          </div>
          <div class="setup-title">Hi {{ userName }}! 🌿</div>
          <div class="setup-sub">Start your journey to a healthier life</div>
        </q-card-section>

        <!-- Form -->
        <q-card-section class="q-pa-lg setup-body">

          <div class="field-label">📅 When did you quit?</div>
          <q-input
            v-model="form.quitDate"
            type="datetime-local"
            outlined
            color="green-8"
            class="q-mb-md input-modern"
          />

          <div class="field-label">🚬 Cigarettes per day (before quitting)</div>
          <q-input
            v-model.number="form.cigarettesPerDay"
            type="number"
            outlined
            color="green-8"
            class="q-mb-md input-modern"
            min="1"
          />

          <div class="field-label">💰 Price per pack</div>
          <q-input
            v-model.number="form.pricePerPack"
            type="number"
            step="0.01"
            outlined
            color="green-8"
            class="q-mb-lg input-modern"
            prefix="₱"
            min="0"
          />

          <q-btn
            @click="submit"
            label="Start Tracking 🚀"
            size="lg"
            class="full-width modern-button"
            :disable="!form.quitDate || !form.cigarettesPerDay || !form.pricePerPack"
            unelevated
          />

        </q-card-section>
      </q-card>

    </div>
  </div>
</template>

<script>
export default {
  name: 'SetupForm',

  props: {
    userName: { type: String, required: true },
  },

  emits: ['start'],

  data() {
    return {
      form: { quitDate: '', cigarettesPerDay: '', pricePerPack: '' },
    }
  },

  methods: {
    submit() {
      const { quitDate, cigarettesPerDay, pricePerPack } = this.form
      if (!quitDate || !cigarettesPerDay || !pricePerPack) return
      this.$emit('start', { ...this.form })
    },
  },
}
</script>

<style scoped>

.setup-card {
  border-radius: 24px !important;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(45, 106, 79, 0.14) !important;
  border: none !important;
}

/* ── Header ───────────────────────────────────── */
.setup-header {
  background: linear-gradient(135deg, #2D6A4F 0%, #40916C 60%, #74C69D 100%);
  padding: 36px 24px 32px;
  position: relative;
  overflow: hidden;
}

.setup-header::before {
  content: '';
  position: absolute;
  top: -50px; right: -50px;
  width: 160px; height: 160px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  pointer-events: none;
}

.setup-header::after {
  content: '';
  position: absolute;
  bottom: -30px; left: -20px;
  width: 120px; height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  pointer-events: none;
}

.setup-icon-wrap {
  width: 80px; height: 80px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border: 2px solid rgba(255, 255, 255, 0.28);
  position: relative; z-index: 1;
}

.setup-title {
  font-family: 'Nunito', sans-serif;
  font-size: 1.8rem;
  font-weight: 900;
  color: #ffffff;
  position: relative; z-index: 1;
  line-height: 1.2;
}

.setup-sub {
  color: rgba(255, 255, 255, 0.80);
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 4px;
  position: relative; z-index: 1;
}

/* ── Form body ────────────────────────────────── */
.setup-body {
  background: #FDFAF5;
}

/* ── Field labels ─────────────────────────────── */
.field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #2D6A4F;
  margin-bottom: 6px;
  letter-spacing: 0.1px;
}

/* ── Input override ───────────────────────────── */
.input-modern :deep(.q-field__control) {
  border-radius: 14px !important;
  background: #FFFFFF !important;
}

.input-modern :deep(.q-field__native) {
  font-family: 'Poppins', sans-serif;
  font-size: 0.95rem;
  color: #1C2B23;
}

</style>