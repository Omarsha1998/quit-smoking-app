<template>
  <div class="row q-col-gutter-sm q-mb-md">

    <!-- Main craving CTA — Dusty Rose (urgent, caring) -->
    <div class="col-12">
      <q-btn
        @click="$emit('crave')"
        label="Craving a cigarette? Get Help!"
        size="md"
        class="full-width animate-pulse"
        icon="help_outline"
        unelevated
        style="background: linear-gradient(135deg, #c97a8a, #a85c6e); color: white; border-radius: 12px; font-weight: 700; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(201,122,138,0.35);"
      />
    </div>

    <!-- Breathing — Sage Green (calm) -->
    <div class="col-6">
      <q-btn
        @click="$emit('breathing')"
        label="Breathing Exercise"
        icon="air"
        unelevated
        class="full-width"
        style="background: linear-gradient(135deg, #7eab7e, #5d9460); color: white; border-radius: 10px; font-weight: 600;"
      />
    </div>

    <!-- Delay Timer — Honey Beige (warm, grounding) -->
    <div class="col-6">
      <q-btn
        @click="$emit('delay')"
        label="5-Min Delay Timer"
        icon="timer"
        unelevated
        class="full-width"
        style="background: linear-gradient(135deg, #c8a870, #a87840); color: white; border-radius: 10px; font-weight: 600;"
      />
    </div>

    <!-- Tap Challenge — Dusty Rose light (playful energy) -->
    <div class="col-6">
      <q-btn
        @click="$emit('tap')"
        label="Tap Challenge"
        icon="sports_esports"
        unelevated
        class="full-width"
        style="background: #fce8ee; color: #a85c6e; border: 1.5px solid #e8aab8; border-radius: 10px; font-weight: 600;"
      />
    </div>

    <!-- Community — Sage Green light (together) -->
    <div class="col-6">
      <q-btn
        @click="$emit('community')"
        label="Community Challenge"
        icon="groups"
        unelevated
        class="full-width"
        style="background: #d6efd6; color: #2e4a2e; border: 1.5px solid #b8d4b0; border-radius: 10px; font-weight: 600;"
      />
    </div>

  </div>
</template>

<script>
export default {
  name: 'CravingToolbar',
  emits: ['crave', 'breathing', 'delay', 'tap', 'community'],
}
</script>