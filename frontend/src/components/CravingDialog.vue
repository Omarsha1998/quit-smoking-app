<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 350px; max-width: 500px">
      <q-card-section class="bg-blue-6 text-white">
        <div class="text-h6 text-weight-bold">
          <q-icon name="tips_and_updates" class="q-mr-sm" />Quick Tip to Beat Cravings
        </div>
      </q-card-section>
      <q-card-section class="q-pa-lg">
        <div class="text-center q-mb-md"><q-icon name="self_improvement" size="48px" color="blue-6" /></div>
        <p class="text-body1 text-blue-9 text-center" style="line-height: 1.8">{{ tip }}</p>
      </q-card-section>
      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat size="md" label="Got it, thanks!" color="blue-6" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'CravingDialog',
  props: {
    modelValue: { type: Boolean, required: true },
    tip:        { type: String,  required: true },
  },
  emits: ['update:modelValue'],
}
</script>