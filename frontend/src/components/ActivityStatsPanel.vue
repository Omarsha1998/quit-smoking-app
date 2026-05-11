<template>
  <q-card class="q-mb-md" style="border-radius: 16px; border: 1.5px solid #b8d4b0">
    <q-card-section
      style="background: linear-gradient(135deg, #7eab7e, #5d9460)"
      class="text-white"
    >
      <div class="text-h6 text-weight-bold">
        <q-icon name="bar_chart" class="q-mr-sm" />Activity Leaderboard
      </div>
    </q-card-section>

    <q-card-section style="background: #f5ead8">
      <div v-if="loadingActivities" class="text-center q-pa-md">
        <q-spinner color="green-6" size="32px" />
      </div>

      <div v-else-if="activities.length === 0" class="text-center q-pa-md">
        <q-icon name="bar_chart" size="48px" style="color: #b8d4b0" />
        <div class="text-subtitle2 q-mt-sm" style="color: #9aaa90">No activity data yet</div>
      </div>

      <div v-else class="row q-col-gutter-sm">
        <div v-for="(act, i) in activities" :key="act.activity" class="col-12 col-sm-4">
          <q-card
            clickable
            v-ripple
            @click="openDialog(act, i)"
            style="border-radius: 12px; cursor: pointer; border: 1.5px solid"
            :style="cardStyle(i)"
          >
            <q-card-section class="q-pa-md">
              <div class="row items-center q-mb-xs">
                <q-icon
                  :name="activityIcon(act.activity)"
                  size="22px"
                  class="q-mr-sm"
                  :style="{ color: iconColor(i) }"
                />
                <span class="text-weight-bold" style="font-size: 15px; color: #2e4a2e">
                  {{ activityLabel(act.activity) }}
                </span>
                <q-space />
                <q-badge :style="rankBadge(i)">{{ rankEmoji(i) }} #{{ i + 1 }}</q-badge>
              </div>
              <div class="text-h5 text-weight-bold q-mt-xs" :style="{ color: iconColor(i) }">
                {{ act.totalUses }}
              </div>
              <div class="text-caption" style="color: #9aaa90">
                total uses · {{ act.uniqueUsers }} users
              </div>
              <div class="row items-center q-mt-sm" :style="{ color: iconColor(i) }">
                <q-icon name="touch_app" size="14px" class="q-mr-xs" />
                <span class="text-caption text-weight-medium">Tap for breakdown</span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card-section>

    <!-- Breakdown Dialog -->
    <!-- Replace the entire q-dialog block -->
    <q-dialog v-model="showDialog">
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
        <q-card-section class="text-white row items-center" :style="dialogHeaderStyle">
          <div>
            <div class="text-h5 text-weight-bold">
              <q-icon :name="selectedIcon" class="q-mr-sm" />{{ selectedLabel }}
            </div>
            <div class="text-subtitle2" style="opacity: 0.85">User Breakdown</div>
          </div>
          <q-space />
          <div class="text-right">
            <div class="text-h5 text-weight-bold">{{ selectedActivity?.totalUses || 0 }}</div>
            <div class="text-caption" style="opacity: 0.85">total uses</div>
          </div>
        </q-card-section>

        <!-- Scrollable user list -->
        <q-card-section class="q-pa-0" style="background: #f5ead8">
          <q-scroll-area style="height: 380px">
            <q-list separator>
              <q-item
                v-for="(user, idx) in selectedActivity?.users || []"
                :key="user.deviceId"
                style="background: #fdf5e8; padding: 12px 16px"
              >
                <q-item-section avatar>
                  <q-avatar size="44px" :style="avatarStyle(idx)">
                    {{ user.name.charAt(0).toUpperCase() }}
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-bold" style="color: #2e4a2e">
                    {{ user.name }}
                  </q-item-label>
                  <q-item-label caption style="color: #9aaa90">
                    <q-icon name="schedule" size="12px" class="q-mr-xs" />
                    Last used: {{ formatDate(user.lastUsed) }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-badge
                    :style="useBadgeStyle(idx)"
                    style="font-size: 14px; padding: 6px 12px; border-radius: 8px; font-weight: 700"
                  >
                    {{ user.useCount }}×
                  </q-badge>
                </q-item-section>
              </q-item>

              <!-- Empty state -->
              <q-item v-if="!selectedActivity?.users?.length">
                <q-item-section class="text-center q-pa-xl">
                  <q-icon name="person_off" size="48px" style="color: #b8d4b0" />
                  <div class="text-subtitle2 q-mt-sm" style="color: #9aaa90">No users yet</div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </q-card-section>

        <!-- Footer -->
        <q-card-actions
          align="right"
          class="q-pa-md"
          style="background: #ede0c4; border-top: 1px solid #d4c4a0"
        >
          <q-btn flat label="Close" style="color: #5d9460; font-weight: 600" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script>
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

export default {
  name: 'ActivityStatsPanel',
  props: {
    activities: { type: Array, default: () => [] },
    loadingActivities: { type: Boolean, default: false },
  },
  data() {
    return {
      showDialog: false,
      selectedActivity: null,
      selectedIndex: 0,
    }
  },
  computed: {
    selectedLabel() {
      return this.activityLabel(this.selectedActivity?.activity)
    },
    selectedIcon() {
      return this.activityIcon(this.selectedActivity?.activity)
    },
    dialogHeaderStyle() {
      const gradients = [
        'background: linear-gradient(135deg, #7eab7e, #5d9460)',
        'background: linear-gradient(135deg, #c97a8a, #a85c6e)',
        'background: linear-gradient(135deg, #c8a870, #a87840)',
      ]
      return gradients[this.selectedIndex] || gradients[0]
    },
  },
  methods: {
    openDialog(act, index) {
      this.selectedActivity = act
      this.selectedIndex = index
      this.showDialog = true
    },
    activityLabel(a) {
      return { breathing: 'Breathing', tap_game: 'Tap Game', delay_timer: 'Delay Timer' }[a] || a
    },
    activityIcon(a) {
      return { breathing: 'air', tap_game: 'sports_esports', delay_timer: 'timer' }[a] || 'star'
    },
    rankEmoji(i) {
      return ['🥇', '🥈', '🥉'][i] || ''
    },
    cardStyle(i) {
      const styles = [
        'background: #e8f5e8; border-color: #b8d4b0;',
        'background: #fce8ee; border-color: #e8b4c0;',
        'background: #f5ead8; border-color: #ddc8a8;',
      ]
      return styles[i] || styles[2]
    },
    iconColor(i) {
      return ['#5d9460', '#c97a8a', '#a87840'][i] || '#7eab7e'
    },
    rankBadge(i) {
      const styles = [
        'background: #d6efd6; color: #2e4a2e;',
        'background: #f7dfe5; color: #7a3048;',
        'background: #ede0c4; color: #7a5038;',
      ]
      return (styles[i] || styles[2]) + ' border-radius: 6px; padding: 4px 8px; font-weight: 600;'
    },
    avatarStyle(i) {
      const bgs = [
        'background: linear-gradient(135deg, #7eab7e, #5d9460); color: white; font-weight: 700',
        'background: linear-gradient(135deg, #c97a8a, #a85c6e); color: white; font-weight: 700',
        'background: linear-gradient(135deg, #c8a870, #a87840); color: white; font-weight: 700',
      ]
      return bgs[i % 3]
    },
    useBadgeStyle(i) {
      const styles = [
        'background: #d6efd6; color: #2e4a2e;',
        'background: #f7dfe5; color: #7a3048;',
        'background: #ede0c4; color: #7a5038;',
      ]
      return styles[i % 3] || styles[0]
    },
    formatDate(d) {
      return dayjs(d).fromNow()
    },
  },
}
</script>
