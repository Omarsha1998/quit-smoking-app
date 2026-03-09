<template>
  <q-card class="q-mb-md shadow-lg" style="border-radius: 18px; overflow: hidden; border: 1.5px solid #ddc8a8;">

    <!-- Header -->
    <q-card-section style="background: linear-gradient(135deg, #c8a870 0%, #a87840 100%);" class="text-white">
      <div class="text-h6 text-weight-bold">
        <q-icon name="account_balance_wallet" class="q-mr-sm" />Savings Breakdown
      </div>
    </q-card-section>

    <!-- Daily / Weekly / Monthly -->
    <q-card-section style="background: #f5ead8;">
      <div class="row q-col-gutter-md text-center">
        <div class="col-4" v-for="item in periods" :key="item.label">
          <div class="text-caption" style="color: #9aaa90;">{{ item.label }}</div>
          <div class="text-h6 text-weight-bold" style="color: #a87840;">₱{{ item.value.toFixed(2) }}</div>
        </div>
      </div>
    </q-card-section>

    <q-separator style="background: #ddc8a8;" />

    <!-- 4 Stats Cards -->
    <q-card-section style="background: #f5ead8;">
      <div class="row q-col-gutter-md">
        <div class="col-6" v-for="(card, i) in statCards" :key="card.label">
          <q-card
            class="shadow-sm"
            :style="[card.cardStyle, { animationDelay: `${i * 0.1}s` }]"
            style="border-radius: 16px; border: 1.5px solid;"
          >
            <q-card-section style="background: transparent;">
              <q-icon :name="card.icon" size="36px" :style="{ color: card.iconColor }" />
              <div class="text-h5 text-weight-bold q-mt-sm" :style="{ color: card.valueColor }">{{ card.value }}</div>
              <div class="text-caption" :style="{ color: card.labelColor }">{{ card.label }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card-section>

    <q-separator style="background: #ddc8a8;" />

    <!-- Future Projection -->
    <q-card-section style="background: #f5ead8; padding-bottom: 20px;">
      <div style="background: linear-gradient(135deg, #2e4a2e, #1e3a1e); border-radius: 16px; padding: 14px;">
        <div style="font-size: 0.78rem; color: #b8d4b0; font-weight: 600; text-align: center; margin-bottom: 12px;">
          🔮 Your Future at 1 Year Smoke-Free
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
          <div v-for="proj in projections" :key="proj.label" style="text-align: center; background: rgba(255,255,255,0.08); border-radius: 10px; padding: 8px 4px;">
            <div style="font-size: 1.3rem; margin-bottom: 3px;">{{ proj.icon }}</div>
            <div style="font-size: 0.82rem; font-weight: 800; color: #fff; margin-bottom: 2px;">{{ proj.value }}</div>
            <div style="font-size: 0.62rem; color: #7eab7e; font-weight: 500;">{{ proj.label }}</div>
          </div>
        </div>
      </div>
    </q-card-section>

  </q-card>
</template>

<script>
export default {
  name: 'SavingsBreakdown',

  props: {
    daily:            { type: Number, required: true },
    weekly:           { type: Number, required: true },
    monthly:          { type: Number, required: true },
    stats:            { type: Object, default: () => ({}) },
    cigarettesPerDay: { type: Number, default: 0 },
    pricePerPack:     { type: Number, default: 0 },
  },

  computed: {
    periods() {
      return [
        { label: 'Daily',   value: this.daily   },
        { label: 'Weekly',  value: this.weekly  },
        { label: 'Monthly', value: this.monthly },
      ]
    },

    statCards() {
      return [
        {
          icon: 'block', iconColor: '#c97a8a', valueColor: '#7a3048', labelColor: '#a85c6e',
          cardStyle: 'background: #fce8ee; border-color: #e8aab8;',
          value: this.stats.cigarettesAvoided ?? 0,
          label: 'Cigarettes Avoided',
        },
        {
          icon: 'savings', iconColor: '#a87840', valueColor: '#5a3820', labelColor: '#a87840',
          cardStyle: 'background: #f5ead8; border-color: #ddc8a8;',
          value: `₱${(this.stats.moneySaved ?? 0).toFixed(2)}`,
          label: 'Money Saved',
        },
        {
          icon: 'schedule', iconColor: '#7eab7e', valueColor: '#2e4a2e', labelColor: '#5d9460',
          cardStyle: 'background: #e8f5e8; border-color: #b8d4b0;',
          value: `${Math.floor((this.stats.lifeRegained ?? 0) / 60)}h`,
          label: 'Life Regained',
        },
        {
          icon: 'favorite', iconColor: '#c97a8a', valueColor: '#7a3048', labelColor: '#a85c6e',
          cardStyle: 'background: #fce8ee; border-color: #e8aab8;',
          value: `${this.stats.healthBoost ?? 0}%`,
          label: 'Health Boost',
        },
      ]
    },

    yearlySavings() {
      return Math.round((this.cigarettesPerDay / 20) * this.pricePerPack * 365)
    },

    yearlyAvoided() {
      return this.cigarettesPerDay * 365
    },

    yearlyDays() {
      return Math.round((this.yearlyAvoided * 11) / (60 * 24))
    },

    projections() {
      return [
        { icon: '💰', value: `₱${this.yearlySavings.toLocaleString()}`, label: 'Saved' },
        { icon: '🚬', value: this.yearlyAvoided.toLocaleString(),        label: 'Cigs Avoided' },
        { icon: '⏰', value: `${this.yearlyDays}d`,                      label: 'Life Regained' },
      ]
    },
  },
}
</script>