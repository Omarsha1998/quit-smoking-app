<template>
  <q-card class="q-mb-md shadow-lg">
    <q-card-section class="bg-green-6 text-white">
      <div class="text-h6 text-weight-bold">
        <q-icon name="account_balance_wallet" class="q-mr-sm" />Savings Breakdown
      </div>
    </q-card-section>
    <q-card-section>
      <div class="row q-col-gutter-md text-center">
        <div class="col-4" v-for="item in periods" :key="item.label">
          <div class="text-caption text-grey-6">{{ item.label }}</div>
          <div class="text-h6 text-weight-bold text-green-8">₱{{ item.value.toFixed(2) }}</div>
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