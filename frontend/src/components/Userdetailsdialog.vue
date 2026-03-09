<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="border-radius: 20px; overflow: hidden; border: 1.5px solid #b8d4b0; min-width: 340px;">

      <!-- Header — Light Sage Green -->
      <q-card-section style="background: linear-gradient(135deg, #7eab7e 0%, #5d9460 100%);" class="text-white">
        <div class="text-h5 text-weight-bold">
          <q-icon name="person" class="q-mr-sm" />{{ user?.name }}
        </div>
        <div class="text-subtitle2" style="opacity: 0.85;">User Details & Statistics</div>
      </q-card-section>

      <q-card-section v-if="user" class="q-pa-md" style="background: #f5ead8;">

        <!-- Avatar & badge -->
        <div class="text-center q-mb-lg">
          <q-avatar
            size="80px"
            class="q-mb-md"
            style="background: linear-gradient(135deg, #7eab7e, #5d9460); color: white; font-size: 2rem; font-weight: 700;"
          >
            {{ user.name.charAt(0).toUpperCase() }}
          </q-avatar>
          <div class="text-h6 text-weight-bold" style="color: #2e4a2e;">{{ user.name }}</div>
          <q-badge
            :style="badgeStyle(user.daysSmokeeFree)"
            class="q-mt-sm q-pa-sm"
            style="border-radius: 8px; font-weight: 600;"
          >
            {{ badgeLabel(user.daysSmokeeFree) }}
          </q-badge>
        </div>

        <!-- Stat mini-cards -->
        <div class="row q-col-gutter-sm q-mb-lg">
          <div class="col-4" v-for="card in miniCards" :key="card.label">
            <q-card
              class="text-center"
              :style="card.cardStyle"
              style="border-radius: 12px; border: 1.5px solid;"
            >
              <q-card-section class="q-pa-sm">
                <q-icon :name="card.icon" size="md" :style="{ color: card.iconColor }" />
                <div class="text-h6 text-weight-bold q-mt-xs" :style="{ color: card.valueColor }">{{ card.value }}</div>
                <div class="text-caption" :style="{ color: card.labelColor }">{{ card.label }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- App opens -->
        <q-list
          separator
          class="q-mb-md"
          style="border-radius: 12px; overflow: hidden; border: 1.5px solid #b8d4b0;"
        >
          <q-item
            v-for="row in openRows"
            :key="row.label"
            style="background: #fdf5e8;"
          >
            <q-item-section avatar>
              <q-avatar :style="row.avatarStyle" :icon="row.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium" style="color: #2e4a2e;">{{ row.label }}</q-item-label>
              <q-item-label caption style="color: #9aaa90;">{{ row.caption }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge
                :style="row.badgeStyle"
                class="q-px-md q-py-xs"
                style="border-radius: 8px; font-weight: 600;"
              >
                {{ row.value }} times
              </q-badge>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Meta info -->
        <div class="text-caption" style="color: #9aaa90;">
          <div class="q-mb-xs"><q-icon name="calendar_today" size="xs" /> Quit Date: {{ formatFullDate(user.quitDate) }}</div>
          <div class="q-mb-xs"><q-icon name="smoking_rooms"  size="xs" /> Previous: {{ user.cigarettesPerDay }} cigarettes/day</div>
          <div>                <q-icon name="attach_money"   size="xs" /> Pack Price: ₱{{ user.pricePerPack }}</div>
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions align="right" class="q-pa-md" style="background: #ede0c4; border-top: 1px solid #d4c4a0;">
        <q-btn flat label="Close" style="color: #5d9460; font-weight: 600;" v-close-popup />
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
        {
          icon: 'event', iconColor: '#7eab7e', valueColor: '#2e4a2e', labelColor: '#5d9460',
          cardStyle: 'background: #e8f5e8; border-color: #b8d4b0;',
          label: 'Days Free', value: this.user.daysSmokeeFree,
        },
        {
          icon: 'block', iconColor: '#c97a8a', valueColor: '#7a3048', labelColor: '#a85c6e',
          cardStyle: 'background: #fce8ee; border-color: #e8aab8;',
          label: 'Avoided', value: this.user.cigarettesAvoided,
        },
        {
          icon: 'savings', iconColor: '#a87840', valueColor: '#5a3820', labelColor: '#a87840',
          cardStyle: 'background: #f5ead8; border-color: #ddc8a8;',
          label: 'Saved', value: `₱${this.user.moneySaved}`,
        },
      ]
    },

    openRows() {
      if (!this.user) return []
      return [
        {
          icon: 'today',
          avatarStyle: 'background: #d6efd6; color: #5d9460;',
          badgeStyle:  'background: #7eab7e; color: white;',
          label: "Today's Opens", caption: 'Current day activity',
          value: this.user.opensToday || 0,
        },
        {
          icon: 'calendar_month',
          avatarStyle: 'background: #fce8ee; color: #c97a8a;',
          badgeStyle:  'background: #c97a8a; color: white;',
          label: 'This Month', caption: 'Current month activity',
          value: this.user.opensThisMonth || 0,
        },
        {
          icon: 'timeline',
          avatarStyle: 'background: #ede0c4; color: #a87840;',
          badgeStyle:  'background: #c8a870; color: white;',
          label: 'All Time', caption: 'Total app opens',
          value: this.user.totalOpens || 0,
        },
      ]
    },
  },

  methods: {
    formatFullDate(d) { return dayjs(d).format('MMMM D, YYYY h:mm A') },

    badgeStyle(days) {
      if (days > 30) return 'background: #d6efd6; color: #2e4a2e;'
      if (days > 7)  return 'background: #fce8ee; color: #7a3048;'
      return                'background: #ede0c4; color: #7a5038;'
    },

    badgeLabel(days) {
      if (days > 30) return 'Champion'
      if (days > 7)  return 'Strong'
      return                'Beginner'
    },
  },
}
</script>