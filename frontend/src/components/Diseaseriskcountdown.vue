<template>
  <q-card class="q-mb-md shadow-lg">
    <q-card-section class="bg-red-6 text-white">
      <div class="text-h6 text-weight-bold">
        <q-icon name="timer" class="q-mr-sm" />Disease Risk Countdown
      </div>
    </q-card-section>
    <q-card-section>
      <q-list>
        <q-item v-for="(risk, idx) in milestones" :key="idx" class="q-pa-sm">
          <q-item-section>
            <q-item-label class="text-weight-bold text-blue-9">{{ risk.label }}</q-item-label>
            <q-item-label caption class="text-grey-7 q-mb-xs">{{ risk.benefit }}</q-item-label>
            <q-linear-progress
              :value="risk.progress"
              :color="risk.progress >= 1 ? 'green' : 'blue-6'"
              track-color="blue-1"
              rounded
              size="10px"
            />
            <q-item-label caption class="q-mt-xs" :class="risk.progress >= 1 ? 'text-green-7' : 'text-blue-7'">
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