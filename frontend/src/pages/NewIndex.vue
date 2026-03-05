<template>
  <q-page class="q-pa-md bg-gradient">

    <!-- Admin toggle -->
    <q-btn
      v-if="deviceId && isAdmin && hasStarted"
      @click="toggleAdminView"
      :label="showAdmin ? 'My Progress' : 'Admin Dashboard'"
      :icon="showAdmin ? 'person' : 'admin_panel_settings'"
      class="q-mb-md bg-blue-2"
      color="blue-10"
      flat
      size="md"
    />

    <!-- ══════════════ ADMIN VIEW ══════════════ -->
    <AdminDashboard
      v-if="showAdmin"
      :all-users="allUsers"
      :total-money-saved="totalMoneySaved"
      :total-cigarettes-avoided="totalCigarettesAvoided"
      :avg-days-smokee-free="avgDaysSmokeeFree"
      @view-user="openUserDetails"
    />

    <!-- ══════════════ USER FLOW ══════════════ -->
    <template v-else>

      <!-- Step 1: Register -->
      <RegistrationCard v-if="!deviceId" @register="handleRegister" />

      <!-- Step 2: Setup -->
      <SetupForm v-else-if="!hasStarted" :user-name="userName" @start="handleStart" />

      <!-- Step 3: Dashboard -->
      <div v-else>
        <div class="text-center q-mb-lg animate-fade-in">
          <div class="text-h4 text-weight-bold text-blue-9">{{ userName }}'s Progress</div>
          <div class="text-subtitle1 text-blue-6">Keep going, you're doing great!</div>
        </div>

        <DailyCheckIn
          :today-date-label="todayDateLabel"
          :today-logged="todayLogged"
          :today-smoked="todaySmoked"
          :current-streak="currentStreak"
          :total-smoke-freedays="totalSmokeFreedays"
          @log="onLogDay"
        />

        <StatsGrid :stats="stats" />

        <SavingsBreakdown :daily="dailySavings" :weekly="weeklySavings" :monthly="monthlySavings" />

        <CigarettesGraph :total-days="stats.days" :cigarettes-per-day="Number(cigarettesPerDay)" />

        <DiseaseRiskCountdown :milestones="diseaseRiskMilestones" />

        <CravingToolbar
          @crave="openCraving"
          @breathing="openBreathingDialog"
          @delay="openDelayDialog"
          @tap="openTapDialog"
          @community="openCommunityDialog"
        />

        <MotivationalCarousel :quotes="MOTIVATIONAL_QUOTES" />

        <NotificationsToggle :enabled="notificationsEnabled" @toggle="toggleNotifications" />

        <InfoList
          title="Health Milestones"
          icon="trending_up"
          header-color="bg-blue-6"
          badge-color="blue-6"
          text-color="text-blue-8"
          :items="HEALTH_MILESTONES"
        >
          <template #avatar="{ }">
            <q-avatar color="blue-1" text-color="blue-6" icon="check_circle" />
          </template>
          <template #item="{ item }">
            <q-item-label class="text-weight-bold text-blue-9">{{ item.time }}</q-item-label>
            <q-item-label caption class="text-blue-7">{{ item.benefit }}</q-item-label>
          </template>
        </InfoList>

        <InfoList title="Educational Tips"           icon="school"   header-color="bg-blue-6"  badge-color="blue-6"  text-color="text-blue-8"  :items="EDUCATIONAL_TIPS"  />
        <InfoList title="Risk Factors of Smoking"    icon="warning"  header-color="bg-red-6"   badge-color="red-6"   text-color="text-red-8"   :items="RISK_FACTORS"      />
        <InfoList title="Health Benefits of Quitting" icon="favorite" header-color="bg-green-6" badge-color="green-6" text-color="text-green-8" :items="HEALTH_BENEFITS"   />

        <q-btn @click="handleReset" color="grey-5" text-color="grey-8" label="Reset Progress" size="md" class="full-width" />
      </div>
    </template>

    <!-- ══════════════ DIALOGS ══════════════ -->

    <CravingDialog        v-model="showCravingDialog"    :tip="activeCravingTip" />

    <BreathingDialog
      v-model="showBreathingDialog"
      :breathing-started="breathingStarted"
      :breathing-done="breathingDone"
      :breath-phase="breathPhase"
      :breath-countdown="breathCountdown"
      :breath-cycles-done="breathCyclesDone"
      :breath-total-cycles="breathTotalCycles"
      :breath-label="breathLabel"
      :breath-phase-full="breathPhaseFull"
      :circle-style="breathCircleStyle"
      :breath-progress="breathProgress"
      @start="startBreathing"
      @stop="stopBreathing"
    />

    <DelayTimerDialog
      v-model="showDelayDialog"
      :delay-started="delayStarted"
      :delay-done="delayDone"
      :delay-minutes="delayMinutes"
      :delay-seconds="delaySeconds"
      :delay-progress="delayProgress"
      :delay-message="delayMessage"
      @start="startDelayTimer"
      @stop="stopDelayTimer"
    />

    <TapGameDialog
      v-model="showTapGameDialog"
      :tap-game-started="tapGameStarted"
      :tap-game-done="tapGameDone"
      :tap-count="tapCount"
      :tap-time-left="tapTimeLeft"
      :tap-progress="tapProgress"
      :result-message="tapResultMessage"
      @start="startTapGame"
      @stop="stopTapGame"
      @reset="resetTapGame"
      @tap="registerTap"
    />

    <CommunityDialog
      v-model="showCommunityDialog"
      :joined-challenge="joinedChallenge"
      :community-participants="communityParticipants"
      :new-message="newMessage"
      :encouragement-messages="encouragementMessages"
      :leaderboard="leaderboard"
      @update:new-message="newMessage = $event"
      @join="onJoinChallenge"
      @post="onPostEncouragement"
    />

    <AdminPinDialog
      v-model="showPinDialog"
      :pin="adminPin"
      @update:pin="adminPin = $event"
      @verify="verifyAdminPin"
      @cancel="closePinDialog"
    />

    <UserDetailsDialog v-model="showUserDialog" :user="selectedUser" />

  </q-page>
