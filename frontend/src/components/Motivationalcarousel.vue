<template>
  <q-card class="q-mb-md shadow-lg">
    <q-carousel
      v-model="slide"
      animated
      swipeable
      infinite
      :autoplay="autoplay"
      transition-prev="fade"
      transition-next="fade"
      height="170px"
      class="bg-gradient-blue text-white my-carousel"
      @update:model-value="onSlideChange"
    >
      <q-carousel-slide
        v-for="(quote, idx) in quotes"
        :key="idx"
        :name="idx"
        class="column flex-center text-center q-pa-lg"
      >
        <q-icon name="format_quote" size="32px" class="q-mb-sm opacity-50" />
        <div class="text-h6" style="font-style: italic; line-height: 1.6">{{ quote }}</div>
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
      slide:    0,
      autoplay: 5000,
      restartTimer: null,
    }
  },

  methods: {
    onSlideChange() {
      // Reset autoplay after manual swipe
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