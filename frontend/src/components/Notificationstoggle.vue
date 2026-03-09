<template>
  <q-card class="q-mb-md shadow-lg" style="border-radius: 18px; overflow: hidden; border: 1.5px solid #b8d4b0;">
    <q-card-section style="background: #f5ead8;">
      <div class="row items-center justify-between">
        <div>
          <div class="text-subtitle1 text-weight-bold" style="color: #2e4a2e;">
            <q-icon name="notifications" class="q-mr-sm" style="color: #7eab7e;" />Daily Reminders
          </div>
          <div class="text-caption" style="color: #9aaa90;">Get a daily motivational nudge at 9:00 AM</div>
        </div>
        <q-toggle
          :model-value="enabled"
          :color="enabled ? 'green-6' : 'grey-5'"
          @update:model-value="$emit('toggle', $event)"
        />
      </div>

      <div v-if="enabled" class="q-mt-sm">
        <q-badge
          style="background: #d6efd6; color: #2e4a2e; border-radius: 6px; padding: 4px 10px; font-weight: 600;"
        >
          ✓ Reminders are ON
        </q-badge>
        <div class="text-caption q-mt-xs" style="color: #9aaa90;">
          Next reminder: {{ nextReminderLabel }}
        </div>
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