<template>
  <q-page class="bg-gradient pf-page-wrap">

    <div v-if="!deviceId || !hasStarted" class="q-pa-md">
      <RegistrationCard v-if="!deviceId" @register="handleRegister" />
      <SetupForm v-else-if="!hasStarted" :user-name="userName" @start="handleStart" />
    </div>

    <template v-else>
      <div class="pf-tab-content q-pa-md">

        <template v-if="showAdmin">
          <q-btn @click="showAdmin = false" label="Back" icon="arrow_back" class="q-mb-md admin-toggle-btn" flat size="md" />
          <AdminDashboard :all-users="allUsers" :total-money-saved="totalMoneySaved" :total-cigarettes-avoided="totalCigarettesAvoided" :avg-days-smokee-free="avgDaysSmokeeFree" @view-user="openUserDetails" />
        </template>

        <template v-else-if="activeTab === 'home'">
          <div class="text-center q-mb-lg animate-fade-in dashboard-header q-pa-md">
            <div class="text-h4 text-weight-bold" style="color: var(--pf-text-dark);">{{ userName }}'s Progress</div>
            <div class="text-subtitle1" style="color: var(--pf-text-mid);">Keep going, you're doing great! 🌿</div>
          </div>
          <DailyCheckIn :today-date-label="todayDateLabel" :today-logged="todayLogged" :today-smoked="todaySmoked" :today-smoked-count="todaySmokedCount" :current-streak="currentStreak" :total-smoke-freedays="totalSmokeFreedays" :cigarettes-per-day="Number(cigarettesPerDay)" @log="onLogDay" />
          <StatsGrid :stats="stats" />
          <CravingToolbar @crave="openCraving" @breathing="openBreathingDialog" @delay="openDelayDialog" @tap="openTapDialog" @community="openCommunityDialog" />
          <MotivationalCarousel :quotes="MOTIVATIONAL_QUOTES" />
          <q-card v-if="stats.totalDaysSinceQuit > 0" class="q-mb-md" style="border-radius:16px; background:#f5ead8; border:1.5px solid #ddc8a8;">
            <q-card-section>
              <div class="text-subtitle2 text-weight-bold q-mb-sm" style="color:#5d9460;">
                📊 Your Journey Breakdown
              </div>
              <div class="row q-col-gutter-sm text-center">
                <div class="col-4">
                  <div class="text-h6 text-weight-bold" style="color:#2e4a2e;">{{ stats.totalDaysSinceQuit }}</div>
                  <div class="text-caption" style="color:#9aaa90;">Days Since Quit</div>
                </div>
                <div class="col-4">
                  <div class="text-h6 text-weight-bold" style="color:#c97a8a;">{{ stats.smokedDaysCount }}</div>
                  <div class="text-caption" style="color:#9aaa90;">Days Smoked</div>
                </div>
                <div class="col-4">
                  <div class="text-h6 text-weight-bold" style="color:#5d9460;">{{ stats.days }}</div>
                  <div class="text-caption" style="color:#9aaa90;">Smoke-Free Days</div>
                </div>
              </div>
              <q-linear-progress
                :value="stats.days / stats.totalDaysSinceQuit"
                color="green-6"
                track-color="red-2"
                rounded
                size="10px"
                class="q-mt-md"
              />
              <div class="text-caption text-center q-mt-xs" style="color:#9aaa90;">
                {{ stats.days }} smoke-free out of {{ stats.totalDaysSinceQuit }} days
              </div>
            </q-card-section>
          </q-card>

          <VirtualPlant :smoke-days="stats.days" :relapse-today="todaySmoked" />
          <MysteryRewardBox :smoke-days="stats.days" />
        </template>
        <template v-else-if="activeTab === 'tips'">
          <div class="tab-page-header q-mb-md">
            <q-icon name="school" size="28px" style="color: #7eab7e;" class="q-mr-sm" />
            <span class="text-h5 text-weight-bold" style="color: var(--pf-text-dark);">Tips &amp; Education</span>
          </div>
          <InfoList title="Health Milestones" icon="trending_up" header-color="pf-header-green" badge-color="pf-badge-green" text-color="pf-text-green" :items="HEALTH_MILESTONES">
            <template #avatar="{ }"><q-avatar style="background: var(--pf-green-pale); color: var(--pf-green-mid);" icon="check_circle" /></template>
            <template #item="{ item }">
              <q-item-label class="text-weight-bold" style="color: var(--pf-text-dark);">{{ item.time }}</q-item-label>
              <q-item-label caption style="color: var(--pf-text-mid);">{{ item.benefit }}</q-item-label>
            </template>
          </InfoList>
          <InfoList title="Educational Tips" icon="school" header-color="pf-header-beige" badge-color="pf-badge-beige" text-color="pf-text-beige" :items="EDUCATIONAL_TIPS" />
          <InfoList title="Health Benefits of Quitting" icon="favorite" header-color="pf-header-green" badge-color="pf-badge-green" text-color="pf-text-green" :items="HEALTH_BENEFITS" />
          <InfoList title="Risk Factors of Smoking" icon="warning" header-color="pf-header-rose" badge-color="pf-badge-rose" text-color="pf-text-rose" :items="RISK_FACTORS" />
        </template>

        <template v-else-if="activeTab === 'track'">
          <div class="tab-page-header q-mb-md">
            <q-icon name="show_chart" size="28px" style="color: #7eab7e;" class="q-mr-sm" />
            <span class="text-h5 text-weight-bold" style="color: var(--pf-text-dark);">My Progress</span>
          </div>
          <CigarettesGraph :total-days="stats.days" :cigarettes-per-day="Number(cigarettesPerDay)" :daily-logs="dailyLogs" />
          <SavingsBreakdown :daily="dailySavings" :weekly="weeklySavings" :monthly="monthlySavings" :stats="stats" :cigarettes-per-day="Number(cigarettesPerDay)" :price-per-pack="Number(pricePerPack)" />          <HealthTimeline :smoke-days="stats.days" :cigarettes-per-day="Number(cigarettesPerDay)" :price-per-pack="Number(pricePerPack)" />
          <DiseaseRiskCountdown :milestones="diseaseRiskMilestones" />
          <NotificationsToggle :enabled="notificationsEnabled" @toggle="toggleNotifications" />
        </template>

        <template v-else-if="activeTab === 'more'">
          <div class="tab-page-header q-mb-md">
            <q-icon name="more_horiz" size="28px" style="color: #7eab7e;" class="q-mr-sm" />
            <span class="text-h5 text-weight-bold" style="color: var(--pf-text-dark);">More</span>
          </div>
          <q-card class="q-mb-md" style="border-radius: 16px;">
            <q-card-section style="background: #faf2e4;">
              <div class="row items-center q-gutter-md">
                <q-avatar size="56px" style="background: linear-gradient(135deg, #7eab7e, #5d9460); color: white; font-size: 1.5rem; font-weight: 700;">{{ userName.charAt(0).toUpperCase() }}</q-avatar>
                <div>
                  <div class="text-h6 text-weight-bold" style="color: #2e4a2e;">{{ userName }}</div>
                  <div class="text-caption" style="color: #9aaa90;">{{ stats.days }} days smoke-free</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
          <q-card class="q-mb-md" style="border-radius: 16px;">
            <q-list style="background: #faf2e4; border-radius: 16px;">
              <q-item v-if="isAdmin" clickable @click="openAdminFromMore" style="border-radius: 12px 12px 0 0;">
                <q-item-section avatar><q-avatar style="background: linear-gradient(135deg, #7eab7e, #5d9460); color: white;" icon="admin_panel_settings" /></q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold" style="color: #2e4a2e;">Admin Dashboard</q-item-label>
                  <q-item-label caption style="color: #9aaa90;">View all users &amp; stats</q-item-label>
                </q-item-section>
                <q-item-section side><q-icon name="chevron_right" style="color: #b8d4b0;" /></q-item-section>
              </q-item>
              <q-separator v-if="isAdmin" style="background: #ede0c4;" />
              <q-item clickable @click="openCommunityDialog">
                <q-item-section avatar><q-avatar style="background: #d6efd6; color: #5d9460;" icon="groups" /></q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold" style="color: #2e4a2e;">Community Challenge</q-item-label>
                  <q-item-label caption style="color: #9aaa90;">Join &amp; encourage others</q-item-label>
                </q-item-section>
                <q-item-section side><q-icon name="chevron_right" style="color: #b8d4b0;" /></q-item-section>
              </q-item>
              <q-separator style="background: #ede0c4;" />
              <q-item clickable style="border-radius: 0 0 12px 12px;">
                <q-item-section avatar><q-avatar style="background: #fce8ee; color: #c97a8a;" icon="notifications" /></q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold" style="color: #2e4a2e;">Notifications</q-item-label>
                  <q-item-label caption style="color: #9aaa90;">{{ notificationsEnabled ? 'Daily reminders ON' : 'Daily reminders OFF' }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle :model-value="notificationsEnabled" color="green-6" @update:model-value="toggleNotifications" @click.stop />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
          <q-btn @click="handleReset" label="Reset Progress" size="md" class="full-width reset-btn q-mt-sm" flat />
        </template>

      </div>
    </template>

    <!-- DIALOGS -->
    <CravingDialog v-model="showCravingDialog" :tip="activeCravingTip" />
    <BreathingDialog v-model="showBreathingDialog" :breathing-started="breathingStarted" :breathing-done="breathingDone" :breath-phase="breathPhase" :breath-countdown="breathCountdown" :breath-cycles-done="breathCyclesDone" :breath-total-cycles="breathTotalCycles" :breath-label="breathLabel" :breath-phase-full="breathPhaseFull" :circle-style="breathCircleStyle" :breath-progress="breathProgress" @start="startBreathing" @stop="stopBreathing" />
    <DelayTimerDialog v-model="showDelayDialog" :delay-started="delayStarted" :delay-done="delayDone" :delay-minutes="delayMinutes" :delay-seconds="delaySeconds" :delay-progress="delayProgress" :delay-message="delayMessage" @start="startDelayTimer" @stop="stopDelayTimer" />
    <TapGameDialog v-model="showTapGameDialog" :tap-game-started="tapGameStarted" :tap-game-done="tapGameDone" :tap-count="tapCount" :tap-time-left="tapTimeLeft" :tap-progress="tapProgress" :result-message="tapResultMessage" :hits-to-destroy="60" @start="startTapGame" @stop="stopTapGame" @reset="resetTapGame" @tap="registerTap" />

    <CommunityDialog
      v-model="showCommunityDialog"
      :joined-challenge="joinedChallenge"
      :community-participants="communityParticipants"
      :new-message="newMessage"
      :encouragement-messages="encouragementMessages"
      :leaderboard="leaderboard"
      :smoke-days="stats.days"
      :loading-messages="loadingMessages"
      :loading-leaderboard="loadingLeaderboard"
      :is-posting="isPosting"
      :is-joining="isJoining"
      @update:new-message="newMessage = $event"
      @join="onJoinChallenge"
      @post="onPostEncouragement"
    />

    <UserDetailsDialog v-model="showUserDialog" :user="selectedUser" />
    <AdminPinDialog v-model="showPinDialog" :pin="adminPin" @update:pin="adminPin = $event" @verify="verifyPin" @cancel="closePinDialog" />

  </q-page>
</template>

<script>
import { ref } from 'vue'
import { LocalStorage } from 'quasar'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { LocalNotifications } from '@capacitor/local-notifications'
import VirtualPlant     from '../components/VirtualPlant.vue'
import MysteryRewardBox from '../components/MysteryRewardBox.vue'
import HealthTimeline   from '../components/HealthTimeline.vue'

import { CRAVING_TIPS, MOTIVATIONAL_QUOTES, HEALTH_MILESTONES, EDUCATIONAL_TIPS, RISK_FACTORS, HEALTH_BENEFITS } from '../constants/content'
import { useStats }      from '../composables/useStats'
import { useDailyLog }   from '../composables/useDailyLog'
import { useSync }       from '../composables/useSync'
import { useBreathing }  from '../composables/useBreathing'
import { useDelayTimer } from '../composables/useDelayTimer'
import { useTapGame }    from '../composables/useTapGame'

import RegistrationCard     from '../components/RegistrationCard.vue'
import SetupForm            from '../components/SetupForm.vue'
import DailyCheckIn         from '../components/DailyCheckIn.vue'
import StatsGrid            from '../components/StatsGrid.vue'
import SavingsBreakdown     from '../components/SavingsBreakdown.vue'
import CigarettesGraph      from '../components/CigarettesGraph.vue'
import DiseaseRiskCountdown from '../components/DiseaseRiskCountdown.vue'
import CravingToolbar       from '../components/CravingToolbar.vue'
import MotivationalCarousel from '../components/MotivationalCarousel.vue'
import NotificationsToggle  from '../components/NotificationsToggle.vue'
import InfoList             from '../components/InfoList.vue'
import AdminDashboard       from '../components/AdminDashboard.vue'
import CravingDialog        from '../components/CravingDialog.vue'
import BreathingDialog      from '../components/BreathingDialog.vue'
import DelayTimerDialog     from '../components/DelayTimerDialog.vue'
import TapGameDialog        from '../components/TapGameDialog.vue'
import CommunityDialog      from '../components/CommunityDialog.vue'
import AdminPinDialog       from '../components/AdminPinDialog.vue'
import UserDetailsDialog    from '../components/UserDetailsDialog.vue'
import { userAPI } from '../services/api'

dayjs.extend(relativeTime)

const ALIAS_ADJECTIVES = ['Brave','Calm','Daring','Earnest','Free','Gentle','Hopeful','Iron','Joyful','Kind','Lively','Mighty','Noble','Open','Peaceful','Quiet','Resilient','Strong','True','Unbound','Vital','Warm','Xtra','Young','Zen']
const ALIAS_NOUNS      = ['Badger','Cedar','Dove','Eagle','Finch','Grove','Hawk','Iris','Jade','Kite','Leaf','Maple','Nest','Oak','Pine','Quail','Robin','Sage','Teal','Uma','Vine','Wren','Xylo','Yarrow','Zephyr']
function generateAlias() {
  const adj  = ALIAS_ADJECTIVES[Math.floor(Math.random() * ALIAS_ADJECTIVES.length)]
  const noun = ALIAS_NOUNS[Math.floor(Math.random() * ALIAS_NOUNS.length)]
  const num  = Math.floor(Math.random() * 90) + 10
  return `${adj}${noun}${num}`
}

export default {
  name: 'IndexPage',
  components: {
    RegistrationCard, SetupForm, DailyCheckIn, StatsGrid, SavingsBreakdown, CigarettesGraph,
    DiseaseRiskCountdown, CravingToolbar, MotivationalCarousel, NotificationsToggle, InfoList,
    AdminDashboard, CravingDialog, BreathingDialog, DelayTimerDialog, TapGameDialog,
    CommunityDialog, AdminPinDialog, UserDetailsDialog, VirtualPlant, MysteryRewardBox, HealthTimeline,
  },
  props: { activeTab: { type: String, default: 'home' } },
  emits: ['tab-change'],

  data() {
    return {
      deviceId: '', userName: '', hasStarted: false, quitDate: '', cigarettesPerDay: '', pricePerPack: '',
      stats: { days: 0, hours: 0, minutes: 0, cigarettesAvoided: 0, moneySaved: 0, lifeRegained: 0, healthBoost: 0 },
      dailySavings: 0, weeklySavings: 0, monthlySavings: 0, diseaseRiskMilestones: [],
      dailyLogs: [], todayLogged: false, todaySmoked: false, todaySmokedCount: 0,
      todayDateLabel: '', currentStreak: 0, totalSmokeFreedays: 0,
      notificationsEnabled: false, notificationInterval: null,
      showCravingDialog: false, activeCravingTip: '',
      showBreathingDialog: false, breathingStarted: false, breathingDone: false,
      breathPhase: 'inhale', breathCountdown: 4, breathCyclesDone: 0, breathTotalCycles: 6,
      breathLabel: 'Inhale', breathPhaseFull: '', breathCircleStyle: {}, breathProgress: 0,
      showDelayDialog: false, delayStarted: false, delayDone: false,
      delayMinutes: 5, delaySeconds: 0, delayProgress: 0, delayMessage: '',
      showTapGameDialog: false, tapGameStarted: false, tapGameDone: false,
      tapCount: 0, tapTimeLeft: 60, tapProgress: 0, tapResultMessage: '',
      // Community — real DB-backed
      showCommunityDialog: false,
      joinedChallenge: false,
      communityParticipants: 0,
      myAlias: '',
      newMessage: '',
      encouragementMessages: [],
      leaderboard: [],
      loadingMessages: false,
      loadingLeaderboard: false,
      isPosting: false,
      isJoining: false,
      // Admin
      showAdmin: false, isAdmin: false, allUsers: [],
      showUserDialog: false, selectedUser: null,
      showPinDialog: false, adminPin: '', pinError: false,
      // Sync
      isOnline: navigator.onLine, syncQueue: [],
      updateInterval: null, backgroundSyncInterval: null,
      // Constants
      MOTIVATIONAL_QUOTES, HEALTH_MILESTONES, EDUCATIONAL_TIPS, RISK_FACTORS, HEALTH_BENEFITS,
    }
  },

  computed: {
    totalMoneySaved()        { return this.allUsers.reduce((s, u) => s + parseFloat(u.moneySaved || 0), 0) },
    totalCigarettesAvoided() { return this.allUsers.reduce((s, u) => s + parseInt(u.cigarettesAvoided || 0), 0) },
    avgDaysSmokeeFree() {
      if (!this.allUsers.length) return 0
      return Math.round(this.allUsers.reduce((s, u) => s + u.daysSmokeeFree, 0) / this.allUsers.length)
    },
  },

  mounted() {
    this._initComposables()
    window.addEventListener('online',  this._onOnline)
    window.addEventListener('offline', this._onOffline)
    this._loadFromStorage()
    this._setupBackgroundSync()
    if (this.isOnline && this.deviceId) this._syncOnOpen()
    this._checkTodayLog()
    this._initNotifications()
  },

  beforeUnmount() {
    window.removeEventListener('online',  this._onOnline)
    window.removeEventListener('offline', this._onOffline)
    if (this.updateInterval) clearInterval(this.updateInterval)
    this._breathing.stopBreathing()
    this._delay.stopDelayTimer()
    this._tap.stopTapGame()
    this._saveToStorage()
  },

  methods: {
    _isNativePlatform() {
      // Capacitor is available in APK builds
      return window.Capacitor?.isNativePlatform?.() === true
    },

    _initComposables() {
      const quitDateRef         = ref(this.quitDate)
      const cigarettesPerDayRef = ref(this.cigarettesPerDay)
      const pricePerPackRef     = ref(this.pricePerPack)
      const log = useDailyLog()
      log.dailyLogs.value = this.dailyLogs
      this._log = log
      this._statsComp           = useStats(quitDateRef, cigarettesPerDayRef, pricePerPackRef, log.dailyLogs)
      this._quitDateRef         = quitDateRef
      this._cigarettesPerDayRef = cigarettesPerDayRef
      this._pricePerPackRef     = pricePerPackRef
      this._sync      = useSync()
      this._breathing = useBreathing()
      this._delay     = useDelayTimer()
      this._tap       = useTapGame()
    },

    async _initNotifications() {
      try {
        if (this._isNativePlatform()) {
          // Native APK — use Capacitor
          const { display } = await LocalNotifications.checkPermissions()
          if (display !== 'granted') { this.notificationsEnabled = false; this._saveToStorage() }
        } else {
          // PWA — use Web Notifications API
          if (!('Notification' in window)) { this.notificationsEnabled = false; return }
          if (Notification.permission !== 'granted') { this.notificationsEnabled = false; this._saveToStorage() }
        }
      } catch (e) { console.log('Notifications not available:', e) }
    },

    _syncStatsToData() {
      const s = this._statsComp
      this.stats = { ...s.stats.value }
      this.dailySavings = s.dailySavings.value
      this.weeklySavings = s.weeklySavings.value
      this.monthlySavings = s.monthlySavings.value
      this.diseaseRiskMilestones = s.diseaseRiskMilestones.value
    },

    _syncLogToData() {
      const l = this._log
      this.todayLogged = l.todayLogged.value
      this.todaySmoked = l.todaySmoked.value
      this.todayDateLabel = l.todayDateLabel.value
      this.currentStreak = l.currentStreak.value
      this.totalSmokeFreedays = l.totalSmokeFreedays.value
      this.dailyLogs = l.dailyLogs.value
      const now = new Date()
      const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
      const todayEntry = this.dailyLogs.find(l => l.date === todayStr)
      this.todaySmokedCount = todayEntry?.smokedCount || 0
    },

    _syncBreathingToData() {
      const b = this._breathing
      this.breathingStarted = b.breathingStarted.value; this.breathingDone = b.breathingDone.value
      this.breathPhase = b.breathPhase.value; this.breathCountdown = b.breathCountdown.value
      this.breathCyclesDone = b.breathCyclesDone.value; this.breathTotalCycles = b.breathTotalCycles
      this.breathLabel = b.breathLabel.value; this.breathPhaseFull = b.breathPhaseFull.value
      this.breathCircleStyle = b.breathCircleStyle.value; this.breathProgress = b.breathProgress.value
    },

    _syncDelayToData() {
      const d = this._delay
      this.delayStarted = d.delayStarted.value; this.delayDone = d.delayDone.value
      this.delayMinutes = d.delayMinutes.value; this.delaySeconds = d.delaySeconds.value
      this.delayProgress = d.delayProgress.value; this.delayMessage = d.delayMessage.value
    },

    _syncTapToData() {
      const t = this._tap
      this.tapGameStarted = t.tapGameStarted.value; this.tapGameDone = t.tapGameDone.value
      this.tapCount = t.tapCount.value; this.tapTimeLeft = t.tapTimeLeft.value
      this.tapProgress = t.tapProgress.value; this.tapResultMessage = t.tapResultMessage.value
    },

    async handleRegister(name) {
      this.userName = name
      if (!this.deviceId) { this.deviceId = this._generateDeviceId(); LocalStorage.set('quit-smoking-device-id', this.deviceId) }
      this._saveToStorage()
      if (this.isOnline) {
        try { await userAPI.register(this.deviceId, this.userName) }
        catch (error) { console.error(error); this._sync.addToSyncQueue('register', { deviceId: this.deviceId, userName: this.userName }) }
      } else { this._sync.addToSyncQueue('register', { deviceId: this.deviceId, userName: this.userName }) }
    },

    async handleStart({ quitDate, cigarettesPerDay, pricePerPack }) {
      this.quitDate = quitDate; this.cigarettesPerDay = cigarettesPerDay; this.pricePerPack = pricePerPack; this.hasStarted = true
      this._quitDateRef.value = quitDate; this._cigarettesPerDayRef.value = cigarettesPerDay; this._pricePerPackRef.value = pricePerPack
      this._saveToStorage(); this._recalc(); this._startInterval()
      window.dispatchEvent(new Event('app-started'))
      try {
        if (this.isOnline) {
          await this._sync.syncTrackingStart(this.deviceId, this.userName, quitDate, cigarettesPerDay, pricePerPack)
          await this._sync.syncProgress(this.deviceId, this.stats.days, this.stats.cigarettesAvoided, this.stats.moneySaved)
        }
      } catch (error) { console.error(error); this._sync.addToSyncQueue('start_tracking', { deviceId: this.deviceId, userName: this.userName, quitDate, cigarettesPerDay, pricePerPack }) }
    },

    handleReset() {
      this.$q.dialog({ title: 'Reset Progress', message: 'Are you sure you want to reset all your progress? This will clear everything including your device registration.', cancel: true, persistent: true, color: 'negative' })
        .onOk(async () => {
          if (this.isOnline && this.deviceId) { try { await userAPI.deleteUser(this.deviceId) } catch (error) { console.error(error) } }
          if (this.updateInterval) clearInterval(this.updateInterval)
          LocalStorage.remove('quit-smoking-device-id'); LocalStorage.remove('quit-smoking-data'); LocalStorage.remove('quit-smoking-sync-queue')
          Object.assign(this.$data, this.$options.data.call(this))
        })
    },

    _recalc() {
      this._quitDateRef.value = this.quitDate; this._cigarettesPerDayRef.value = this.cigarettesPerDay; this._pricePerPackRef.value = this.pricePerPack
      this._statsComp.calculate(); this._syncStatsToData()
    },

    _startInterval() {
      if (this.updateInterval) clearInterval(this.updateInterval)
      this.updateInterval = setInterval(() => {
        if (!this.hasStarted) return
        this._recalc(); this._syncBreathingToData(); this._syncDelayToData(); this._syncTapToData()
      }, 1000)
    },

    _checkTodayLog() { this._log.dailyLogs.value = this.dailyLogs; this._log.checkTodayLog(); this._syncLogToData() },

    onLogDay({ smoked, smokedCount = 0 }) {
      this._log.dailyLogs.value = this.dailyLogs; this._log.logDay(smoked, smokedCount); this._syncLogToData(); this._recalc()
      const now = new Date()
      const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
      const existingIdx = this.dailyLogs.findIndex(l => l.date === today)
      if (existingIdx >= 0) { this.dailyLogs[existingIdx] = { date: today, smoked, smokedCount } } else { this.dailyLogs.push({ date: today, smoked, smokedCount }) }
      this.todaySmokedCount = smoked ? smokedCount : 0
      const avoided = smoked ? Math.max(0, Number(this.cigarettesPerDay) - smokedCount) : Number(this.cigarettesPerDay)
      this.$q.notify({ color: smoked ? 'orange-7' : 'positive', message: smoked ? `You smoked ${smokedCount} today — ${avoided} still avoided! Tomorrow is a new start 💛` : `🎉 Great job! ${this.currentStreak} day streak!`, icon: smoked ? 'favorite' : 'emoji_events', position: 'center', timeout: 3500 })
      if (this.isOnline && this.deviceId) {
        userAPI.logDailyEntry(this.deviceId, today, smoked, smokedCount).catch((error) => { console.error('Daily log sync failed:', error); this._sync.addToSyncQueue('daily_log', { deviceId: this.deviceId, date: today, smoked, smokedCount }) })
      } else { this._sync.addToSyncQueue('daily_log', { deviceId: this.deviceId, date: today, smoked, smokedCount }) }
      this._saveToStorage()
    },

    async toggleNotifications(val) {
      try {
        if (val) {
          if (this._isNativePlatform()) {
            // ── Native APK ──────────────────────────────
            const { display } = await LocalNotifications.requestPermissions()
            if (display === 'granted') {
              this.notificationsEnabled = true
              await this._scheduleDailyNotification()
              this.$q.notify({ color: 'positive', message: 'Daily reminders enabled! 🔔', icon: 'notifications_active', position: 'center', timeout: 2000 })
            } else {
              this.notificationsEnabled = false
              this.$q.notify({ color: 'warning', message: 'Please allow notifications in your phone settings.', icon: 'notifications_off', position: 'center', timeout: 3000 })
            }
          } else {
            // ── PWA / Browser ───────────────────────────
            if (!('Notification' in window)) {
              this.$q.notify({ color: 'warning', message: 'Your browser does not support notifications.', position: 'center', timeout: 3000 })
              return
            }
            const permission = await Notification.requestPermission()
            if (permission === 'granted') {
              this.notificationsEnabled = true
              await this._scheduleDailyNotification()
              this.$q.notify({ color: 'positive', message: 'Daily reminders enabled! 🔔', icon: 'notifications_active', position: 'center', timeout: 2000 })
            } else {
              this.notificationsEnabled = false
              this.$q.notify({ color: 'warning', message: 'Please allow notifications in your browser settings.', icon: 'notifications_off', position: 'center', timeout: 3000 })
            }
          }
        } else {
          // ── Disable ─────────────────────────────────
          this.notificationsEnabled = false
          if (this._isNativePlatform()) {
            try { await LocalNotifications.cancel({ notifications: [{ id: 1 }] }) } catch (e) { console.log(e) }
          }
          this.$q.notify({ color: 'info', message: 'Daily reminders disabled.', icon: 'notifications_off', position: 'center', timeout: 2000 })
        }
      } catch (e) {
        console.error('Notification toggle error:', e)
        this.$q.notify({ color: 'negative', message: 'Could not update notifications.', position: 'center', timeout: 2000 })
      }
      this._saveToStorage()
    },

    async _scheduleDailyNotification() {
      const tips = [
        `You're doing amazing, ${this.userName}! Stay strong 💪`,
        `${this.stats.days} days smoke-free! You've saved ₱${this.stats.moneySaved?.toFixed(2) || 0}. Keep going!`,
        `Remember: You are stronger than your cravings. ${this.stats.cigarettesAvoided} cigarettes avoided!`,
        `Morning check-in! Log your day in PuffFree. You've got this! 🌟`,
      ]
      const body = tips[Math.floor(Math.random() * tips.length)]

      if (this._isNativePlatform()) {
        // ── Native APK — Capacitor Local Notifications ──
        try { await LocalNotifications.cancel({ notifications: [{ id: 1 }] }) } catch (e) { console.log(e) }
        const scheduledAt = new Date()
        scheduledAt.setHours(9, 0, 0, 0)
        if (scheduledAt <= new Date()) scheduledAt.setDate(scheduledAt.getDate() + 1)
        await LocalNotifications.schedule({
          notifications: [{
            id: 1,
            title: 'PuffFree Daily Reminder 🌿',
            body,
            schedule: { at: scheduledAt, repeats: true, every: 'day' },
            sound: null,
            smallIcon: 'ic_launcher',
            iconColor: '#7eab7e',
          }]
        })
      } else {
        // ── PWA — Web Notifications API + setTimeout trick ──
        // Schedule for next 9AM
        const now = new Date()
        const next9AM = new Date()
        next9AM.setHours(9, 0, 0, 0)
        if (next9AM <= now) next9AM.setDate(next9AM.getDate() + 1)
        const msUntil9AM = next9AM.getTime() - now.getTime()

        // Clear existing timer if any
        if (this._notifTimer) clearTimeout(this._notifTimer)

        this._notifTimer = setTimeout(() => {
          if (this.notificationsEnabled && Notification.permission === 'granted') {
            new Notification('PuffFree Daily Reminder 🌿', {
              body,
              icon: '/icons/icon-192x192.png',
            })
            // Reschedule for next day
            this._scheduleDailyNotification()
          }
        }, msUntil9AM)
      }
    },

    _sendDailyNotification() {
      if (!('Notification' in window) || Notification.permission !== 'granted') return
      const tips = [`Good morning, ${this.userName}! You've gone ${this.stats.days} days smoke-free. Keep it up! 💪`, `Day ${this.stats.days} and counting! You've saved ₱${this.stats.moneySaved.toFixed(2)} so far. Amazing!`, `Remember: You are stronger than your cravings. ${this.stats.cigarettesAvoided} cigarettes avoided!`, "Morning check-in! Log your day in the app. You've got this! 🌟"]
      new Notification('PuffFree Daily Reminder', { body: tips[Math.floor(Math.random() * tips.length)], icon: '/icons/favicon-128x128.png' })
    },

    openCraving() { this.activeCravingTip = CRAVING_TIPS[Math.floor(Math.random() * CRAVING_TIPS.length)]; this.showCravingDialog = true },
    openBreathingDialog() { this._breathing.resetBreathing(); this._syncBreathingToData(); this.showBreathingDialog = true },
    startBreathing() { this._breathing.startBreathing() },
    stopBreathing()  { this._breathing.stopBreathing()  },
    openDelayDialog() { this._delay.resetDelayTimer(); this._syncDelayToData(); this.showDelayDialog = true },
    startDelayTimer() { this._delay.startDelayTimer() },
    stopDelayTimer()  { this._delay.stopDelayTimer()  },
    openTapDialog() { this._tap.resetTapGame(); this._syncTapToData(); this.showTapGameDialog = true },
    startTapGame() { this._tap.startTapGame()  },
    stopTapGame()  { this._tap.stopTapGame()   },
    resetTapGame() { this._tap.resetTapGame(); this._syncTapToData() },
    registerTap()  { this._tap.registerTap();  this._syncTapToData() },

    // ── Community — real DB-backed ──────────────────────────
    _ensureAlias() {
      if (!this.myAlias) { this.myAlias = generateAlias(); this._saveToStorage() }
    },

    async openCommunityDialog() {
      this._ensureAlias()
      this.showCommunityDialog = true
      // Push latest smoke-free days to DB first so leaderboard always shows current value
      if (this.isOnline && this.hasStarted && this.deviceId) {
        try {
          await userAPI.updateProgress(this.deviceId, this.stats.days, this.stats.cigarettesAvoided, this.stats.moneySaved)
        } catch (e) { console.error('Progress pre-sync failed:', e) }
      }
      await Promise.all([this._loadCommunityMessages(), this._loadLeaderboard(), this._loadParticipants()])
    },

    async _loadCommunityMessages() {
      if (!this.isOnline) return
      this.loadingMessages = true
      try {
        const msgs = await userAPI.getCommunityMessages()
        this.encouragementMessages = msgs.map(m => ({ id: m.id, alias: m.alias, text: m.message, created_at: m.created_at }))
      } catch (e) { console.error('Failed to load community messages:', e) }
      finally { this.loadingMessages = false }
    },

    async _loadLeaderboard() {
      if (!this.isOnline) return
      this.loadingLeaderboard = true
      try {
        const rows = await userAPI.getLeaderboard()
        // Server now returns real name — wall messages stay alias-only
        this.leaderboard = rows.map(r => ({ alias: r.name, days: Number(r.days) }))
      } catch (e) { console.error('Failed to load leaderboard:', e) }
      finally { this.loadingLeaderboard = false }
    },

    async _loadParticipants() {
      if (!this.isOnline) return
      try { this.communityParticipants = await userAPI.getCommunityParticipants() }
      catch (e) { console.error('Failed to load participants:', e) }
    },

    async onJoinChallenge() {
      if (this.joinedChallenge || this.isJoining) return
      this._ensureAlias()
      this.isJoining = true
      try {
        if (this.isOnline) {
          // Push latest days to DB FIRST so the leaderboard reflects the real value
          await userAPI.updateProgress(this.deviceId, this.stats.days, this.stats.cigarettesAvoided, this.stats.moneySaved)
          await userAPI.joinChallenge(this.deviceId, this.myAlias)
        }
        this.joinedChallenge = true
        this._saveToStorage()
        await Promise.all([this._loadLeaderboard(), this._loadParticipants()])
        this.$q.notify({ color: 'positive', message: `You joined as "${this.myAlias}"! 🎉`, icon: 'groups', position: 'center', timeout: 2500 })
      } catch (e) {
        console.error('Failed to join challenge:', e)
        this.$q.notify({ color: 'negative', message: 'Could not join challenge. Try again.', position: 'center', timeout: 2000 })
      } finally { this.isJoining = false }
    },

    async onPostEncouragement() {
      const msg = (this.newMessage || '').trim()
      if (!msg || msg.length < 3 || this.isPosting) return
      this._ensureAlias()
      this.isPosting = true
      try {
        if (this.isOnline) {
          await userAPI.postCommunityMessage(this.deviceId, this.myAlias, msg)
          this.newMessage = ''
          await this._loadCommunityMessages()
          this.$q.notify({ color: 'positive', message: 'Message posted! 🌿', icon: 'send', position: 'center', timeout: 1500 })
        } else {
          this.$q.notify({ color: 'warning', message: 'You are offline. Connect to post.', position: 'center', timeout: 2000 })
        }
      } catch (e) {
        console.error('Failed to post message:', e)
        this.$q.notify({ color: 'negative', message: 'Could not post message. Try again.', position: 'center', timeout: 2000 })
      } finally { this.isPosting = false }
    },

    // ── Admin ────────────────────────────────────────────────
    openAdminFromMore() { this.adminPin = ''; this.pinError = false; this.showPinDialog = true },

    verifyPin() {
      if (this.adminPin === '1234') {
        this.showPinDialog = false; this.showAdmin = true; this.adminPin = ''; this.pinError = false
        if (this.isOnline) this._loadAllUsers()
        this.$q.notify({ color: 'positive', message: 'Admin access granted ✓', icon: 'admin_panel_settings', position: 'center', timeout: 1500 })
      } else {
        this.pinError = true; this.adminPin = ''
        this.$q.notify({ color: 'negative', message: 'Incorrect PIN', icon: 'lock', position: 'center', timeout: 1500 })
      }
    },

    closePinDialog() { this.showPinDialog = false; this.adminPin = ''; this.pinError = false },
    toggleAdminView() { this.showAdmin = !this.showAdmin; if (this.showAdmin && this.isOnline) this._loadAllUsers() },
    openUserDetails(user) { this.selectedUser = user; this.showUserDialog = true },

    async _loadAllUsers() {
      if (!this.isOnline) return
      try {
        const users = await userAPI.getAllUsers(this.deviceId)
        this.allUsers = users.map(u => ({ id: u.device_id, name: u.name, quitDate: u.quit_date, cigarettesPerDay: u.cigarettes_per_day, pricePerPack: u.price_per_pack, daysSmokeeFree: u.days_smoke_free, cigarettesAvoided: u.cigarettes_avoided, moneySaved: u.money_saved, lastUpdated: u.last_updated, opensToday: parseInt(u.opens_today) || 0, opensThisMonth: parseInt(u.opens_this_month) || 0, totalOpens: parseInt(u.total_opens) || 0, lastAppOpen: u.last_app_open }))
      } catch (error) {
        if (error.response?.status === 403) { this.isAdmin = false; this.showAdmin = false; this.$q.notify({ color: 'negative', message: 'Access denied', icon: 'lock', position: 'center', timeout: 2000 }) }
        console.error(error)
      }
    },

    async _loadDailyLogs() {
      if (!this.isOnline || !this.deviceId) return
      try {
        const logs = await userAPI.getDailyLogs(this.deviceId)
        if (Array.isArray(logs) && logs.length > 0) {
          const dbMap = {}; logs.forEach(l => { dbMap[l.date] = l })
          const localOnly = this.dailyLogs.filter(l => !Object.hasOwn(dbMap, l.date))
          this.dailyLogs = [...localOnly, ...logs.map(l => ({ date: l.date, smoked: l.smoked, smokedCount: l.smokedCount || 0 }))]
          this._log.dailyLogs.value = this.dailyLogs; this._log.checkTodayLog(); this._syncLogToData(); this._saveToStorage()
        }
      } catch (error) { console.error(error) }
    },

    async _syncOnOpen() {
      try {
        if (this.deviceId) await this._sync.recordAppOpen(this.deviceId)
        if (this.deviceId && this.userName) await this._sync.syncRegistration(this.deviceId, this.userName)
        if (this.deviceId && this.hasStarted && this.quitDate) await this._sync.syncTrackingStart(this.deviceId, this.userName, this.quitDate, this.cigarettesPerDay, this.pricePerPack)
        if (this.hasStarted && this.deviceId) await this._sync.syncProgress(this.deviceId, this.stats.days, this.stats.cigarettesAvoided, this.stats.moneySaved)
        if (this._sync.syncQueue.value.length > 0) await this._sync.processSyncQueue()
        if (this.showAdmin && this.isAdmin) await this._loadAllUsers()
        if (this.isOnline && this.deviceId && this.hasStarted) await this._loadDailyLogs()
      } catch (error) { console.error(error) }
    },

    _setupBackgroundSync() {
      this._sync.setupBackgroundSync(async () => { if (this.hasStarted) this._recalc(); await this._syncOnOpen() })
      window.addEventListener('beforeunload', () => { this._saveToStorage(); if (this.isOnline && this.hasStarted && this.deviceId) this._sendBeacon() })
    },

    _onOnline() { this.isOnline = true; if (this.hasStarted) this._recalc(); if (this.deviceId) this._syncOnOpen() },
    _onOffline() { this.isOnline = false },

    _sendBeacon() {
      const payload = { daysSmokeeFree: this.stats.days, cigarettesAvoided: this.stats.cigarettesAvoided, moneySaved: parseFloat(this.stats.moneySaved.toFixed(2)) }
      const url = `${process.env.API_URL || 'http://localhost:3000/api'}/users/${this.deviceId}/progress`
      navigator.sendBeacon(url, new Blob([JSON.stringify(payload)], { type: 'application/json' }))
    },

    _saveToStorage() {
      if (!this.deviceId) return
      LocalStorage.set('quit-smoking-data', {
        deviceId: this.deviceId, userName: this.userName, quitDate: this.quitDate,
        cigarettesPerDay: this.cigarettesPerDay, pricePerPack: this.pricePerPack,
        hasStarted: this.hasStarted, stats: this.stats, lastCalculated: new Date().toISOString(),
        dailyLogs: this.dailyLogs, notificationsEnabled: this.notificationsEnabled,
        joinedChallenge: this.joinedChallenge, myAlias: this.myAlias,
        // encouragementMessages + leaderboard always loaded fresh from DB
      })
      LocalStorage.set('quit-smoking-sync-queue', this._sync?.syncQueue?.value || [])
    },

    _loadFromStorage() {
      const d = LocalStorage.getItem('quit-smoking-data')
      if (d) {
        this.deviceId = d.deviceId || ''; this.userName = d.userName || ''
        this.quitDate = d.quitDate || ''; this.cigarettesPerDay = d.cigarettesPerDay || ''
        this.pricePerPack = d.pricePerPack || ''; this.hasStarted = d.hasStarted || false
        this.dailyLogs = d.dailyLogs || []; this.notificationsEnabled = d.notificationsEnabled || false
        this.joinedChallenge = d.joinedChallenge || false; this.myAlias = d.myAlias || ''
        if (this.hasStarted) { this._recalc(); this._startInterval() }
        if (this.deviceId && this.isOnline) { userAPI.checkAdmin(this.deviceId).then(result => { this.isAdmin = result }) }
      }
      this._sync?.loadSyncQueue()
    },

    _generateDeviceId() {
      const ts = Date.now(); const r1 = Math.random().toString(36).substring(2, 15); const r2 = Math.random().toString(36).substring(2, 15)
      return `device_${ts}_${r1}${r2}_${this._browserFingerprint()}`
    },

    _browserFingerprint() {
      const c = document.createElement('canvas'); const ctx = c.getContext('2d')
      ctx.textBaseline = 'top'; ctx.font = '14px Arial'; ctx.fillText('fingerprint', 2, 2)
      return c.toDataURL().slice(-50).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)
    },
  },
}
</script>

