<template>
  <q-card class="q-mb-md shadow-lg" style="border-radius: 18px; overflow: hidden; border: 1.5px solid #ddc8a8;">

    <!-- Header — Honey Beige (money = warmth) -->
    <q-card-section style="background: linear-gradient(135deg, #c8a870 0%, #a87840 100%);" class="text-white">
      <div class="text-h6 text-weight-bold">
        <q-icon name="account_balance_wallet" class="q-mr-sm" />Savings Breakdown
      </div>
    </q-card-section>

    <q-card-section style="background: #f5ead8;">
      <div class="row q-col-gutter-md text-center">
        <div class="col-4" v-for="item in periods" :key="item.label">
          <div class="text-caption" style="color: #9aaa90;">{{ item.label }}</div>
          <div class="text-h6 text-weight-bold" style="color: #a87840;">₱{{ item.value.toFixed(2) }}</div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: 'SavingsBreakdown',

  props: {
    daily:   { type: Number, required: true },
    weekly:  { type: Number, required: true },
    monthly: { type: Number, required: true },
  },

  computed: {
    periods() {
      return [
        { label: 'Daily',   value: this.daily   },
        { label: 'Weekly',  value: this.weekly  },
        { label: 'Monthly', value: this.monthly },
      ]
    },
  },
}
</script>