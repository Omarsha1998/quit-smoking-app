<template>
  <div class="row justify-center items-center" style="min-height: 80vh">
    <div class="col-12 col-md-6">
      <q-card class="shadow-xl animate-fade-in registration-card">
        <!-- Logos -->
        <q-card-section class="text-center q-pt-xl q-pb-none">
          <!-- Main logo -->
          <div class="row justify-center q-mb-sm">
            <div style="width: 180px">
              <q-img src="../assets/HingaPhWithLogo.png" alt="Hinga PH Logo" />
            </div>
          </div>

          <!-- Two logos side by side -->
          <div class="row justify-center items-center q-gutter-md">
            <div style="width: 80px">
              <q-img src="../assets/ateneologo.png" alt="Ateneo Logo" />
            </div>
            <div style="width: 80px">
              <q-img src="../assets/ateneosmlogo.png" alt="Ateneo SM Logo" />
            </div>
          </div>
        </q-card-section>

        <!-- Welcome text -->
        <q-card-section class="text-center q-px-lg q-pb-md" style="background: #fdf5e8">
          <div class="text-h3 text-weight-bold q-mb-sm welcome-text">Welcome</div>
          <div class="text-subtitle1 tagline-text">Begin your journey to a smoke-free life</div>
        </q-card-section>

        <!-- Input & CTA -->
        <q-card-section class="q-px-lg q-pb-lg" style="background: #f5ead8">
          <q-input
            v-model="localName"
            label="Your Name"
            outlined
            class="q-mb-lg reg-input"
            autofocus
            @keyup.enter="submit"
          >
            <template v-slot:prepend>
              <q-icon name="person" style="color: #7eab7e" />
            </template>
          </q-input>

          <q-btn
            @click="submit"
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

<style scoped>
/* Input — sage green focus */
.reg-input :deep(.q-field__control) {
  border-radius: 14px;
  background: #fdf5e8;
}
.reg-input :deep(.q-field__label) {
  color: #9aaa90;
}
.reg-input :deep(.q-field--outlined .q-field__control:before) {
  border-color: #b8d4b0;
}
.reg-input :deep(.q-field--outlined.q-field--focused .q-field__control:after) {
  border-color: #7eab7e;
}
</style>
