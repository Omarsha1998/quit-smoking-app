<!-- CravingDialog.vue -->
<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 350px; max-width: 500px; border-radius: 20px; overflow: hidden; border: 1.5px solid #b8d4b0;">

      <!-- Header — Light Sage Green -->
      <q-card-section style="background: linear-gradient(135deg, #7eab7e 0%, #5d9460 100%);" class="text-white">
        <div class="text-h6 text-weight-bold" style="letter-spacing: 0.5px;">
          <q-icon name="tips_and_updates" class="q-mr-sm" />Quick Tip to Beat Cravings
        </div>
      </q-card-section>

      <!-- Body — Honey Beige -->
      <q-card-section class="q-pa-lg" style="background: #f5ead8;">
        <div class="text-center q-mb-md">
          <!-- Dusty rose for the wellness icon — warmth & care -->
          <q-icon name="self_improvement" size="56px" style="color: #c97a8a;" />
        </div>
        <p class="text-body1 text-center q-mb-none" style="line-height: 1.8; color: #3a4a3a;">
          {{ tip }}
        </p>
      </q-card-section>

      <!-- Actions — Warm Beige -->
      <q-card-actions align="right" class="q-pa-md" style="background: #ede0c4; border-top: 1px solid #d4c4a0;">
        <q-btn
          flat
          size="md"
          label="Got it, thanks!"
          v-close-popup
          style="color: #5d9460; font-weight: 600;"
        />
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