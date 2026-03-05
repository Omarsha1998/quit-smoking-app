<template>
  <div class="row justify-center items-center" style="min-height: 80vh">
    <div class="col-12 col-md-6">
      <q-card class="shadow-xl animate-fade-in registration-card">
        <q-card-section class="text-center q-pt-xl q-pb-md">
          <div class="row justify-center items-center q-gutter-lg">
            <div class="col-auto"><img src="../assets/adzuLogo-nobg.png" alt="AdZU Logo" class="logo-image" /></div>
            <div class="col-auto logo-divider"></div>
            <div class="col-auto"><img src="../assets/puffLogo-removebg-preview.png" alt="App Logo" class="logo-image" /></div>
          </div>
        </q-card-section>
        <q-card-section class="text-center q-px-lg q-pb-md">
          <div class="text-h3 text-weight-bold text-grey-9 q-mb-sm welcome-text">Welcome</div>
          <div class="text-subtitle1 text-grey-7 tagline-text">Begin your journey to a smoke-free life</div>
        </q-card-section>
        <q-card-section class="q-px-lg q-pb-lg">
          <q-input
            v-model="localName"
            label="Your Name"
            outlined
            class="q-mb-lg input-modern"
            color="blue-7"
            autofocus
            @keyup.enter="submit"
          >
            <template v-slot:prepend><q-icon name="person" color="blue-7" /></template>
          </q-input>
          <q-btn
            @click="submit"
            color="blue-7"
            label="Get Started"
            unelevated
            size="lg"
            class="full-width modern-button"
            :disable="!localName || localName.trim().length < 2"
            no-caps
          />
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegistrationCard',

  emits: ['register'],

  data() {
    return { localName: '' }
  },

  methods: {
    submit() {
      if (this.localName && this.localName.trim().length >= 2) {
        this.$emit('register', this.localName.trim())
      }
    },
  },
}
</script>