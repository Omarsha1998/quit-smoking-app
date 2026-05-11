<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card
      class="column no-wrap"
      style="
        border-radius: 20px;
        border: 1.5px solid #b8d4b0;
        min-width: 320px;
        max-width: 440px;
        width: 95vw;
        height: 85vh;
        max-height: 800px;
      "
    >
      <q-card-section
        style="background: linear-gradient(135deg, #7eab7e 0%, #5d9460 100%)"
        class="text-white row items-center no-wrap shadow-2"
      >
        <div class="ellipsis">
          <div class="text-h6 text-weight-bold ellipsis">
            <q-icon name="person" class="q-mr-sm" />{{ user?.name }}
          </div>
          <div class="text-subtitle2" style="opacity: 0.85">Details & Statistics</div>
        </div>
        <q-space />
        <q-btn flat round dense icon="close" v-close-popup />
      </q-card-section>

      <q-card-section class="col q-pa-none" v-if="user">
        <q-scroll-area style="height: 100%; background: #f5ead8">
          <div class="q-pa-md">
            <div class="text-center q-mb-lg">
              <q-avatar
                size="80px"
                class="q-mb-md shadow-3"
                style="background: linear-gradient(135deg, #7eab7e, #5d9460); color: white"
              >
                {{ user.name.charAt(0).toUpperCase() }}
              </q-avatar>
              <div class="text-h6 text-weight-bold" style="color: #2e4a2e">{{ user.name }}</div>
              <q-badge
                :style="badgeStyle(user.daysSmokeeFree)"
                class="q-mt-sm q-pa-sm"
                style="border-radius: 8px; font-weight: 600"
              >
                {{ badgeLabel(user.daysSmokeeFree) }}
              </q-badge>
            </div>

            <div class="row q-col-gutter-sm q-mb-lg">
              <div class="col-4" v-for="card in miniCards" :key="card.label">
                <q-card
                  flat
                  class="text-center"
                  :style="card.cardStyle"
                  style="border-radius: 12px; border: 1.5px solid"
                >
                  <q-card-section class="q-pa-xs">
                    <q-icon :name="card.icon" size="sm" :style="{ color: card.iconColor }" />
                    <div
                      class="text-subtitle1 text-weight-bold"
                      :style="{ color: card.valueColor }"
                    >
                      {{ card.value }}
                    </div>
                    <div
                      class="text-caption"
                      style="font-size: 10px"
                      :style="{ color: card.labelColor }"
                    >
                      {{ card.label }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <q-list
              separator
              class="q-mb-lg shadow-1"
              style="border-radius: 12px; overflow: hidden; border: 1.5px solid #b8d4b0"
            >
              <q-item v-for="row in openRows" :key="row.label" style="background: #fdf5e8">
                <q-item-section avatar
                  ><q-avatar size="32px" :style="row.avatarStyle" :icon="row.icon"
                /></q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium" style="color: #2e4a2e">{{
                    row.label
                  }}</q-item-label>
                  <q-item-label caption>{{ row.caption }}</q-item-label>
                </q-item-section>
                <q-item-section side
                  ><q-badge :style="row.badgeStyle" class="q-px-sm">{{
                    row.value
                  }}</q-badge></q-item-section
                >
              </q-item>
            </q-list>

            <div class="text-subtitle2 text-weight-bold q-mb-sm" style="color: #5d9460">
              Daily Log Tracking
            </div>
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-6">
                <q-card
                  flat
                  style="border-radius: 10px; background: #e8f5e8; border: 1.5px solid #b8d4b0"
                >
                  <q-card-section class="text-center">
                    <div class="text-h6 text-weight-bold" style="color: #2e4a2e">
                      {{ smokeFreeDaysCount }}
                    </div>
                    <div class="text-caption">Smoke-Free</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-6">
                <q-card
                  flat
                  clickable
                  v-ripple
                  @click="smokedDays.length ? (showSmokedDialog = true) : null"
                  style="border-radius: 10px; background: #fce8ee; border: 1.5px solid #e8b4c0"
                >
                  <q-card-section class="text-center">
                    <div class="text-h6 text-weight-bold" style="color: #7a3048">
                      {{ smokedDays.length }}
                    </div>
                    <div class="text-caption">Smoked Days</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <div
              class="text-caption q-mt-lg q-pa-md"
              style="color: #9aaa90; background: rgba(0, 0, 0, 0.03); border-radius: 12px"
            >
              <div>Quit Date: {{ formatFullDate(user.quitDate) }}</div>
              <div>Previous: {{ user.cigarettesPerDay }}/day</div>
              <div>Pack Price: ₱{{ user.pricePerPack }}</div>
            </div>
          </div>
        </q-scroll-area>
      </q-card-section>

      <q-card-actions
        align="right"
        class="q-pa-md"
        style="background: #ede0c4; border-top: 1px solid #d4c4a0"
      >
        <q-btn flat label="Close" color="green-9" class="text-weight-bold" v-close-popup />
      </q-card-actions>
    </q-card>

    <q-dialog v-model="showSmokedDialog">
      <q-card
        class="column no-wrap shadow-5"
        style="
          border-radius: 20px;
          border: 1.5px solid #e8b4c0;
          min-width: 320px;
          max-width: 400px;
          width: 90vw;
          height: 60vh; /* Fixed Height to prevent overflow */
          background: #fdf5e8;
        "
      >
        <q-card-section
          style="background: linear-gradient(135deg, #c97a8a, #a85c6e)"
          class="text-white row items-center no-wrap"
        >
          <div class="ellipsis">
            <div class="text-h6 text-weight-bold">Smoked Days</div>
            <div class="text-caption" style="opacity: 0.85">
              {{ smokedDays.length }} days · {{ totalCigarettesSmoked }} total
            </div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="col q-pa-none">
          <q-scroll-area style="height: 100%">
            <q-list separator>
              <q-item v-for="entry in smokedDays" :key="entry.date" class="q-py-md">
                <q-item-section avatar>
                  <q-avatar
                    size="38px"
                    style="background: #fce8ee; color: #c97a8a; font-weight: 700"
                  >
                    {{ entry.smokedCount }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold" style="color: #2e4a2e">{{
                    formatLogDate(entry.date)
                  }}</q-item-label>
                  <q-item-label caption>{{ entry.smokedCount }} cigarettes smoked</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge style="background: #f7dfe5; color: #7a3048; font-weight: 700"
                    >{{ entry.smokedCount }}×</q-badge
                  >
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </q-card-section>

        <q-card-actions
          align="right"
          class="q-pa-md"
          style="background: #ede0c4; border-top: 1px solid #e8b4c0"
        >
          <q-btn flat label="Close" color="brown-9" class="text-weight-bold" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: 'UserDetailsDialog',
  props: {
    modelValue: { type: Boolean, required: true },
    user: { type: Object, default: null },
    dailyLogs: { type: Array, default: () => [] },
  },
  emits: ['update:modelValue'],
  data() {
    return { showSmokedDialog: false }
  },
  watch: {
    user() {
      this.showSmokedDialog = false
    },
  },
  computed: {
    smokedDays() {
      return this.dailyLogs
        .filter((l) => l.smoked)
        .map((l) => ({ date: l.date, smokedCount: l.smokedCount || 0 }))
        .sort((a, b) => b.date.localeCompare(a.date))
    },
    smokeFreeDaysCount() {
      return this.dailyLogs.filter((l) => !l.smoked).length
    },
    totalDaysLogged() {
      return this.dailyLogs.length
    },
    totalCigarettesSmoked() {
      return this.dailyLogs.reduce((sum, l) => sum + (l.smokedCount || 0), 0)
    },
    miniCards() {
      if (!this.user) return []
      return [
        {
          icon: 'event',
          iconColor: '#7eab7e',
          valueColor: '#2e4a2e',
          labelColor: '#5d9460',
          cardStyle: 'background: #e8f5e8; border-color: #b8d4b0;',
          label: 'Days Free',
          value: this.user.daysSmokeeFree,
        },
        {
          icon: 'block',
          iconColor: '#c97a8a',
          valueColor: '#7a3048',
          labelColor: '#a85c6e',
          cardStyle: 'background: #fce8ee; border-color: #e8aab8;',
          label: 'Avoided',
          value: this.user.cigarettesAvoided,
        },
        {
          icon: 'savings',
          iconColor: '#a87840',
          valueColor: '#5a3820',
          labelColor: '#a87840',
          cardStyle: 'background: #f5ead8; border-color: #ddc8a8;',
          label: 'Saved',
          value: `₱${this.user.moneySaved}`,
        },
      ]
    },
    openRows() {
      if (!this.user) return []
      return [
        {
          icon: 'today',
          avatarStyle: 'background: #d6efd6; color: #5d9460;',
          badgeStyle: 'background: #7eab7e; color: white;',
          label: "Today's Opens",
          caption: 'Daily sessions',
          value: this.user.opensToday || 0,
        },
        {
          icon: 'calendar_month',
          avatarStyle: 'background: #fce8ee; color: #c97a8a;',
          badgeStyle: 'background: #c97a8a; color: white;',
          label: 'This Month',
          caption: 'Monthly sessions',
          value: this.user.opensThisMonth || 0,
        },
        {
          icon: 'timeline',
          avatarStyle: 'background: #ede0c4; color: #a87840;',
          badgeStyle: 'background: #c8a870; color: white;',
          label: 'All Time',
          caption: 'Total sessions',
          value: this.user.totalOpens || 0,
        },
      ]
    },
  },
  methods: {
    formatFullDate(d) {
      return dayjs(d).format('MMMM D, YYYY')
    },
    formatLogDate(d) {
      return dayjs(d).format('MMMM D, YYYY (ddd)')
    },
    badgeStyle(days) {
      if (days > 30) return 'background: #d6efd6; color: #2e4a2e;'
      if (days > 7) return 'background: #fce8ee; color: #7a3048;'
      return 'background: #ede0c4; color: #7a5038;'
    },
    badgeLabel(days) {
      if (days > 30) return 'Champion'
      if (days > 7) return 'Strong'
      return 'Beginner'
    },
  },
}
</script>
