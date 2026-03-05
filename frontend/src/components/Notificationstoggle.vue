<template>
  <q-card class="q-mb-md shadow-lg">
    <q-card-section>
      <div class="row items-center justify-between">
        <div>
          <div class="text-subtitle1 text-weight-bold text-blue-9">
            <q-icon name="notifications" class="q-mr-sm" color="blue-6" />Daily Reminders
          </div>
          <div class="text-caption text-grey-6">Get a daily motivational nudge at 9:00 AM</div>
        </div>
        <q-toggle
          :model-value="enabled"
          color="blue-6"
          @update:model-value="$emit('toggle', $event)"
        />
      </div>
      <div v-if="enabled" class="q-mt-sm">
        <q-badge color="green-6">✓ Reminders are ON</q-badge>
        <div class="text-caption text-grey-6 q-mt-xs">Next reminder: {{ nextReminderLabel }}</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: 'NotificationsToggle',

  props: {
    enabled: { type: Boolean, required: true },
  },

  emits: ['toggle'],

  computed: {
    nextReminderLabel() {
      const now = dayjs()
      return now.hour() < 9
        ? now.format('MMMM D') + ' at 9:00 AM'
        : now.add(1, 'day').format('MMMM D') + ' at 9:00 AM'
    },
  },
}
</script>