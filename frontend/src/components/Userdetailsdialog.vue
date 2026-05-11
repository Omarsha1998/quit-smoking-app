<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card
      style="
        border-radius: 20px;
        overflow: hidden;
        border: 1.5px solid #b8d4b0;
        min-width: 340px;
        max-width: 420px;
        width: 100%;
      "
    >
      <!-- Header -->
      <q-card-section
        style="background: linear-gradient(135deg, #7eab7e 0%, #5d9460 100%)"
        class="text-white row items-center"
      >
        <div>
          <div class="text-h5 text-weight-bold">
            <q-icon name="person" class="q-mr-sm" />{{ user?.name }}
          </div>
          <div class="text-subtitle2" style="opacity: 0.85">User Details & Statistics</div>
        </div>
        <q-space />
        <q-btn flat round dense icon="close" v-close-popup />
      </q-card-section>

      <q-scroll-area style="height: 78vh">
        <q-card-section v-if="user" class="q-pa-md" style="background: #f5ead8">
          <!-- Avatar & badge -->
          <div class="text-center q-mb-lg">
            <q-avatar
              size="80px"
              class="q-mb-md"
              style="
                background: linear-gradient(135deg, #7eab7e, #5d9460);
                color: white;
                font-size: 2rem;
                font-weight: 700;
              "
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

          <!-- Stat mini-cards -->
          <div class="row q-col-gutter-sm q-mb-lg">
            <div class="col-4" v-for="card in miniCards" :key="card.label">
              <q-card
                class="text-center"
                :style="card.cardStyle"
                style="border-radius: 12px; border: 1.5px solid"
              >
                <q-card-section class="q-pa-sm">
                  <q-icon :name="card.icon" size="md" :style="{ color: card.iconColor }" />
                  <div class="text-h6 text-weight-bold q-mt-xs" :style="{ color: card.valueColor }">
                    {{ card.value }}
                  </div>
                  <div class="text-caption" :style="{ color: card.labelColor }">
                    {{ card.label }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- App opens -->
          <q-list
            separator
            class="q-mb-lg"
            style="border-radius: 12px; overflow: hidden; border: 1.5px solid #b8d4b0"
          >
            <q-item v-for="row in openRows" :key="row.label" style="background: #fdf5e8">
              <q-item-section avatar>
                <q-avatar :style="row.avatarStyle" :icon="row.icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium" style="color: #2e4a2e">{{
                  row.label
                }}</q-item-label>
                <q-item-label caption style="color: #9aaa90">{{ row.caption }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge
                  :style="row.badgeStyle"
                  class="q-px-md q-py-xs"
                  style="border-radius: 8px; font-weight: 600"
                >
                  {{ row.value }} times
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>

          <!-- ── Daily Log Tracking ───────────────────────────────────────── -->
          <div class="text-subtitle2 text-weight-bold q-mb-sm" style="color: #5d9460">
            <q-icon name="event_note" size="18px" class="q-mr-xs" />Daily Log Tracking
          </div>

          <!-- Summary 2-cards -->
          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-6">
              <q-card style="border-radius: 10px; background: #e8f5e8; border: 1.5px solid #b8d4b0">
                <q-card-section class="q-pa-sm text-center">
                  <div class="text-h6 text-weight-bold" style="color: #2e4a2e">
                    {{ smokeFreeDaysCount }}
                  </div>
                  <div class="text-caption" style="color: #5d9460">Smoke-Free Days</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-6">
              <q-card
                clickable
                v-ripple
                @click="smokedDays.length ? (showSmokedDialog = true) : null"
                style="
                  border-radius: 10px;
                  background: #fce8ee;
                  border: 1.5px solid #e8b4c0;
                  cursor: pointer;
                "
              >
                <q-card-section class="q-pa-sm text-center">
                  <div class="text-h6 text-weight-bold" style="color: #7a3048">
                    {{ smokedDays.length }}
                  </div>
                  <div class="text-caption" style="color: #c97a8a">
                    Smoked Days
                    <q-icon v-if="smokedDays.length" name="touch_app" size="10px" />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Progress bar -->
          <div v-if="totalDaysLogged > 0" class="q-mb-md">
            <q-linear-progress
              :value="smokeFreeDaysCount / totalDaysLogged"
              color="green-6"
              track-color="red-2"
              rounded
              size="10px"
            />
            <div class="text-caption text-center q-mt-xs" style="color: #9aaa90">
              {{ smokeFreeDaysCount }} smoke-free out of {{ totalDaysLogged }} logged days
            </div>
          </div>

          <div v-else class="text-caption text-center q-mb-md" style="color: #b8d4b0">
            No daily logs yet
          </div>

          <!-- Meta info -->
          <div class="text-caption q-mt-sm" style="color: #9aaa90">
            <div class="q-mb-xs">
              <q-icon name="calendar_today" size="xs" /> Quit Date:
              {{ formatFullDate(user.quitDate) }}
            </div>
            <div class="q-mb-xs">
              <q-icon name="smoking_rooms" size="xs" /> Previous:
              {{ user.cigarettesPerDay }} cigarettes/day
            </div>
            <div><q-icon name="attach_money" size="xs" /> Pack Price: ₱{{ user.pricePerPack }}</div>
          </div>
        </q-card-section>
      </q-scroll-area>

      <!-- Actions -->
      <q-card-actions
        align="right"
        class="q-pa-md"
        style="background: #ede0c4; border-top: 1px solid #d4c4a0"
      >
        <q-btn flat label="Close" style="color: #5d9460; font-weight: 600" v-close-popup />
      </q-card-actions>
    </q-card>

    <!-- ── Smoked Dates Dialog ──────────────────────────────────────────────── -->
    <q-dialog v-model="showSmokedDialog">
      <q-card
        style="
          border-radius: 20px;
          overflow: hidden;
          border: 1.5px solid #e8b4c0;
          min-width: 320px;
          max-width: 400px;
          width: 100%;
        "
      >
        <!-- Header -->
        <q-card-section
          style="background: linear-gradient(135deg, #c97a8a, #a85c6e)"
          class="text-white row items-center"
        >
          <div>
            <div class="text-h6 text-weight-bold">
              <q-icon name="smoking_rooms" class="q-mr-sm" />Smoked Days
            </div>
            <div class="text-caption" style="opacity: 0.85">
              {{ smokedDays.length }} days · {{ totalCigarettesSmoked }} total cigarettes
            </div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <!-- List -->
        <q-scroll-area style="height: 50vh">
          <q-list separator style="background: white">
            <q-item v-for="entry in smokedDays" :key="entry.date" style="padding: 10px 16px">
              <q-item-section avatar>
                <q-avatar
                  size="38px"
                  style="background: #fce8ee; color: #c97a8a; font-weight: 700; font-size: 13px"
                >
                  {{ entry.smokedCount }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold" style="color: #2e4a2e; font-size: 13px">
                  {{ formatLogDate(entry.date) }}
                </q-item-label>
                <q-item-label caption style="color: #9aaa90">
                  {{ entry.smokedCount }} cigarette{{ entry.smokedCount !== 1 ? 's' : '' }} smoked
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge
                  style="
                    background: #f7dfe5;
                    color: #7a3048;
                    border-radius: 6px;
                    padding: 4px 10px;
                    font-weight: 700;
                  "
                >
                  {{ entry.smokedCount }}×
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
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
    return {
      showSmokedDialog: false,
    }
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
          caption: 'Current day activity',
          value: this.user.opensToday || 0,
        },
        {
          icon: 'calendar_month',
          avatarStyle: 'background: #fce8ee; color: #c97a8a;',
          badgeStyle: 'background: #c97a8a; color: white;',
          label: 'This Month',
          caption: 'Current month activity',
          value: this.user.opensThisMonth || 0,
        },
        {
          icon: 'timeline',
          avatarStyle: 'background: #ede0c4; color: #a87840;',
          badgeStyle: 'background: #c8a870; color: white;',
          label: 'All Time',
          caption: 'Total app opens',
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
