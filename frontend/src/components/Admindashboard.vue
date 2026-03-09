<!-- AdminDashboard.vue -->
<template>
  <div>
    <q-card class="q-mb-md shadow-lg" style="border-radius: 18px; overflow: hidden; border: 1.5px solid #b8d4b0;">

      <!-- Header — Light Sage Green -->
      <q-card-section style="background: linear-gradient(135deg, #7eab7e 0%, #5d9460 100%);" class="text-white">
        <div class="text-h5 text-weight-bold" style="letter-spacing: 0.3px;">
          <q-icon name="analytics" class="q-mr-sm" />Admin Dashboard
        </div>
      </q-card-section>

      <q-card-section style="background: #f5ead8;">

        <!-- Summary cards -->
        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-12 col-sm-6 col-md-3" v-for="card in summaryCards" :key="card.label">
            <q-card :style="card.style" style="border-radius: 14px; border: 1.5px solid; overflow: hidden;">
              <q-card-section class="q-pa-md">
                <div class="text-subtitle2 text-weight-medium" :style="{ color: card.labelColor }">{{ card.label }}</div>
                <div class="text-h4 text-weight-bold q-mt-xs" :style="{ color: card.valueColor }">{{ card.value }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- User list header -->
        <div class="text-h6 text-weight-bold q-mb-md" style="color: #2e4a2e;">
          <q-icon name="people" class="q-mr-sm" style="color: #7eab7e;" />All Users
        </div>

        <q-list separator style="border-radius: 12px; overflow: hidden; border: 1.5px solid #b8d4b0;">
          <q-item
            v-for="user in allUsers"
            :key="user.id"
            clickable
            @click="$emit('view-user', user)"
            class="q-pa-md user-row"
            style="background: #fdf5e8;"
          >
            <!-- Avatar -->
            <q-item-section avatar>
              <q-avatar
                size="52px"
                style="background: linear-gradient(135deg, #7eab7e, #5d9460); color: white; font-weight: 700;"
              >
                {{ user.name.charAt(0).toUpperCase() }}
              </q-avatar>
            </q-item-section>

            <!-- Details -->
            <q-item-section>
              <q-item-label class="text-h6 text-weight-bold" style="color: #2e4a2e;">{{ user.name }}</q-item-label>
              <q-item-label caption style="color: #5d9460;">
                <q-icon name="event" size="xs" class="q-mr-xs" />{{ user.daysSmokeeFree }} days smoke-free
              </q-item-label>
              <q-item-label caption style="color: #c97a8a;">
                <q-icon name="block" size="xs" class="q-mr-xs" />{{ user.cigarettesAvoided }} cigarettes avoided
              </q-item-label>
              <q-item-label caption style="color: #5d9460;">
                <q-icon name="savings" size="xs" class="q-mr-xs" />₱{{ user.moneySaved }} saved
              </q-item-label>

              <!-- Open badges -->
              <q-item-label caption class="q-mt-sm">
                <q-badge
                  class="q-mr-xs q-pa-xs"
                  style="background: #d6efd6; color: #2e4a2e; border-radius: 6px;"
                >
                  <q-icon name="smartphone" size="xs" class="q-mr-xs" />Today: {{ user.opensToday || 0 }}
                </q-badge>
                <q-badge
                  class="q-mr-xs q-pa-xs"
                  style="background: #f7dfe5; color: #7a3048; border-radius: 6px;"
                >
                  <q-icon name="calendar_month" size="xs" class="q-mr-xs" />Month: {{ user.opensThisMonth || 0 }}
                </q-badge>
                <q-badge
                  class="q-pa-xs"
                  style="background: #ede0c4; color: #7a6040; border-radius: 6px;"
                >
                  <q-icon name="timeline" size="xs" class="q-mr-xs" />Total: {{ user.totalOpens || 0 }}
                </q-badge>
              </q-item-label>
              <q-item-label caption class="q-mt-xs" style="color: #b09878;">
                Last activity: {{ formatDate(user.lastUpdated) }}
              </q-item-label>
            </q-item-section>

            <!-- Badge -->
            <q-item-section side>
              <q-badge
                :style="badgeStyle(user.daysSmokeeFree)"
                class="q-pa-sm"
                style="border-radius: 8px; font-weight: 600;"
              >
                {{ badgeLabel(user.daysSmokeeFree) }}
              </q-badge>
            </q-item-section>

            <q-item-section side>
              <q-icon name="chevron_right" style="color: #c8a87a;" />
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Empty state -->
        <div v-if="allUsers.length === 0" class="text-center q-pa-lg">
          <q-icon name="people_outline" size="64px" style="color: #b8d4b0;" />
          <div class="text-h6 q-mt-sm" style="color: #8aaa80;">No users found</div>
        </div>

      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

export default {
  name: 'AdminDashboard',

  props: {
    allUsers:              { type: Array,  required: true },
    totalMoneySaved:       { type: Number, required: true },
    totalCigarettesAvoided:{ type: Number, required: true },
    avgDaysSmokeeFree:     { type: Number, required: true },
  },

  emits: ['view-user'],

  computed: {
    summaryCards() {
      return [
        {
          label:      'Total Users',
          value:      this.allUsers.length,
          style:      'background: #e8f5e8; border-color: #b8d4b0;',
          labelColor: '#5d9460',
          valueColor: '#2e4a2e',
        },
        {
          label:      'Total Saved',
          value:      `₱${this.totalMoneySaved.toFixed(2)}`,
          style:      'background: #f5ead8; border-color: #ddc8a8;',
          labelColor: '#a87840',
          valueColor: '#5a3820',
        },
        {
          label:      'Total Avoided',
          // Dusty rose accent card
          value:      this.totalCigarettesAvoided,
          style:      'background: #fce8ee; border-color: #e8b4c0;',
          labelColor: '#c97a8a',
          valueColor: '#7a3048',
        },
        {
          label:      'Avg Days Free',
          value:      this.avgDaysSmokeeFree,
          style:      'background: #e8f5e8; border-color: #b8d4b0;',
          labelColor: '#5d9460',
          valueColor: '#2e4a2e',
        },
      ]
    },
  },

  methods: {
    formatDate(d) { return dayjs(d).fromNow() },

    // Champion → sage green, Strong → dusty rose, Beginner → warm beige
    badgeStyle(days) {
      if (days > 30) return 'background: #d6efd6; color: #2e4a2e;'
      if (days > 7)  return 'background: #f7dfe5; color: #7a3048;'
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

<style scoped>
.user-row {
  transition: background 0.2s ease;
}
.user-row:hover {
  background: #ede0c4 !important;
}
</style>