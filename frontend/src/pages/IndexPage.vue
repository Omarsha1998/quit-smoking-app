<template>
  <q-page class="q-pa-md">
    <!-- Admin Toggle Button (Only visible to Harain) -->
    <q-btn
      v-if="userId && isAdmin"
      @click="toggleAdminView"
      :color="showAdmin ? 'purple-6' : 'grey-6'"
      :label="showAdmin ? 'My Progress' : 'Admin Dashboard'"
      :icon="showAdmin ? 'person' : 'admin_panel_settings'"
      class="q-mb-md"
      flat
      size="md"
    />

    <!-- Admin Dashboard -->
    <div v-if="showAdmin">
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h5 text-weight-bold q-mb-md">
            <q-icon name="analytics" class="q-mr-sm" color="purple-6" />
            Admin Dashboard
          </div>

          <!-- Statistics Summary -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="bg-blue-1">
                <q-card-section>
                  <div class="text-h6 text-grey-8">Total Users</div>
                  <div class="text-h3 text-weight-bold text-blue-8">
                    {{ allUsers.length }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Users List -->
          <div class="text-h6 text-weight-bold q-mb-md">
            <q-icon name="people" class="q-mr-sm" />
            All Users
          </div>

          <q-list separator>
            <q-item
              v-for="user in allUsers"
              :key="user.id"
              clickable
              @click="showUserDetails(user)"
              class="q-pa-md"
            >
              <q-item-section avatar>
                <q-avatar color="teal-6" text-color="white" size="56px">
                  {{ user.name.charAt(0).toUpperCase() }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-h6 text-weight-bold">{{
                  user.name
                }}</q-item-label>
                <q-item-label caption class="q-mt-xs">
                  <q-icon name="event" size="xs" color="blue" />
                  {{ user.daysSmokeeFree }} days smoke-free
                </q-item-label>
                <q-item-label caption>
                  <q-icon name="block" size="xs" color="red" />
                  {{ user.cigarettesAvoided }} cigarettes avoided
                </q-item-label>
                <q-item-label caption>
                  <q-icon name="savings" size="xs" color="green" /> ₱{{
                    user.moneySaved
                  }}
                  saved
                </q-item-label>
                <q-item-label caption class="text-grey-5">
                  Updated: {{ formatDate(user.lastUpdated) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge
                  :color="getBadgeColor(user.daysSmokeeFree)"
                  text-color="white"
                  class="q-pa-sm"
                >
                  {{ getBadgeLabel(user.daysSmokeeFree) }}
                </q-badge>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" color="grey" />
              </q-item-section>
            </q-item>
          </q-list>

          <div
            v-if="allUsers.length === 0"
            class="text-center q-pa-lg text-grey-6"
          >
            <q-icon name="people_outline" size="64px" class="q-mb-md" />
            <div class="text-h6">No users found</div>
            <div class="text-caption">
              Users will appear here once they start tracking
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- User View -->
    <div v-else>
      <!-- User Registration -->
      <div v-if="!userId" class="row justify-center">
        <div class="col-12 col-md-6">
          <q-card class="q-pa-md">
            <q-card-section class="text-center">
              <q-avatar
                size="80px"
                color="purple-6"
                text-color="white"
                icon="person"
                class="q-mb-md"
              />
              <div class="text-h4 text-weight-bold q-mb-xs">Welcome!</div>
              <div class="text-subtitle2 text-grey-7">
                Let's get to know you first
              </div>
            </q-card-section>

            <q-card-section>
              <q-input
                v-model="userName"
                label="Your Name"
                outlined
                class="q-mb-md"
                hint="This will be visible to admins"
              />

              <q-btn
                @click="handleRegister"
                color="purple-6"
                label="Continue"
                size="lg"
                class="full-width"
                :disable="!userName || userName.trim().length < 2"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Setup Form -->
      <div v-else-if="!hasStarted" class="row justify-center">
        <div class="col-12 col-md-6">
          <q-card class="q-pa-md">
            <q-card-section class="text-center">
              <q-avatar
                size="80px"
                color="teal-6"
                text-color="white"
                icon="favorite"
                class="q-mb-md"
              />
              <div class="text-h4 text-weight-bold q-mb-xs">
                Hi {{ userName }}!
              </div>
              <div class="text-subtitle2 text-grey-7">
                Start your journey to a healthier life
              </div>
            </q-card-section>

            <q-card-section>
              <q-input
                v-model="quitDate"
                type="datetime-local"
                label="When did you quit?"
                outlined
                class="q-mb-md"
              />

              <q-input
                v-model.number="cigarettesPerDay"
                type="number"
                label="Cigarettes per day (before quitting)"
                outlined
                class="q-mb-md"
                min="1"
              />

              <q-input
                v-model.number="pricePerPack"
                type="number"
                step="0.01"
                label="Price per pack (₱)"
                outlined
                class="q-mb-md"
                prefix="₱"
                min="0"
              />

              <q-btn
                @click="handleStart"
                color="teal-6"
                label="Start Tracking"
                size="lg"
                class="full-width"
                :disable="!quitDate || !cigarettesPerDay || !pricePerPack"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Dashboard -->
      <div v-else>
        <div class="text-center q-mb-lg">
          <div class="text-h4 text-weight-bold">{{ userName }}'s Progress</div>
          <div class="text-subtitle1 text-grey-7">
            Keep going, you're doing great!
          </div>
        </div>

        <!-- Main Counter Card -->
        <q-card class="bg-gradient-teal q-mb-md text-white">
          <q-card-section class="text-center">
            <q-icon name="emoji_events" size="64px" class="q-mb-md" />
            <div class="text-h1 text-weight-bold">{{ stats.days }}</div>
            <div class="text-h5 q-mb-sm">Days Smoke-Free</div>
            <div class="text-subtitle2 opacity-80">{{ formattedTime }}</div>
          </q-card-section>
        </q-card>

        <!-- Stats Grid -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-6">
            <q-card>
              <q-card-section>
                <q-icon name="block" color="red-6" size="40px" />
                <div class="text-h4 text-weight-bold q-mt-sm">
                  {{ cigarettesAvoidedDisplay }}
                </div>
                <div class="text-caption text-grey-7">Cigarettes Avoided</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-6">
            <q-card>
              <q-card-section>
                <q-icon name="savings" color="green-6" size="40px" />
                <div class="text-h4 text-weight-bold q-mt-sm">
                  {{ moneySavedDisplay }}
                </div>
                <div class="text-caption text-grey-7">Money Saved</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-6">
            <q-card>
              <q-card-section>
                <q-icon name="schedule" color="blue-6" size="40px" />
                <div class="text-h4 text-weight-bold q-mt-sm">
                  {{ lifeRegainedDisplay }}
                </div>
                <div class="text-caption text-grey-7">Life Regained</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-6">
            <q-card>
              <q-card-section>
                <q-icon name="favorite" color="pink-6" size="40px" />
                <div class="text-h4 text-weight-bold q-mt-sm">
                  {{ healthBoostDisplay }}
                </div>
                <div class="text-caption text-grey-7">Health Boost</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Craving Help -->
        <q-btn
          @click="showCraving = !showCraving"
          color="orange-6"
          label="Having a Craving?"
          size="lg"
          class="full-width q-mb-md"
        />

        <!-- Craving Tips -->
        <q-card v-if="showCraving" class="q-mb-md">
          <q-card-section>
            <div class="text-h6 text-weight-bold q-mb-md">
              Quick Tips to Beat Cravings
            </div>
            <q-list separator>
              <q-item v-for="(tip, idx) in cravingTips" :key="idx">
                <q-item-section avatar>
                  <q-avatar color="orange-6" text-color="white" size="40px">{{
                    idx + 1
                  }}</q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ tip }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- Health Milestones -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6 text-weight-bold q-mb-md">
              <q-icon name="trending_up" color="teal-6" class="q-mr-sm" />
              Health Milestones
            </div>
            <q-timeline color="teal-6">
              <q-timeline-entry
                v-for="(milestone, idx) in milestones"
                :key="idx"
                :title="milestone.time"
                :subtitle="milestone.benefit"
              />
            </q-timeline>
          </q-card-section>
        </q-card>

        <!-- Reset Button -->
        <q-btn
          @click="handleReset"
          color="grey-5"
          text-color="grey-8"
          label="Reset Progress"
          size="md"
          class="full-width"
        />
      </div>
    </div>

    <!-- User Details Dialog -->
    <q-dialog v-model="showUserDialog" :maximized="$q.screen.lt.sm">
      <q-card
        :style="$q.screen.lt.sm ? '' : 'min-width: 500px; max-width: 600px'"
      >
        <q-card-section class="bg-teal-6 text-white">
          <div class="text-h5 text-weight-bold">
            <q-icon name="person" class="q-mr-sm" />
            {{ selectedUser?.name }}
          </div>
          <div class="text-subtitle2">User Details & Statistics</div>
        </q-card-section>

        <q-card-section v-if="selectedUser">
          <!-- User Avatar and Basic Info -->
          <div class="text-center q-mb-lg">
            <q-avatar
              color="teal-6"
              text-color="white"
              size="80px"
              class="q-mb-md"
            >
              {{ selectedUser.name.charAt(0).toUpperCase() }}
            </q-avatar>
            <div class="text-h6 text-weight-bold">{{ selectedUser.name }}</div>
            <q-badge
              :color="getBadgeColor(selectedUser.daysSmokeeFree)"
              text-color="white"
              class="q-mt-sm"
            >
              {{ getBadgeLabel(selectedUser.daysSmokeeFree) }}
            </q-badge>
          </div>

          <!-- Detailed Stats -->
          <q-list>
            <q-item>
              <q-item-section avatar>
                <q-icon name="event" color="blue-6" size="md" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Days Smoke-Free</q-item-label>
                <q-item-label
                  caption
                  class="text-h6 text-weight-bold text-blue-8"
                >
                  {{ selectedUser.daysSmokeeFree }} days
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="block" color="red-6" size="md" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Cigarettes Avoided</q-item-label>
                <q-item-label
                  caption
                  class="text-h6 text-weight-bold text-red-8"
                >
                  {{ selectedUser.cigarettesAvoided }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="savings" color="green-6" size="md" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Money Saved</q-item-label>
                <q-item-label
                  caption
                  class="text-h6 text-weight-bold text-green-8"
                >
                  ₱{{ selectedUser.moneySaved }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="smoking_rooms" color="grey-6" size="md" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Cigarettes per Day (before)</q-item-label>
                <q-item-label caption class="text-weight-bold">
                  {{ selectedUser.cigarettesPerDay }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="attach_money" color="orange-6" size="md" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Price per Pack</q-item-label>
                <q-item-label caption class="text-weight-bold">
                  ₱{{ selectedUser.pricePerPack }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="schedule" color="purple-6" size="md" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Quit Date</q-item-label>
                <q-item-label caption class="text-weight-bold">
                  {{ formatFullDate(selectedUser.quitDate) }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="update" color="grey-6" size="md" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Last Updated</q-item-label>
                <q-item-label caption class="text-weight-bold">
                  {{ formatDate(selectedUser.lastUpdated) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useQuasar, LocalStorage } from "quasar";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { userAPI } from "../services/api";

dayjs.extend(relativeTime);

export default defineComponent({
  name: "IndexPage",

  setup() {
    const $q = useQuasar();

    // User data
    const userId = ref("");
    const userName = ref("");
    const showAdmin = ref(false);
    const allUsers = ref([]);
    const showUserDialog = ref(false);
    const selectedUser = ref(null);

    // Reactive data
    const quitDate = ref("");
    const cigarettesPerDay = ref("");
    const pricePerPack = ref("");
    const hasStarted = ref(false);
    const showCraving = ref(false);
    const updateInterval = ref(null);

    const stats = ref({
      days: 0,
      hours: 0,
      minutes: 0,
      cigarettesAvoided: 0,
      moneySaved: 0,
      lifeRegained: 0,
      healthBoost: 0,
    });

    // Static data
    const cravingTips = [
      "Take deep breaths and think of why you start this.",
      "Drink a glass of water",
      "Go for walk to undwind",
      "Think of positive ways",
      "Chew sugar-free gum or candy",
    ];

    const milestones = [
      { time: "20 minutes", benefit: "Heart rate drops to normal" },
      { time: "12 hours", benefit: "Carbon monoxide level normalizes" },
      { time: "2 weeks", benefit: "Circulation and lung function improve" },
      {
        time: "1-9 months",
        benefit: "Coughing and shortness of breath decrease",
      },
      { time: "1 year", benefit: "Heart disease risk drops by 50%" },
      { time: "5 years", benefit: "Stroke risk reduces to that of non-smoker" },
      { time: "10 years", benefit: "Lung cancer risk drops by 50%" },
    ];

    // Admin computed properties
    const totalMoneySaved = computed(() => {
      return allUsers.value.reduce(
        (sum, user) => sum + parseFloat(user.moneySaved || 0),
        0
      );
    });

    const totalCigarettesAvoided = computed(() => {
      return allUsers.value.reduce(
        (sum, user) => sum + parseInt(user.cigarettesAvoided || 0),
        0
      );
    });

    const avgDaysSmokeeFree = computed(() => {
      if (allUsers.value.length === 0) return 0;
      const total = allUsers.value.reduce(
        (sum, user) => sum + user.daysSmokeeFree,
        0
      );
      return Math.round(total / allUsers.value.length);
    });

    // Computed properties
    const formattedTime = computed(() => {
      return `${stats.value.hours}h ${stats.value.minutes}m`;
    });

    const cigarettesAvoidedDisplay = computed(() => {
      return stats.value.cigarettesAvoided || 0;
    });

    const moneySavedDisplay = computed(() => {
      return `₱${stats.value.moneySaved.toFixed(2)}`;
    });

    const lifeRegainedDisplay = computed(() => {
      return `${Math.floor(stats.value.lifeRegained / 60)}h`;
    });

    const healthBoostDisplay = computed(() => {
      return `${stats.value.healthBoost}%`;
    });

    const formatDate = (dateStr) => {
      return dayjs(dateStr).fromNow();
    };

    const formatFullDate = (dateStr) => {
      return dayjs(dateStr).format("MMMM D, YYYY h:mm A");
    };

    // Check if current user is admin (Harain)
    const isAdmin = computed(() => {
      return userName.value.toLowerCase() === "naifa";
    });

    const getBadgeColor = (days) => {
      if (days > 30) return "green";
      if (days > 7) return "orange";
      return "blue";
    };

    const getBadgeLabel = (days) => {
      if (days > 30) return "Champion";
      if (days > 7) return "Strong";
      return "Beginner";
    };

    // Methods
    const generateUserId = () => {
      return (
        "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
      );
    };

    const toggleAdminView = () => {
      showAdmin.value = !showAdmin.value;
      if (showAdmin.value) {
        loadAllUsers();
      }
    };

    const showUserDetails = (user) => {
      selectedUser.value = user;
      showUserDialog.value = true;
    };

    const handleRegister = async () => {
      try {
        const newUserId = generateUserId();

        await userAPI.register(newUserId, userName.value);

        userId.value = newUserId;
        LocalStorage.set("quit-smoking-user-id", newUserId);
        LocalStorage.set("quit-smoking-user-name", userName.value);

        $q.notify({
          color: "positive",
          message: `Welcome, ${userName.value}!`,
          icon: "check_circle",
          position: "top",
        });
      } catch (error) {
        console.error("Error registering user:", error);
        $q.notify({
          color: "negative",
          message: "Failed to register. Please try again.",
          icon: "error",
        });
      }
    };

    const loadUserData = async () => {
      try {
        const savedUserId = LocalStorage.getItem("quit-smoking-user-id");
        const savedUserName = LocalStorage.getItem("quit-smoking-user-name");

        if (savedUserId) {
          userId.value = savedUserId;
          userName.value = savedUserName;

          try {
            const userData = await userAPI.getUser(savedUserId);
            quitDate.value = userData.quit_date;
            cigarettesPerDay.value = userData.cigarettes_per_day;
            pricePerPack.value = userData.price_per_pack;
            hasStarted.value = true;
            calculateStats();
            startUpdateInterval();
          } catch (error) {
            console.log("No quit data found for user");
          }
        }
      } catch (error) {
        console.log("No saved user data found");
      }
    };

    const saveUserProgress = async () => {
      if (!userId.value) return;

      try {
        await userAPI.updateProgress(
          userId.value,
          stats.value.days,
          stats.value.cigarettesAvoided,
          stats.value.moneySaved.toFixed(2)
        );
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    };

    const loadAllUsers = async () => {
      try {
        const users = await userAPI.getAllUsers();
        allUsers.value = users.map((user) => ({
          id: user.id,
          name: user.name,
          quitDate: user.quit_date,
          cigarettesPerDay: user.cigarettes_per_day,
          pricePerPack: user.price_per_pack,
          daysSmokeeFree: user.days_smoke_free,
          cigarettesAvoided: user.cigarettes_avoided,
          moneySaved: user.money_saved,
          lastUpdated: user.last_updated,
        }));
      } catch (error) {
        console.error("Error loading all users:", error);
      }
    };

    const calculateStats = () => {
      const quitTime = dayjs(quitDate.value);
      const now = dayjs();
      const diff = now.diff(quitTime);

      stats.value.days = Math.floor(diff / (1000 * 60 * 60 * 24));
      stats.value.hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      stats.value.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      stats.value.cigarettesAvoided = Math.floor(
        (diff / (1000 * 60 * 60 * 24)) * cigarettesPerDay.value
      );
      stats.value.moneySaved =
        (stats.value.cigarettesAvoided / 20) * pricePerPack.value;
      stats.value.lifeRegained = Math.floor(stats.value.cigarettesAvoided * 11);
      stats.value.healthBoost =
        stats.value.days < 30 ? Math.round((stats.value.days / 30) * 100) : 100;

      if (hasStarted.value) {
        saveUserProgress();
      }
    };

    const startUpdateInterval = () => {
      updateInterval.value = setInterval(() => {
        calculateStats();
        if (showAdmin.value) {
          loadAllUsers();
        }
      }, 60000);
    };

    const handleStart = async () => {
      try {
        await userAPI.startTracking(
          userId.value,
          userName.value,
          quitDate.value,
          cigarettesPerDay.value,
          pricePerPack.value
        );

        hasStarted.value = true;
        calculateStats();
        startUpdateInterval();

        $q.notify({
          color: "positive",
          message: "Tracking started! You got this!",
          icon: "check_circle",
          position: "top",
        });
      } catch (error) {
        console.error("Error starting tracking:", error);
        $q.notify({
          color: "negative",
          message: "Failed to start tracking. Please try again.",
          icon: "error",
        });
      }
    };

    const handleReset = () => {
      $q.dialog({
        title: "Reset Progress",
        message: "Are you sure you want to reset all your progress?",
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await userAPI.deleteUser(userId.value);

          LocalStorage.remove("quit-smoking-user-id");
          LocalStorage.remove("quit-smoking-user-name");

          userId.value = "";
          userName.value = "";
          quitDate.value = "";
          cigarettesPerDay.value = "";
          pricePerPack.value = "";
          hasStarted.value = false;
          showCraving.value = false;

          if (updateInterval.value) {
            clearInterval(updateInterval.value);
          }

          $q.notify({
            color: "info",
            message: "Progress reset",
            icon: "refresh",
            position: "top",
          });
        } catch (error) {
          console.error("Error resetting data:", error);
          $q.notify({
            color: "negative",
            message: "Failed to reset. Please try again.",
            icon: "error",
          });
        }
      });
    };

    // Lifecycle hooks
    onMounted(() => {
      loadUserData();
      loadAllUsers();
    });

    onBeforeUnmount(() => {
      if (updateInterval.value) {
        clearInterval(updateInterval.value);
      }
    });

    return {
      // User data
      userId,
      userName,
      showAdmin,
      allUsers,
      showUserDialog,
      selectedUser,
      isAdmin,

      // Data
      quitDate,
      cigarettesPerDay,
      pricePerPack,
      hasStarted,
      showCraving,
      stats,
      cravingTips,
      milestones,

      // Admin computed
      totalMoneySaved,
      totalCigarettesAvoided,
      avgDaysSmokeeFree,

      // Computed
      formattedTime,
      cigarettesAvoidedDisplay,
      moneySavedDisplay,
      lifeRegainedDisplay,
      healthBoostDisplay,

      // Methods
      handleRegister,
      handleStart,
      handleReset,
      loadAllUsers,
      formatDate,
      formatFullDate,
      getBadgeColor,
      getBadgeLabel,
      toggleAdminView,
      showUserDetails,
    };
  },
});
</script>

<style scoped>
.bg-gradient-teal {
  background: linear-gradient(135deg, #26a69a 0%, #00897b 100%);
}

.opacity-80 {
  opacity: 0.8;
}
</style>