<style scoped>
:deep(.pf-header-green) { background: linear-gradient(135deg, #7eab7e, #5d9460) !important; color: white !important; }
:deep(.pf-badge-green)  { background: #d6efd6 !important; color: #2e4a2e !important; }
:deep(.pf-text-green)   { color: #5d9460 !important; }
:deep(.pf-header-beige) { background: linear-gradient(135deg, #c8a870, #a87840) !important; color: white !important; }
:deep(.pf-badge-beige)  { background: #ede0c4 !important; color: #5a4030 !important; }
:deep(.pf-text-beige)   { color: #7a6040 !important; }
:deep(.pf-header-rose)  { background: linear-gradient(135deg, #c97a8a, #a85c6e) !important; color: white !important; }
:deep(.pf-badge-rose)   { background: #fce8ee !important; color: #7a3048 !important; }
:deep(.pf-text-rose)    { color: #c97a8a !important; }

.pf-page-wrap   { position: relative; min-height: 100vh; }
.pf-tab-content { padding-bottom: 80px; }

.tab-page-header { display: flex; align-items: center; padding: 8px 4px 4px; }

.dashboard-header {
  background: linear-gradient(135deg, rgba(255,255,255,0.70), rgba(255,255,255,0.50));
  border-radius: 18px; border: 1.5px solid rgba(184,212,176,0.60);
  backdrop-filter: blur(8px); box-shadow: 0 4px 16px rgba(0,0,0,0.07);
}

.admin-toggle-btn { background: rgba(168,210,168,0.28) !important; color: #5d9460 !important; border: 1.5px solid #b8d4b0 !important; border-radius: 10px !important; font-weight: 600; }

.reset-btn { color: #c97a8a !important; border: 1.5px dashed #e8aab8 !important; border-radius: 12px !important; background: transparent !important; font-weight: 500; letter-spacing: 0.3px; transition: all 0.2s ease; }
.reset-btn:hover { background: rgba(201,122,138,0.08) !important; border-color: #c97a8a !important; color: #a85c6e !important; }
</style>