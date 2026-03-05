<template>
  <div>
    <q-card class="q-mb-md shadow-lg">
      <q-card-section>
        <div class="text-h5 text-weight-bold q-mb-md text-blue-9">
          <q-icon name="analytics" class="q-mr-sm" color="blue-6" />Admin Dashboard
        </div>

        <!-- Summary cards -->
        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-12 col-sm-6 col-md-3" v-for="card in summaryCards" :key="card.label">
            <q-card :class="card.bg">
              <q-card-section>
                <div class="text-h6" :class="card.labelColor">{{ card.label }}</div>
                <div class="text-h3 text-weight-bold" :class="card.valueColor">{{ card.value }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- User list -->
        <div class="text-h6 text-weight-bold q-mb-md text-blue-9">
          <q-icon name="people" class="q-mr-sm" />All Users
        </div>
        <q-list separator>
          <q-item
            v-for="user in allUsers"
            :key="user.id"
            clickable
            @click="$emit('view-user', user)"
            class="q-pa-md"
          >
            <q-item-section avatar>
              <q-avatar color="blue-6" text-color="white" size="56px">{{ user.name.charAt(0).toUpperCase() }}</q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h6 text-weight-bold text-blue-9">{{ user.name }}</q-item-label>
              <q-item-label caption><q-icon name="event"   size="xs" color="blue"  /> {{ user.daysSmokeeFree }} days smoke-free</q-item-label>
              <q-item-label caption><q-icon name="block"   size="xs" color="red"   /> {{ user.cigarettesAvoided }} cigarettes avoided</q-item-label>
              <q-item-label caption><q-icon name="savings" size="xs" color="green" /> ₱{{ user.moneySaved }} saved</q-item-label>
              <q-item-label caption class="q-mt-sm">
                <q-badge color="blue-6"   class="q-mr-xs"><q-icon name="smartphone"    size="xs" class="q-mr-xs" />Today: {{ user.opensToday || 0 }}</q-badge>
                <q-badge color="indigo-6" class="q-mr-xs"><q-icon name="calendar_month" size="xs" class="q-mr-xs" />Month: {{ user.opensThisMonth || 0 }}</q-badge>
                <q-badge color="grey-6"               ><q-icon name="timeline"         size="xs" class="q-mr-xs" />Total: {{ user.totalOpens || 0 }}</q-badge>
              </q-item-label>
              <q-item-label caption class="text-grey-5 q-mt-xs">Last activity: {{ formatDate(user.lastUpdated) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge :color="badgeColor(user.daysSmokeeFree)" text-color="white" class="q-pa-sm">{{ badgeLabel(user.daysSmokeeFree) }}</q-badge>
            </q-item-section>
            <q-item-section side><q-icon name="chevron_right" color="grey" /></q-item-section>
          </q-item>
        </q-list>

        <div v-if="allUsers.length === 0" class="text-center q-pa-lg text-grey-6">
          <q-icon name="people_outline" size="64px" class="q-mb-md" />
          <div class="text-h6">No users found</div>
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
    allUsers:             { type: Array,  required: true },
    totalMoneySaved:      { type: Number, required: true },
    totalCigarettesAvoided:{ type: Number, required: true },
    avgDaysSmokeeFree:    { type: Number, required: true },
  },

  emits: ['view-user'],

  computed: {
    summaryCards() {
      return [
        { label: 'Total Users',   value: this.allUsers.length,                    bg: 'bg-blue-1',   labelColor: 'text-blue-8',  valueColor: 'text-blue-9'  },
        { label: 'Total Saved',   value: `₱${this.totalMoneySaved.toFixed(2)}`,   bg: 'bg-green-1',  labelColor: 'text-grey-8',  valueColor: 'text-green-8' },
        { label: 'Total Avoided', value: this.totalCigarettesAvoided,             bg: 'bg-red-1',    labelColor: 'text-grey-8',  valueColor: 'text-red-8'   },
        { label: 'Avg Days Free', value: this.avgDaysSmokeeFree,                  bg: 'bg-orange-1', labelColor: 'text-grey-8',  valueColor: 'text-orange-8'},
      ]
    },
  },

  methods: {
    formatDate(d)   { return dayjs(d).fromNow() },
    badgeColor(days){ return days > 30 ? 'green' : days > 7 ? 'orange' : 'blue' },
    badgeLabel(days){ return days > 30 ? 'Champion' : days > 7 ? 'Strong' : 'Beginner' },
  },
}
</script>