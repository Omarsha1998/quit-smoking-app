<template>
  <div class="row justify-center items-center" style="min-height: 80vh">
    <div class="col-12 col-md-6">

      <q-card class="setup-card animate-fade-in">

        <!-- Header — Light Sage Green -->
        <q-card-section class="setup-header text-center">
          <div class="setup-icon-wrap q-mb-md">
            <q-icon name="emoji_events" size="40px" color="white" />
          </div>
          <div class="setup-title">Hi {{ userName }}! 🌿</div>
          <div class="setup-sub">Start your journey to a healthier life</div>
        </q-card-section>

        <!-- Form — Honey Beige -->
        <q-card-section class="q-pa-lg setup-body">

          <div class="field-label">📅 When did you quit?</div>
          <q-input
            v-model="form.quitDate"
            type="datetime-local"
            outlined
            class="q-mb-md input-modern"
          />

          <div class="field-label">🚬 Cigarettes per day (before quitting)</div>
          <q-input
            v-model.number="form.cigarettesPerDay"
            type="number"
            outlined
            class="q-mb-md input-modern"
            min="1"
          />

          <div class="field-label">💰 Price per pack</div>
          <q-input
            v-model.number="form.pricePerPack"
            type="number"
            step="0.01"
            outlined
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
  box-shadow: 0 8px 32px rgba(93, 148, 96, 0.16) !important;
  border: 1.5px solid #b8d4b0 !important;
}

/* ── Header — Light Sage Green ──────────────────── */
.setup-header {
  background: linear-gradient(135deg, #5d9460 0%, #7eab7e 60%, #a8d0a8 100%);
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
  background: rgba(255, 255, 255, 0.08);
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
  background: rgba(255, 255, 255, 0.20);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border: 2px solid rgba(255, 255, 255, 0.30);
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
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 4px;
  position: relative; z-index: 1;
}

/* ── Form body — Honey Beige ────────────────────── */
.setup-body {
  background: #f5ead8;
}

/* ── Field labels ───────────────────────────────── */
.field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #5d9460;
  margin-bottom: 6px;
  letter-spacing: 0.1px;
}

/* ── Input override ─────────────────────────────── */
.input-modern :deep(.q-field__control) {
  border-radius: 14px !important;
  background: #fdf5e8 !important;
}

.input-modern :deep(.q-field__native) {
  font-size: 0.95rem;
  color: #2e4a2e;
}

.input-modern :deep(.q-field--outlined .q-field__control:before) {
  border-color: #b8d4b0;
}

.input-modern :deep(.q-field--outlined.q-field--focused .q-field__control:after) {
  border-color: #7eab7e;
}

.input-modern :deep(.q-field__label) {
  color: #9aaa90;
}
</style>