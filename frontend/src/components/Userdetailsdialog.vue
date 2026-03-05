<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card>
      <q-card-section class="bg-blue-6 text-white">
        <div class="text-h5 text-weight-bold"><q-icon name="person" class="q-mr-sm" />{{ user?.name }}</div>
        <div class="text-subtitle2">User Details & Statistics</div>
      </q-card-section>

      <q-card-section v-if="user" class="q-pa-md">
        <!-- Avatar & badge -->
        <div class="text-center q-mb-lg">
          <q-avatar color="blue-6" text-color="white" size="80px" class="q-mb-md">{{ user.name.charAt(0).toUpperCase() }}</q-avatar>
          <div class="text-h6 text-weight-bold">{{ user.name }}</div>
          <q-badge :color="badgeColor(user.daysSmokeeFree)" text-color="white" class="q-mt-sm">{{ badgeLabel(user.daysSmokeeFree) }}</q-badge>
        </div>

        <!-- Stat mini-cards -->
        <div class="row q-col-gutter-sm q-mb-lg">
          <div class="col-4" v-for="card in miniCards" :key="card.label">
            <q-card :class="card.bg" class="text-center">
              <q-card-section class="q-pa-sm">
                <q-icon :name="card.icon" :color="card.color" size="md" />
                <div class="text-h6 text-weight-bold q-mt-xs" :class="card.valueColor">{{ card.value }}</div>
                <div class="text-caption" :class="card.labelColor">{{ card.label }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- App opens -->
        <q-list bordered separator class="rounded-borders q-mb-md">
          <q-item v-for="row in openRows" :key="row.label">
            <q-item-section avatar><q-avatar :color="row.avatarColor" :text-color="row.avatarText" :icon="row.icon" /></q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ row.label }}</q-item-label>
              <q-item-label caption>{{ row.caption }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge :color="row.badgeColor" text-color="white" class="q-px-md q-py-xs">{{ row.value }} times</q-badge>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Meta info -->
        <div class="text-caption text-grey-6">
          <div class="q-mb-xs"><q-icon name="calendar_today" size="xs" /> Quit Date: {{ formatFullDate(user.quitDate) }}</div>
          <div class="q-mb-xs"><q-icon name="smoking_rooms"  size="xs" /> Previous: {{ user.cigarettesPerDay }} cigarettes/day</div>
          <div>                <q-icon name="attach_money"   size="xs" /> Pack Price: ₱{{ user.pricePerPack }}</div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Close" color="blue-6" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: 'UserDetailsDialog',

  props: {
    modelValue: { type: Boolean, required: true },
    user:       { type: Object,  default: null  },
  },

  emits: ['update:modelValue'],

  computed: {
    miniCards() {
      if (!this.user) return []
      return [
        { icon: 'event',   color: 'blue-6',  bg: 'bg-blue-1',  valueColor: 'text-blue-9',  labelColor: 'text-blue-7',  label: 'Days Free', value: this.user.daysSmokeeFree  },
        { icon: 'block',   color: 'red-6',   bg: 'bg-red-1',   valueColor: 'text-red-9',   labelColor: 'text-red-7',   label: 'Avoided',   value: this.user.cigarettesAvoided },
        { icon: 'savings', color: 'green-6', bg: 'bg-green-1', valueColor: 'text-green-9', labelColor: 'text-green-7', label: 'Saved',     value: `₱${this.user.moneySaved}` },
      ]
    },
    openRows() {
      if (!this.user) return []
      return [
        { icon: 'today',          avatarColor: 'blue-2',   avatarText: 'blue-8',   badgeColor: 'blue-6',   label: "Today's Opens",  caption: 'Current day activity',   value: this.user.opensToday    || 0 },
        { icon: 'calendar_month', avatarColor: 'purple-2', avatarText: 'purple-8', badgeColor: 'purple-6', label: 'This Month',     caption: 'Current month activity', value: this.user.opensThisMonth || 0 },
        { icon: 'timeline',       avatarColor: 'grey-3',   avatarText: 'grey-8',   badgeColor: 'grey-7',   label: 'All Time',       caption: 'Total app opens',        value: this.user.totalOpens    || 0 },
      ]
    },
  },

  methods: {
    formatFullDate(d) { return dayjs(d).format('MMMM D, YYYY h:mm A') },
    badgeColor(days)  { return days > 30 ? 'green' : days > 7 ? 'orange' : 'blue' },
    badgeLabel(days)  { return days > 30 ? 'Champion' : days > 7 ? 'Strong' : 'Beginner' },
  },
}
</script>