</template>

<script>
import { ref } from 'vue'
import { LocalStorage } from 'quasar'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

// Constants
import {
  CRAVING_TIPS, MOTIVATIONAL_QUOTES, HEALTH_MILESTONES,
  EDUCATIONAL_TIPS, RISK_FACTORS, HEALTH_BENEFITS, ADMIN_PIN,
} from '../constants/content'

// Composables
import { useStats }      from '../composables/useStats'
import { useDailyLog }   from '../composables/useDailyLog'
import { useSync }       from '../composables/useSync'
import { useBreathing }  from '../composables/useBreathing'
import { useDelayTimer } from '../composables/useDelayTimer'
import { useTapGame }    from '../composables/useTapGame'
import { useCommunity }  from '../composables/useCommunity'

// Components
import RegistrationCard    from '../components/RegistrationCard.vue'
import SetupForm           from '../components/SetupForm.vue'
import DailyCheckIn        from '../components/DailyCheckIn.vue'
import StatsGrid           from '../components/StatsGrid.vue'
import SavingsBreakdown    from '../components/SavingsBreakdown.vue'
import CigarettesGraph     from '../components/CigarettesGraph.vue'
import DiseaseRiskCountdown from '../components/DiseaseRiskCountdown.vue'
import CravingToolbar      from '../components/CravingToolbar.vue'
import MotivationalCarousel from '../components/MotivationalCarousel.vue'
import NotificationsToggle from '../components/NotificationsToggle.vue'
import InfoList            from '../components/InfoList.vue'
import AdminDashboard      from '../components/AdminDashboard.vue'
import CravingDialog       from '../components/CravingDialog.vue'
import BreathingDialog     from '../components/BreathingDialog.vue'
import DelayTimerDialog    from '../components/DelayTimerDialog.vue'
import TapGameDialog       from '../components/TapGameDialog.vue'
import CommunityDialog     from '../components/CommunityDialog.vue'
import AdminPinDialog      from '../components/AdminPinDialog.vue'
import UserDetailsDialog   from '../components/UserDetailsDialog.vue'

import { userAPI } from '../services/api'

dayjs.extend(relativeTime)

