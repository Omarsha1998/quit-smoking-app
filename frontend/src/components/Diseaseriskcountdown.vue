<template>
  <q-card class="q-mb-md shadow-lg" style="border-radius: 18px; overflow: hidden; border: 1.5px solid #e8aab8;">

    <!-- Header — Dusty Rose (health awareness) -->
    <q-card-section style="background: linear-gradient(135deg, #c97a8a 0%, #a85c6e 100%);" class="text-white">
      <div class="text-h6 text-weight-bold">
        <q-icon name="timer" class="q-mr-sm" />Disease Risk Countdown
      </div>
    </q-card-section>

    <q-card-section style="background: #f5ead8;">
      <q-list>
        <q-item v-for="(risk, idx) in milestones" :key="idx" class="q-pa-sm">
          <q-item-section>
            <q-item-label class="text-weight-bold" style="color: #2e4a2e;">{{ risk.label }}</q-item-label>
            <q-item-label caption class="q-mb-xs" style="color: #7a6040;">{{ risk.benefit }}</q-item-label>
            <q-linear-progress
              :value="risk.progress"
              rounded
              size="10px"
              :style="risk.progress >= 1
                ? 'background: #d6efd6;'
                : 'background: #fce8ee;'"
              :color="risk.progress >= 1 ? 'green-6' : 'pink-4'"
            />
            <q-item-label
              caption
              class="q-mt-xs"
              :style="risk.progress >= 1 ? 'color: #5d9460;' : 'color: #c97a8a;'"
            >
              {{ risk.progress >= 1
                ? '✅ Milestone reached!'
                : `${risk.daysLeft} days to go — You are ${risk.daysDone} days closer!` }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: 'DiseaseRiskCountdown',
  props: {
    milestones: { type: Array, required: true },
  },
}
</script>