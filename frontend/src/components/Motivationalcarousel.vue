<template>
  <q-card class="q-mb-md shadow-lg" style="border-radius: 18px; overflow: hidden; border: 1.5px solid #b8d4b0;">
    <q-carousel
      v-model="slide"
      animated
      swipeable
      infinite
      :autoplay="autoplay"
      transition-prev="fade"
      transition-next="fade"
      height="170px"
      class="carousel-bg text-white"
      @update:model-value="onSlideChange"
    >
      <q-carousel-slide
        v-for="(quote, idx) in quotes"
        :key="idx"
        :name="idx"
        class="column flex-center text-center q-pa-lg"
      >
        <!-- Dusty rose quote icon for warmth -->
        <q-icon name="format_quote" size="32px" class="q-mb-sm" style="opacity: 0.55; color: #f7dfe5;" />
        <div class="text-h6" style="font-style: italic; line-height: 1.6; color: white;">{{ quote }}</div>
      </q-carousel-slide>
    </q-carousel>
  </q-card>
</template>

<script>
export default {
  name: 'MotivationalCarousel',

  props: {
    quotes: { type: Array, required: true },
  },

  data() {
    return {
      slide:        0,
      autoplay:     5000,
      restartTimer: null,
    }
  },

  methods: {
    onSlideChange() {
      this.autoplay = 0
      if (this.restartTimer) clearTimeout(this.restartTimer)
      this.restartTimer = setTimeout(() => { this.autoplay = 5000 }, 200)
    },
  },

  beforeUnmount() {
    if (this.restartTimer) clearTimeout(this.restartTimer)
  },
}
</script>

<style scoped>
/* Tricolor diagonal gradient — sage green → honey beige midpoint → dusty rose */
.carousel-bg {
  background: linear-gradient(135deg, #5d9460 0%, #7eab7e 35%, #c8a870 65%, #c97a8a 100%) !important;
}
</style>