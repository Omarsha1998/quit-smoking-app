<!-- AdminPinDialog.vue -->
<template>
  <q-dialog :model-value="modelValue" persistent @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 350px">
      <q-card-section class="bg-blue-6 text-white">
        <div class="text-h6 text-weight-bold text-center"><q-icon name="lock" class="q-mr-sm" />Admin Authentication</div>
      </q-card-section>
      <q-card-section class="q-pa-lg">
        <div class="text-center q-mb-md"><q-icon name="admin_panel_settings" size="64px" color="blue-6" /></div>
        <q-input
          :model-value="pin"
          @update:model-value="$emit('update:pin', $event)"
          type="password"
          label="Enter Admin PIN"
          outlined
          autofocus
          color="blue-6"
          class="q-mb-md"
          @keyup.enter="$emit('verify')"
        >
          <template v-slot:prepend><q-icon name="vpn_key" /></template>
        </q-input>
        <div class="text-caption text-grey-6 text-center">Enter the 4-digit PIN to access admin dashboard</div>
      </q-card-section>
      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancel" color="red" @click="$emit('cancel')" />
        <q-btn unelevated label="Verify" color="blue-6" @click="$emit('verify')" :disable="!pin || pin.length < 4" />
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