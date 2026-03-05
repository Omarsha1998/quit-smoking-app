<template>
  <div class="row justify-center items-center" style="min-height: 80vh">
    <div class="col-12 col-md-6">
      <q-card class="shadow-xl animate-fade-in">
        <q-card-section class="text-center bg-gradient-blue text-white">
          <q-avatar size="80px" color="white" text-color="blue-6" icon="emoji_events" class="q-mb-md" />
          <div class="text-h4 text-weight-bold q-mb-xs">Hi {{ userName }}!</div>
          <div class="text-subtitle2">Start your journey to a healthier life</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="form.quitDate"
            type="datetime-local"
            label="When did you quit?"
            outlined
            color="blue-6"
            class="q-mb-md"
          />
          <q-input
            v-model.number="form.cigarettesPerDay"
            type="number"
            label="Cigarettes per day (before quitting)"
            outlined
            color="blue-6"
            class="q-mb-md"
            min="1"
          />
          <q-input
            v-model.number="form.pricePerPack"
            type="number"
            step="0.01"
            label="Price per pack (₱)"
            outlined
            color="blue-6"
            class="q-mb-md"
            prefix="₱"
            min="0"
          />
          <q-btn
            @click="submit"
            color="blue-6"
            label="Start Tracking"
            size="lg"
            class="full-width"
            :disable="!form.quitDate || !form.cigarettesPerDay || !form.pricePerPack"
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