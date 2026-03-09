<template>
  <div>
    <!-- Main counter card — deep rich green so white text pops clearly -->
    <q-card
      class="q-mb-md text-white animate-slide-up hero-card"
      style="border-radius: 22px; overflow: hidden; border: none !important;"
    >
      <!-- Decorative circles -->
      <div class="hero-orb hero-orb-tl" />
      <div class="hero-orb hero-orb-br" />

      <q-card-section class="text-center q-pa-xl" style="position: relative; z-index: 1;">
        <q-icon
          name="emoji_events"
          size="64px"
          class="q-mb-md animate-bounce"
          style="filter: drop-shadow(0 4px 12px rgba(0,0,0,0.25)); color: #ffe082;"
        />
        <div class="text-h1 text-weight-bold hero-number">{{ stats.days }}</div>
        <div class="text-h5 q-mb-sm hero-label">Days Smoke-Free</div>
        <div
          v-if="stats.hours > 0 || stats.minutes > 0"
          class="hero-sub"
        >
          {{ stats.hours }}h {{ stats.minutes }}m
        </div>
        <!-- Subtle pill badge -->
        <div class="hero-badge q-mt-md">
          <q-icon name="local_fire_department" size="xs" class="q-mr-xs" />
          Keep it up!
        </div>
      </q-card-section>
    </q-card>

    <!-- 4-card stats grid -->
    <!--
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-6" v-for="(card, i) in statCards" :key="card.label">
        <q-card
          class="shadow-lg hover-lift animate-slide-up"
          :style="[card.cardStyle, { animationDelay: `${i * 0.1}s` }]"
          style="border-radius: 16px; border: 1.5px solid;"
        >
          <q-card-section style="background: transparent;">
            <q-icon :name="card.icon" size="40px" :style="{ color: card.iconColor }" />
            <div class="text-h4 text-weight-bold q-mt-sm" :style="{ color: card.valueColor }">{{ card.value }}</div>
            <div class="text-caption" :style="{ color: card.labelColor }">{{ card.label }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
    -->

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
        {
          icon: 'block', iconColor: '#c97a8a', valueColor: '#7a3048', labelColor: '#a85c6e',
          cardStyle: 'background: #fce8ee; border-color: #e8aab8;',
          value: this.stats.cigarettesAvoided,
          label: 'Cigarettes Avoided',
        },
        {
          icon: 'savings', iconColor: '#a87840', valueColor: '#5a3820', labelColor: '#a87840',
          cardStyle: 'background: #f5ead8; border-color: #ddc8a8;',
          value: `₱${this.stats.moneySaved.toFixed(2)}`,
          label: 'Money Saved',
        },
        {
          icon: 'schedule', iconColor: '#7eab7e', valueColor: '#2e4a2e', labelColor: '#5d9460',
          cardStyle: 'background: #e8f5e8; border-color: #b8d4b0;',
          value: `${Math.floor(this.stats.lifeRegained / 60)}h`,
          label: 'Life Regained',
        },
        {
          icon: 'favorite', iconColor: '#c97a8a', valueColor: '#7a3048', labelColor: '#a85c6e',
          cardStyle: 'background: #fce8ee; border-color: #e8aab8;',
          value: `${this.stats.healthBoost}%`,
          label: 'Health Boost',
        },
      ]
    },
  },
}
</script>

<style scoped>
/* ── Hero card — deep forest green so white text is crisp ── */
.hero-card {
  background: linear-gradient(145deg, #2e5e32 0%, #3d7a42 45%, #4e8a55 100%) !important;
  box-shadow:
    0 20px 40px -8px rgba(46, 94, 50, 0.50),
    0 8px 16px -4px rgba(46, 94, 50, 0.30) !important;
  position: relative;
}

/* Decorative translucent orbs */
.hero-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.hero-orb-tl {
  width: 200px; height: 200px;
  top: -60px; left: -60px;
  background: rgba(255, 255, 255, 0.06);
}
.hero-orb-br {
  width: 160px; height: 160px;
  bottom: -50px; right: -40px;
  background: rgba(255, 255, 255, 0.05);
}

.hero-number {
  font-size: 5rem;
  line-height: 1;
  letter-spacing: -2px;
  text-shadow: 0 2px 12px rgba(0,0,0,0.20);
}

.hero-label {
  font-weight: 700;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 6px rgba(0,0,0,0.15);
  color: rgba(255,255,255,0.95);
}

.hero-sub {
  font-size: 1rem;
  color: rgba(255,255,255,0.70);
  letter-spacing: 0.3px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 20px;
  padding: 4px 14px;
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255,255,255,0.90);
  letter-spacing: 0.3px;
}
</style>