<template>
  <div class="row q-col-gutter-sm q-mb-md">
    <div class="col-12">
      <q-btn
        @click="$emit('crave')"
        color="orange-6"
        label="Craving a cigarette? Get Help!"
        size="md"
        class="full-width animate-pulse"
        icon="help_outline"
      />
    </div>
    <div class="col-6">
      <q-btn @click="$emit('breathing')" color="teal-6"       label="Breathing Exercise" icon="air"           unelevated class="full-width" />
    </div>
    <div class="col-6">
      <q-btn @click="$emit('delay')"     color="purple-6"     label="5-Min Delay Timer"  icon="timer"          unelevated class="full-width" />
    </div>
    <div class="col-6">
      <q-btn @click="$emit('tap')"       color="deep-orange-5" label="Tap Challenge"      icon="sports_esports" unelevated class="full-width" />
    </div>
    <div class="col-6">
      <q-btn @click="$emit('community')" color="indigo-6"     label="Community Challenge" icon="groups"         unelevated class="full-width" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CravingToolbar',
  emits: ['crave', 'breathing', 'delay', 'tap', 'community'],
}
</script>