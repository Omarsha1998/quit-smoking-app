<!-- AdminPinDialog.vue -->
<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 350px; border-radius: 20px; overflow: hidden; border: 1.5px solid #b8d4b0;">
      <q-card-section style="background: linear-gradient(135deg, #7eab7e 0%, #5d9460 100%);" class="text-white">
        <div class="text-h6 text-weight-bold text-center" style="letter-spacing: 0.5px;">
          <q-icon name="lock" class="q-mr-sm" />Admin Authentication
        </div>
      </q-card-section>

      <q-card-section class="q-pa-lg" style="background: #f5ead8;">
        <div class="text-center q-mb-md">
          <!-- Dusty rose icon for visual interest -->
          <q-icon name="admin_panel_settings" size="64px" style="color: #c97a8a;" />
        </div>

        <q-input
          :model-value="pin"
          @update:model-value="$emit('update:pin', $event)"
          type="password"
          label="Enter Admin PIN"
          outlined
          autofocus
          class="q-mb-md pin-input"
          @keyup.enter="$emit('verify')"
          style="--q-primary: #7eab7e;"
        >
          <template v-slot:prepend>
            <q-icon name="vpn_key" style="color: #7eab7e;" />
          </template>
        </q-input>

        <div class="text-caption text-center" style="color: #9aaa90;">
          Enter the 4-digit PIN to access the admin dashboard
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md" style="background: #ede0c4; border-top: 1px solid #d4c4a0;">
        <q-btn
          flat
          label="Cancel"
          @click="$emit('cancel')"
          style="color: #a85c6e; font-weight: 600;"
        />
        <q-btn
          unelevated
          label="Verify"
          @click="$emit('verify')"
          :disable="!pin || pin.length < 4"
          style="background: linear-gradient(135deg, #7eab7e, #5d9460); color: white; border-radius: 10px; padding: 6px 24px; font-weight: 600;"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'AdminPinDialog',
  props: {
    modelValue: { type: Boolean, required: true },
    pin:        { type: String,  default: '' },
  },
  emits: ['update:modelValue', 'update:pin', 'verify', 'cancel'],
}
</script>

<style scoped>
.pin-input :deep(.q-field__control) {
  border-radius: 12px;
  background: white;
}
.pin-input :deep(.q-field__label) {
  color: #9aaa90;
}
.pin-input :deep(.q-field--outlined .q-field__control:before) {
  border-color: #b8d4b0;
}
.pin-input :deep(.q-field--outlined.q-field--focused .q-field__control:after) {
  border-color: #7eab7e;
}
</style>