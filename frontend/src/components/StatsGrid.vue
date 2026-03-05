<template>
  <div>
    <!-- Main counter card -->
    <q-card class="bg-gradient-blue q-mb-md text-white shadow-2xl animate-slide-up">
      <q-card-section class="text-center">
        <q-icon name="emoji_events" size="64px" class="q-mb-md animate-bounce" />
        <div class="text-h1 text-weight-bold">{{ stats.days }}</div>
        <div class="text-h5 q-mb-sm">Days Smoke-Free</div>
        <div class="text-subtitle2 opacity-80" v-if="stats.hours > 0 || stats.minutes > 0">
          {{ stats.hours }}h {{ stats.minutes }}m
        </div>
      </q-card-section>
    </q-card>

    <!-- 4-card stats grid -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-6" v-for="(card, i) in statCards" :key="card.label">
        <q-card class="shadow-lg hover-lift animate-slide-up" :style="{ animationDelay: `${i * 0.1}s` }">
          <q-card-section>
            <q-icon :name="card.icon" :color="card.color" size="40px" />
            <div class="text-h4 text-weight-bold q-mt-sm text-blue-9">{{ card.value }}</div>
            <div class="text-caption text-blue-6">{{ card.label }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatsGrid',

  props: {
    stats: { type: Object, required: true },
  },

  computed: {
    statCards() {
      return [
        { icon: 'block',    color: 'red-6',   value: this.stats.cigarettesAvoided,              label: 'Cigarettes Avoided' },
        { icon: 'savings',  color: 'green-6',  value: `₱${this.stats.moneySaved.toFixed(2)}`,    label: 'Money Saved'        },
        { icon: 'schedule', color: 'blue-6',   value: `${Math.floor(this.stats.lifeRegained / 60)}h`, label: 'Life Regained' },
        { icon: 'favorite', color: 'pink-6',   value: `${this.stats.healthBoost}%`,              label: 'Health Boost'       },
      ]
    },
  },
}
</script>