export default {
  name: 'IndexPage',

  components: {
    RegistrationCard, SetupForm, DailyCheckIn,
    StatsGrid, SavingsBreakdown, CigarettesGraph,
    DiseaseRiskCountdown, CravingToolbar, MotivationalCarousel,
    NotificationsToggle, InfoList, AdminDashboard,
    CravingDialog, BreathingDialog, DelayTimerDialog,
    TapGameDialog, CommunityDialog, AdminPinDialog, UserDetailsDialog,
  },

  data() {
    return {
      // ── Core user state ──
      deviceId:         '',
      userName:         '',
      hasStarted:       false,
      quitDate:         '',
      cigarettesPerDay: '',
      pricePerPack:     '',

      // ── Stats (managed via composable, mirrored here) ──
      stats: { days: 0, hours: 0, minutes: 0, cigarettesAvoided: 0, moneySaved: 0, lifeRegained: 0, healthBoost: 0 },
      dailySavings:   0,
      weeklySavings:  0,
      monthlySavings: 0,
      diseaseRiskMilestones: [],

      // ── Daily log (from composable) ──
      dailyLogs:        [],
      todayLogged:      false,
      todaySmoked:      false,
      todayDateLabel:   '',
      currentStreak:    0,
      totalSmokeFreedays: 0,

      // ── Notifications ──
      notificationsEnabled: false,
      notificationInterval: null,

      // ── Craving ──
      showCravingDialog: false,
      activeCravingTip:  '',

      // ── Breathing (from composable) ──
      showBreathingDialog: false,
      breathingStarted:  false,
      breathingDone:     false,
      breathPhase:       'inhale',
      breathCountdown:   4,
      breathCyclesDone:  0,
      breathTotalCycles: 6,
      breathLabel:       'Inhale',
      breathPhaseFull:   '',
      breathCircleStyle: {},
      breathProgress:    0,

      // ── Delay timer (from composable) ──
      showDelayDialog:  false,
      delayStarted:     false,
      delayDone:        false,
      delayMinutes:     5,
      delaySeconds:     0,
      delayProgress:    0,
      delayMessage:     '',

      // ── Tap game (from composable) ──
      showTapGameDialog: false,
      tapGameStarted:   false,
      tapGameDone:      false,
      tapCount:         0,
      tapTimeLeft:      60,
      tapProgress:      0,
      tapResultMessage: '',

      // ── Community (from composable) ──
      showCommunityDialog:   false,
      joinedChallenge:       false,
      communityParticipants: 247,
      newMessage:            '',
      encouragementMessages: [],
      leaderboard:           [],

      // ── Admin ──
      showAdmin:           false,
      allUsers:            [],
      showUserDialog:      false,
      selectedUser:        null,
      showPinDialog:       false,
      adminPin:            '',
      isAdminAuthenticated:false,

      // ── Sync ──
      isOnline:   navigator.onLine,
      syncQueue:  [],

      // ── Intervals ──
      updateInterval:         null,
      backgroundSyncInterval: null,

      // ── Expose constants to template ──
      MOTIVATIONAL_QUOTES,
      HEALTH_MILESTONES,
      EDUCATIONAL_TIPS,
      RISK_FACTORS,
      HEALTH_BENEFITS,
    }
  },

  computed: {
    isAdmin() { return this.userName.toLowerCase() === 'naifa' },
    totalMoneySaved()        { return this.allUsers.reduce((s, u) => s + parseFloat(u.moneySaved || 0), 0) },
    totalCigarettesAvoided() { return this.allUsers.reduce((s, u) => s + parseInt(u.cigarettesAvoided || 0), 0) },
    avgDaysSmokeeFree() {
      if (!this.allUsers.length) return 0
      return Math.round(this.allUsers.reduce((s, u) => s + u.daysSmokeeFree, 0) / this.allUsers.length)
    },
  },

  mounted() {
    // ── Wire composables ──
    this._initComposables()

    window.addEventListener('online',  this._onOnline)
    window.addEventListener('offline', this._onOffline)
    this._loadFromStorage()
    this._setupBackgroundSync()
    if (this.isOnline && this.deviceId) this._syncOnOpen()
    this._checkTodayLog()
    this._scheduleNotificationCheck()
  },

  beforeUnmount() {
    window.removeEventListener('online',  this._onOnline)
    window.removeEventListener('offline', this._onOffline)
    if (this.updateInterval)          clearInterval(this.updateInterval)
    if (this.notificationInterval)    clearInterval(this.notificationInterval)
    this._breathing.stopBreathing()
    this._delay.stopDelayTimer()
    this._tap.stopTapGame()
    this._saveToStorage()
  },

  methods: {
    // ════════════════════════════════════════════
    // COMPOSABLE WIRING
    // ════════════════════════════════════════════
    _initComposables() {

      const quitDateRef        = ref(this.quitDate)
      const cigarettesPerDayRef = ref(this.cigarettesPerDay)
      const pricePerPackRef    = ref(this.pricePerPack)

      // ── Stats ──
      this._statsComp = useStats(quitDateRef, cigarettesPerDayRef, pricePerPackRef)
      this._quitDateRef        = quitDateRef
      this._cigarettesPerDayRef = cigarettesPerDayRef
      this._pricePerPackRef    = pricePerPackRef

      // ── Daily log ──
      const log = useDailyLog()
      this._log = log

      // ── Sync ──
      this._sync = useSync()

      // ── Mini-games ──
      this._breathing = useBreathing()
      this._delay     = useDelayTimer()
      this._tap       = useTapGame()

      // ── Community ──
      this._community = useCommunity()
      this.encouragementMessages = this._community.encouragementMessages.value
      this.leaderboard           = this._community.leaderboard.value
    },

    _syncStatsToData() {
      const s = this._statsComp
      this.stats              = { ...s.stats.value }
      this.dailySavings       = s.dailySavings.value
      this.weeklySavings      = s.weeklySavings.value
      this.monthlySavings     = s.monthlySavings.value
      this.diseaseRiskMilestones = s.diseaseRiskMilestones.value
    },

    _syncLogToData() {
      const l = this._log
      this.todayLogged       = l.todayLogged.value
      this.todaySmoked       = l.todaySmoked.value
      this.todayDateLabel    = l.todayDateLabel.value
      this.currentStreak     = l.currentStreak.value
      this.totalSmokeFreedays = l.totalSmokeFreedays.value
      this.dailyLogs         = l.dailyLogs.value
    },

    _syncBreathingToData() {
      const b = this._breathing
      this.breathingStarted  = b.breathingStarted.value
      this.breathingDone     = b.breathingDone.value
      this.breathPhase       = b.breathPhase.value
      this.breathCountdown   = b.breathCountdown.value
      this.breathCyclesDone  = b.breathCyclesDone.value
      this.breathTotalCycles = b.breathTotalCycles
      this.breathLabel       = b.breathLabel.value
      this.breathPhaseFull   = b.breathPhaseFull.value
      this.breathCircleStyle = b.breathCircleStyle.value
      this.breathProgress    = b.breathProgress.value
    },

    _syncDelayToData() {
      const d = this._delay
      this.delayStarted  = d.delayStarted.value
      this.delayDone     = d.delayDone.value
      this.delayMinutes  = d.delayMinutes.value
      this.delaySeconds  = d.delaySeconds.value
      this.delayProgress = d.delayProgress.value
      this.delayMessage  = d.delayMessage.value
    },

    _syncTapToData() {
      const t = this._tap
      this.tapGameStarted  = t.tapGameStarted.value
      this.tapGameDone     = t.tapGameDone.value
      this.tapCount        = t.tapCount.value
      this.tapTimeLeft     = t.tapTimeLeft.value
      this.tapProgress     = t.tapProgress.value
      this.tapResultMessage = t.tapResultMessage.value
    },

    // ════════════════════════════════════════════
    // REGISTRATION / SETUP
    // ════════════════════════════════════════════
    async handleRegister(name) {
      this.userName = name
      if (!this.deviceId) {
        this.deviceId = this._generateDeviceId()
        LocalStorage.set('quit-smoking-device-id', this.deviceId)
      }
      this._saveToStorage()
      if (this.isOnline) {
        try { await userAPI.register(this.deviceId, this.userName) }
        catch (error) { console.error(error); this._sync.addToSyncQueue('register', { deviceId: this.deviceId, userName: this.userName }) }
      } else {
        this._sync.addToSyncQueue('register', { deviceId: this.deviceId, userName: this.userName })
      }
    },

    async handleStart({ quitDate, cigarettesPerDay, pricePerPack }) {
      this.quitDate         = quitDate
      this.cigarettesPerDay = cigarettesPerDay
      this.pricePerPack     = pricePerPack
      this.hasStarted       = true

      // Update composable refs
      this._quitDateRef.value        = quitDate
      this._cigarettesPerDayRef.value = cigarettesPerDay
      this._pricePerPackRef.value    = pricePerPack

      this._saveToStorage()
      this._recalc()
      this._startInterval()

      try {
        if (this.isOnline) {
          await this._sync.syncTrackingStart(this.deviceId, this.userName, quitDate, cigarettesPerDay, pricePerPack)
          await this._sync.syncProgress(this.deviceId, this.stats.days, this.stats.cigarettesAvoided, this.stats.moneySaved)
        }
      } catch (error) {
        console.error(error)
        this._sync.addToSyncQueue('start_tracking', { deviceId: this.deviceId, userName: this.userName, quitDate, cigarettesPerDay, pricePerPack })
      }
    },

    handleReset() {
      this.$q.dialog({
        title: 'Reset Progress',
        message: 'Are you sure you want to reset all your progress? This will clear everything including your device registration.',
        cancel: true, persistent: true, color: 'negative',
      }).onOk(async () => {
        if (this.isOnline && this.deviceId) {
          try { await userAPI.deleteUser(this.deviceId) } catch (error) { console.error(error) }
        }
        if (this.updateInterval) clearInterval(this.updateInterval)
        LocalStorage.remove('quit-smoking-device-id')
        LocalStorage.remove('quit-smoking-data')
        LocalStorage.remove('quit-smoking-sync-queue')
        Object.assign(this.$data, this.$options.data.call(this))
      })
    },

    // ════════════════════════════════════════════
    // STATS
    // ════════════════════════════════════════════
    _recalc() {
      this._quitDateRef.value        = this.quitDate
      this._cigarettesPerDayRef.value = this.cigarettesPerDay
      this._pricePerPackRef.value    = this.pricePerPack
      this._statsComp.calculate()
      this._syncStatsToData()
    },

    _startInterval() {
      if (this.updateInterval) clearInterval(this.updateInterval)
      this.updateInterval = setInterval(() => {
        if (!this.hasStarted) return
        this._recalc()
        this._syncBreathingToData()
        this._syncDelayToData()
        this._syncTapToData()
      }, 1000)
    },

    // ════════════════════════════════════════════
    // DAILY LOG
    // ════════════════════════════════════════════
    _checkTodayLog() {
      this._log.dailyLogs.value = this.dailyLogs
      this._log.checkTodayLog()
      this._syncLogToData()
    },

    onLogDay(smoked) {
      this._log.dailyLogs.value = this.dailyLogs
      this._log.logDay(smoked)
      this._syncLogToData()

      this.$q.notify({
        color:    smoked ? 'orange-6' : 'green-6',
        message:  smoked ? "That's okay. Every day is a fresh start. 💛" : `🎉 Great job! ${this.currentStreak} day streak!`,
        icon:     smoked ? 'favorite' : 'emoji_events',
        position: 'center',
        timeout:  3000,
      })
      this._saveToStorage()
    },

    // ════════════════════════════════════════════
    // NOTIFICATIONS
    // ════════════════════════════════════════════
    async toggleNotifications(val) {
      if (val) {
        if ('Notification' in window) {
          const perm = await Notification.requestPermission()
          if (perm === 'granted') {
            this.notificationsEnabled = true
            this.$q.notify({ color: 'green-6', message: 'Daily reminders enabled! 🔔', icon: 'notifications_active', position: 'center', timeout: 2000 })
          } else {
            this.notificationsEnabled = false
            this.$q.notify({ color: 'orange-6', message: 'Please allow notifications in your browser settings.', icon: 'notifications_off', position: 'center', timeout: 3000 })
          }
        } else {
          this.notificationsEnabled = false
        }
      } else {
        this.notificationsEnabled = false
      }
      this._saveToStorage()
    },

    _scheduleNotificationCheck() {
      this.notificationInterval = setInterval(() => {
        if (!this.notificationsEnabled || !this.hasStarted) return
        const now = dayjs()
        if (now.hour() === 9 && now.minute() === 0) this._sendDailyNotification()
      }, 60000)
    },

    _sendDailyNotification() {
      if (!('Notification' in window) || Notification.permission !== 'granted') return
      const tips = [
        `Good morning, ${this.userName}! You've gone ${this.stats.days} days smoke-free. Keep it up! 💪`,
        `Day ${this.stats.days} and counting! You've saved ₱${this.stats.moneySaved.toFixed(2)} so far. Amazing!`,
        `Remember: You are stronger than your cravings. ${this.stats.cigarettesAvoided} cigarettes avoided!`,
        'Morning check-in! Log your day in the app. You\'ve got this! 🌟',
      ]
      new Notification('PuffFree Daily Reminder', {
        body: tips[Math.floor(Math.random() * tips.length)],
        icon: '/icons/favicon-128x128.png',
      })
    },

    // ════════════════════════════════════════════
    // CRAVING TOOLS
    // ════════════════════════════════════════════
    openCraving() {
      this.activeCravingTip  = CRAVING_TIPS[Math.floor(Math.random() * CRAVING_TIPS.length)]
      this.showCravingDialog = true
    },

    openBreathingDialog() {
      this._breathing.resetBreathing()
      this._syncBreathingToData()
      this.showBreathingDialog = true
    },
    startBreathing() {
      this._breathing.startBreathing()
      // Poll every second to sync to data (interval handles it)
    },
    stopBreathing() {
      this._breathing.stopBreathing()
    },

    openDelayDialog() {
      this._delay.resetDelayTimer()
      this._syncDelayToData()
      this.showDelayDialog = true
    },
    startDelayTimer() { this._delay.startDelayTimer() },
    stopDelayTimer()  { this._delay.stopDelayTimer()  },

    openTapDialog() {
      this._tap.resetTapGame()
      this._syncTapToData()
      this.showTapGameDialog = true
    },
    startTapGame() { this._tap.startTapGame()  },
    stopTapGame()  { this._tap.stopTapGame()   },
    resetTapGame() { this._tap.resetTapGame(); this._syncTapToData() },
    registerTap()  { this._tap.registerTap();  this._syncTapToData() },

    openCommunityDialog() {
      this._community.ensureAlias()
      this.showCommunityDialog = true
    },
    onJoinChallenge() {
      this._community.joinChallenge(this.stats.days)
      this.joinedChallenge       = this._community.joinedChallenge.value
      this.communityParticipants = this._community.communityParticipants.value
      this.leaderboard           = [...this._community.leaderboard.value]
      this.$q.notify({ color: 'indigo-6', message: `You joined as "${this._community.myAlias.value}"! 🎉`, icon: 'groups', position: 'center', timeout: 2500 })
      this._saveToStorage()
    },
    onPostEncouragement() {
      const posted = this._community.postEncouragement()
      if (posted) {
        this.encouragementMessages = [...this._community.encouragementMessages.value]
        this.$q.notify({ color: 'indigo-6', message: 'Message posted! 💙', icon: 'send', timeout: 1500 })
      }
    },

    // ════════════════════════════════════════════
    // ADMIN
    // ════════════════════════════════════════════
    toggleAdminView() {
      if (!this.showAdmin && !this.isAdminAuthenticated) {
        this.showPinDialog = true
      } else {
        this.showAdmin = !this.showAdmin
        if (this.showAdmin && this.isOnline) this._loadAllUsers()
      }
    },

    verifyAdminPin() {
      if (this.adminPin === ADMIN_PIN) {
        this.isAdminAuthenticated = true
        this.showAdmin            = true
        this.showPinDialog        = false
        this.adminPin             = ''
        if (this.isOnline) this._loadAllUsers()
        this.$q.notify({ color: 'positive', message: 'Admin access granted', icon: 'admin_panel_settings', position: 'center', timeout: 1500 })
      } else {
        this.$q.notify({ color: 'negative', message: 'Incorrect PIN', icon: 'error', position: 'center', timeout: 1500 })
        this.adminPin = ''
      }
    },

    closePinDialog() {
      this.showPinDialog = false
      this.adminPin      = ''
    },

    openUserDetails(user) {
      this.selectedUser  = user
      this.showUserDialog = true
    },

    async _loadAllUsers() {
      if (!this.isOnline) return
      try {
        const users = await userAPI.getAllUsers()
        this.allUsers = users.map(u => ({
          id: u.device_id, name: u.name, quitDate: u.quit_date,
          cigarettesPerDay: u.cigarettes_per_day, pricePerPack: u.price_per_pack,
          daysSmokeeFree: u.days_smoke_free, cigarettesAvoided: u.cigarettes_avoided,
          moneySaved: u.money_saved, lastUpdated: u.last_updated,
          opensToday: parseInt(u.opens_today) || 0,
          opensThisMonth: parseInt(u.opens_this_month) || 0,
          totalOpens: parseInt(u.total_opens) || 0,
          lastAppOpen: u.last_app_open,
        }))
      } catch (error) { console.error(error) }
    },

    // ════════════════════════════════════════════
    // SYNC / STORAGE
    // ════════════════════════════════════════════
    async _syncOnOpen() {
      try {
        if (this.deviceId) await this._sync.recordAppOpen(this.deviceId)
        if (this.deviceId && this.userName) await this._sync.syncRegistration(this.deviceId, this.userName)
        if (this.deviceId && this.hasStarted && this.quitDate)
          await this._sync.syncTrackingStart(this.deviceId, this.userName, this.quitDate, this.cigarettesPerDay, this.pricePerPack)
        if (this.hasStarted && this.deviceId)
          await this._sync.syncProgress(this.deviceId, this.stats.days, this.stats.cigarettesAvoided, this.stats.moneySaved)
        if (this._sync.syncQueue.value.length > 0) await this._sync.processSyncQueue()
        if (this.showAdmin && this.isAdmin) await this._loadAllUsers()
      } catch (error) { console.error(error) }
    },

    _setupBackgroundSync() {
      this._sync.setupBackgroundSync(async () => {
        if (this.hasStarted) this._recalc()
        await this._syncOnOpen()
      })
      window.addEventListener('beforeunload', () => {
        this._saveToStorage()
        if (this.isOnline && this.hasStarted && this.deviceId) this._sendBeacon()
      })
    },

    _onOnline() {
      this.isOnline = true
      if (this.hasStarted) this._recalc()
      if (this.deviceId)   this._syncOnOpen()
    },
    _onOffline() { this.isOnline = false },

    _sendBeacon() {
      const payload = { daysSmokeeFree: this.stats.days, cigarettesAvoided: this.stats.cigarettesAvoided, moneySaved: parseFloat(this.stats.moneySaved.toFixed(2)) }
      const url = `${process.env.API_URL || 'http://localhost:3000/api'}/users/${this.deviceId}/progress`
      navigator.sendBeacon(url, new Blob([JSON.stringify(payload)], { type: 'application/json' }))
    },

    _saveToStorage() {
      if (!this.deviceId) return
      LocalStorage.set('quit-smoking-data', {
        deviceId: this.deviceId, userName: this.userName,
        quitDate: this.quitDate, cigarettesPerDay: this.cigarettesPerDay, pricePerPack: this.pricePerPack,
        hasStarted: this.hasStarted, stats: this.stats, lastCalculated: new Date().toISOString(),
        dailyLogs: this.dailyLogs, notificationsEnabled: this.notificationsEnabled,
        joinedChallenge: this.joinedChallenge,
        myAlias:                 this._community?.myAlias?.value || '',
        encouragementMessages:   this.encouragementMessages,
        leaderboard:             this.leaderboard,
      })
      LocalStorage.set('quit-smoking-sync-queue', this._sync?.syncQueue?.value || [])
    },

    _loadFromStorage() {
      const d = LocalStorage.getItem('quit-smoking-data')
      if (d) {
        this.deviceId         = d.deviceId || ''
        this.userName         = d.userName || ''
        this.quitDate         = d.quitDate || ''
        this.cigarettesPerDay = d.cigarettesPerDay || ''
        this.pricePerPack     = d.pricePerPack || ''
        this.hasStarted       = d.hasStarted || false
        this.dailyLogs        = d.dailyLogs || []
        this.notificationsEnabled = d.notificationsEnabled || false
        this.joinedChallenge  = d.joinedChallenge || false
        if (d.encouragementMessages) this.encouragementMessages = d.encouragementMessages
        if (d.leaderboard)           this.leaderboard           = d.leaderboard
        if (d.myAlias && this._community) this._community.myAlias.value = d.myAlias

        if (this.hasStarted) { this._recalc(); this._startInterval() }
      }
      this._sync?.loadSyncQueue()
    },

    // ════════════════════════════════════════════
    // DEVICE ID
    // ════════════════════════════════════════════
    _generateDeviceId() {
      const ts = Date.now()
      const r1 = Math.random().toString(36).substring(2, 15)
      const r2 = Math.random().toString(36).substring(2, 15)
      const fp = this._browserFingerprint()
      return `device_${ts}_${r1}${r2}_${fp}`
    },

    _browserFingerprint() {
      const c   = document.createElement('canvas')
      const ctx = c.getContext('2d')
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('fingerprint', 2, 2)
      return c.toDataURL().slice(-50).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)
    },
  },
}
</script>

<style scoped>
/* All existing scoped styles remain here unchanged */
</style>