<template>
  <q-page class="q-pa-md bg-gradient">
    <!-- Admin Toggle Button (Only visible to Admin) -->
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

    <!-- Admin Dashboard -->
    <div v-if="showAdmin">
      <q-card class="q-mb-md shadow-lg">
        <q-card-section>
          <div class="text-h5 text-weight-bold q-mb-md text-blue-9">
            <q-icon name="analytics" class="q-mr-sm" color="blue-6" />
            Admin Dashboard
          </div>

          <!-- Statistics Summary -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="bg-blue-1">
                <q-card-section>
                  <div class="text-h6 text-blue-8">Total Users</div>
                  <div class="text-h3 text-weight-bold text-blue-9">
                    {{ allUsers.length }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="bg-green-1">
                <q-card-section>
                  <div class="text-h6 text-grey-8">Total Saved</div>
                  <div class="text-h3 text-weight-bold text-green-8">
                    ₱{{ totalMoneySaved.toFixed(2) }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="bg-red-1">
                <q-card-section>
                  <div class="text-h6 text-grey-8">Total Avoided</div>
                  <div class="text-h3 text-weight-bold text-red-8">
                    {{ totalCigarettesAvoided }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="bg-orange-1">
                <q-card-section>
                  <div class="text-h6 text-grey-8">Avg Days Free</div>
                  <div class="text-h3 text-weight-bold text-orange-8">
                    {{ avgDaysSmokeeFree }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Users List -->
          <div class="text-h6 text-weight-bold q-mb-md text-blue-9">
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
                <q-avatar color="blue-6" text-color="white" size="56px">
                  {{ user.name.charAt(0).toUpperCase() }}
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-h6 text-weight-bold text-blue-9">
                  {{ user.name }}
                </q-item-label>

                <q-item-label caption class="q-mt-xs">
                  <q-icon name="event" size="xs" color="blue" />
                  {{ user.daysSmokeeFree }} days smoke-free
                </q-item-label>

                <q-item-label caption>
                  <q-icon name="block" size="xs" color="red" />
                  {{ user.cigarettesAvoided }} cigarettes avoided
                </q-item-label>

                <q-item-label caption>
                  <q-icon name="savings" size="xs" color="green" />
                  ₱{{ user.moneySaved }} saved
                </q-item-label>

                <q-item-label caption class="q-mt-sm">
                  <q-badge color="blue-6" class="q-mr-xs">
                    <q-icon name="smartphone" size="xs" class="q-mr-xs" />
                    Today: {{ user.opensToday || 0 }}
                  </q-badge>
                  <q-badge color="indigo-6" class="q-mr-xs">
                    <q-icon name="calendar_month" size="xs" class="q-mr-xs" />
                    Month: {{ user.opensThisMonth || 0 }}
                  </q-badge>
                  <q-badge color="grey-6">
                    <q-icon name="timeline" size="xs" class="q-mr-xs" />
                    Total: {{ user.totalOpens || 0 }}
                  </q-badge>
                </q-item-label>

                <q-item-label caption class="text-grey-5 q-mt-xs">
                  Last activity: {{ formatDate(user.lastUpdated) }}
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
          <div v-if="allUsers.length === 0" class="text-center q-pa-lg text-grey-6">
            <q-icon name="people_outline" size="64px" class="q-mb-md" />
            <div class="text-h6">No users found</div>
            <div class="text-caption">Users will appear here once they start tracking</div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- User View -->
    <div v-else>
      <!-- User Registration -->
      <div v-if="!deviceId" class="row justify-center items-center" style="min-height: 80vh">
        <div class="col-12 col-md-6">
          <q-card class="shadow-xl animate-fade-in registration-card">
            <!-- Logo Section with refined spacing -->
            <q-card-section class="text-center q-pt-xl q-pb-md">
              <div class="row justify-center items-center q-gutter-lg">
                <div class="col-auto">
                  <img src="../assets/adzuLogo-nobg.png" alt="AdZU Logo" class="logo-image" />
                </div>
                <div class="col-auto logo-divider"></div>
                <div class="col-auto">
                  <img src="../assets/appLogo-nobg.png" alt="App Logo" class="logo-image" />
                </div>
              </div>
            </q-card-section>

            <!-- Welcome Header with better typography -->
            <q-card-section class="text-center q-px-lg q-pb-md">
              <div class="text-h3 text-weight-bold text-grey-9 q-mb-sm welcome-text">Welcome</div>
              <div class="text-subtitle1 text-grey-7 tagline-text">
                Begin your journey to a smoke-free life
              </div>
            </q-card-section>

            <!-- Input Section -->
            <q-card-section class="q-px-lg q-pb-lg">
              <q-input
                v-model="userName"
                label="Your Name"
                outlined
                class="q-mb-lg input-modern"
                color="blue-7"
                autofocus
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="blue-7" />
                </template>
              </q-input>

              <q-btn
                @click="handleRegister"
                color="blue-7"
                label="Get Started"
                unelevated
                size="lg"
                class="full-width modern-button"
                :disable="!userName || userName.trim().length < 2"
                no-caps
              />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Setup Form -->
      <div
        v-else-if="userName && !hasStarted"
        class="row justify-center items-center"
        style="min-height: 80vh"
      >
        <div class="col-12 col-md-6">
          <q-card class="shadow-xl animate-fade-in">
            <q-card-section class="text-center bg-gradient-blue text-white">
              <q-avatar
                size="80px"
                color="white"
                text-color="blue-6"
                icon="emoji_events"
                class="q-mb-md"
              />
              <div class="text-h4 text-weight-bold q-mb-xs">Hi {{ userName }}!</div>
              <div class="text-subtitle2">Start your journey to a healthier life</div>
            </q-card-section>

            <q-card-section>
              <q-input
                v-model="quitDate"
                type="datetime-local"
                label="When did you quit?"
                outlined
                color="blue-6"
                class="q-mb-md"
              />
              <q-input
                v-model.number="cigarettesPerDay"
                type="number"
                label="Cigarettes per day (before quitting)"
                outlined
                color="blue-6"
                class="q-mb-md"
                min="1"
              />
              <q-input
                v-model.number="pricePerPack"
                type="number"
                step="0.01"
                label="Price per pack (₱)"
                outlined
                color="blue-6"
                class="q-mb-md"
                prefix="₱"
                min="0"
              />
              <q-btn
                @click="handleStart"
                color="blue-6"
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
      <div v-else-if="userName && hasStarted">
        <div class="text-center q-mb-lg animate-fade-in">
          <div class="text-h4 text-weight-bold text-blue-9">{{ userName }}'s Progress</div>
          <div class="text-subtitle1 text-blue-6">Keep going, you're doing great!</div>
        </div>

        <!-- Main Counter Card -->
        <q-card class="bg-gradient-blue q-mb-md text-white shadow-2xl animate-slide-up">
          <q-card-section class="text-center">
            <q-icon name="emoji_events" size="64px" class="q-mb-md animate-bounce" />
            <div class="text-h1 text-weight-bold">{{ stats.days }}</div>
            <div class="text-h5 q-mb-sm">Days Smoke-Free</div>
            <div class="text-subtitle2 opacity-80" v-if="stats.hours > 0 || stats.minutes > 0">
              {{ stats.hours }}h {{ stats.minutes }}m
            </div>
          </q-card-section>
        </q-card>

        <!-- Stats Grid -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-6">
            <q-card class="shadow-lg hover-lift animate-slide-up delay-1">
              <q-card-section>
                <q-icon name="block" color="red-6" size="40px" />
                <div class="text-h4 text-weight-bold q-mt-sm text-blue-9">
                  {{ stats.cigarettesAvoided }}
                </div>
                <div class="text-caption text-blue-6">Cigarettes Avoided</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-6">
            <q-card class="shadow-lg hover-lift animate-slide-up delay-2">
              <q-card-section>
                <q-icon name="savings" color="green-6" size="40px" />
                <div class="text-h4 text-weight-bold q-mt-sm text-blue-9">
                  ₱{{ stats.moneySaved.toFixed(2) }}
                </div>
                <div class="text-caption text-blue-6">Money Saved</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-6">
            <q-card class="shadow-lg hover-lift animate-slide-up delay-3">
              <q-card-section>
                <q-icon name="schedule" color="blue-6" size="40px" />
                <div class="text-h4 text-weight-bold q-mt-sm text-blue-9">
                  {{ Math.floor(stats.lifeRegained / 60) }}h
                </div>
                <div class="text-caption text-blue-6">Life Regained</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-6">
            <q-card class="shadow-lg hover-lift animate-slide-up delay-4">
              <q-card-section>
                <q-icon name="favorite" color="pink-6" size="40px" />
                <div class="text-h4 text-weight-bold q-mt-sm text-blue-9">
                  {{ stats.healthBoost }}%
                </div>
                <div class="text-caption text-blue-6">Health Boost</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Craving Help Button -->
        <q-btn
          @click="showCrave"
          color="orange-6"
          label="Craving a cigarette? Get Help Now!"
          size=""
          class="full-width q-mb-md animate-pulse"
          icon="help_outline"
        />
        <q-card class="q-mb-md shadow-lg">
          <q-carousel
            v-model="currentSlide"
            animated
            swipeable
            infinite
            :autoplay="carouselAutoplay"
            transition-prev="fade"
            transition-next="fade"
            height="170px"
            class="bg-gradient-blue text-white my-carousel"
            @update:model-value="restartAutoplay"
          >
            <q-carousel-slide
              v-for="(quote, idx) in motivationalQuotes"
              :key="idx"
              :name="idx"
              class="column flex-center text-center q-pa-lg"
            >
              <q-icon name="format_quote" size="32px" class="q-mb-sm opacity-50" />
              <div class="text-h6" style="font-style: italic; line-height: 1.6">
                {{ quote }}
              </div>
            </q-carousel-slide>
          </q-carousel>
        </q-card>

        <!-- Health Milestones -->
        <q-card class="q-mb-md shadow-lg">
          <q-card-section class="bg-blue-6 text-white">
            <div class="text-h6 text-weight-bold">
              <q-icon name="trending_up" class="q-mr-sm" />
              Health Milestones
            </div>
          </q-card-section>
          <q-card-section>
            <q-list>
              <q-item
                v-for="(milestone, idx) in healthMilestones"
                :key="idx"
                class="animate-slide-up"
                :style="{ animationDelay: `${idx * 0.05}s` }"
              >
                <q-item-section avatar>
                  <q-avatar color="blue-1" text-color="blue-6" icon="check_circle" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-blue-9">{{
                    milestone.time
                  }}</q-item-label>
                  <q-item-label caption class="text-blue-7">{{ milestone.benefit }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- Educational Tips -->
        <q-card class="q-mb-md shadow-lg">
          <q-card-section class="bg-blue-6 text-white">
            <div class="text-h6 text-weight-bold">
              <q-icon name="school" class="q-mr-sm" />
              Educational Tips
            </div>
          </q-card-section>
          <q-card-section>
            <q-list>
              <q-item
                v-for="(tip, idx) in educationalTips"
                :key="idx"
                class="animate-slide-up"
                :style="{ animationDelay: `${idx * 0.03}s` }"
              >
                <q-item-section avatar>
                  <q-badge color="blue-6" :label="idx + 1" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-blue-8 text-justify">{{ tip }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- Risk Factors -->
        <q-card class="q-mb-md shadow-lg">
          <q-card-section class="bg-red-6 text-white">
            <div class="text-h6 text-weight-bold">
              <q-icon name="warning" class="q-mr-sm" />
              Risk Factors of Smoking
            </div>
          </q-card-section>
          <q-card-section>
            <q-list>
              <q-item
                v-for="(risk, idx) in riskFactors"
                :key="idx"
                class="animate-slide-up"
                :style="{ animationDelay: `${idx * 0.03}s` }"
              >
                <q-item-section avatar>
                  <q-badge color="red-6" :label="idx + 1" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-red-8 text-justify">{{ risk }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- Health Benefits -->
        <q-card class="q-mb-md shadow-lg">
          <q-card-section class="bg-green-6 text-white">
            <div class="text-h6 text-weight-bold">
              <q-icon name="favorite" class="q-mr-sm" />
              Health Benefits of Reducing/Quitting Smoking
            </div>
          </q-card-section>
          <q-card-section>
            <q-list>
              <q-item
                v-for="(benefit, idx) in healthBenefits"
                :key="idx"
                class="animate-slide-up"
                :style="{ animationDelay: `${idx * 0.03}s` }"
              >
                <q-item-section avatar>
                  <q-badge color="green-6" :label="idx + 1" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-green-8 text-justify">{{ benefit }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
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

    <!-- Craving Dialog -->
    <q-dialog v-model="showCravingDialog">
      <q-card style="min-width: 350px; max-width: 500px">
        <q-card-section class="bg-blue-6 text-white">
          <div class="text-h6 text-weight-bold">
            <q-icon name="tips_and_updates" class="q-mr-sm" />
            Quick Tip to Beat Cravings
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="text-center q-mb-md">
            <q-icon name="self_improvement" size="48px" color="blue-6" />
          </div>
          <p class="text-body1 text-blue-9 text-center" style="line-height: 1.8">
            {{ randomCravingTip }}
          </p>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat size="md" label="Got it, thanks!" color="blue-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- User Details Dialog -->
    <q-dialog v-model="showUserDialog">
      <q-card>
        <q-card-section class="bg-blue-6 text-white">
          <div class="text-h5 text-weight-bold">
            <q-icon name="person" class="q-mr-sm" />
            {{ selectedUser?.name }}
          </div>
          <div class="text-subtitle2">User Details & Statistics</div>
        </q-card-section>

        <q-card-section v-if="selectedUser" class="q-pa-md">
          <div class="text-center q-mb-lg">
            <q-avatar color="blue-6" text-color="white" size="80px" class="q-mb-md">
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

          <!-- Progress Stats -->
          <div class="text-subtitle1 text-weight-bold text-blue-9 q-mb-md">
            <q-icon name="trending_up" class="q-mr-sm" />
            Progress Overview
          </div>

          <div class="row q-col-gutter-sm q-mb-lg">
            <div class="col-4">
              <q-card class="bg-blue-1 text-center">
                <q-card-section class="q-pa-sm">
                  <q-icon name="event" color="blue-6" size="md" />
                  <div class="text-h6 text-weight-bold text-blue-9 q-mt-xs">
                    {{ selectedUser.daysSmokeeFree }}
                  </div>
                  <div class="text-caption text-blue-7">Days Free</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-4">
              <q-card class="bg-red-1 text-center">
                <q-card-section class="q-pa-sm">
                  <q-icon name="block" color="red-6" size="md" />
                  <div class="text-h6 text-weight-bold text-red-9 q-mt-xs">
                    {{ selectedUser.cigarettesAvoided }}
                  </div>
                  <div class="text-caption text-red-7">Avoided</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-4">
              <q-card class="bg-green-1 text-center">
                <q-card-section class="q-pa-sm">
                  <q-icon name="savings" color="green-6" size="md" />
                  <div class="text-h6 text-weight-bold text-green-9 q-mt-xs">
                    ₱{{ selectedUser.moneySaved }}
                  </div>
                  <div class="text-caption text-green-7">Saved</div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- App Usage Statistics -->
          <div class="text-subtitle1 text-weight-bold text-blue-9 q-mb-md">
            <q-icon name="analytics" class="q-mr-sm" />
            App Usage Logs
          </div>

          <q-list bordered separator class="rounded-borders q-mb-md">
            <q-item>
              <q-item-section avatar>
                <q-avatar color="blue-2" text-color="blue-8" icon="today" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">Today's Opens</q-item-label>
                <q-item-label caption>Current day activity</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="blue-6" text-color="white" class="q-px-md q-py-xs">
                  {{ selectedUser.opensToday || 0 }} times
                </q-badge>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-avatar color="indigo-2" text-color="indigo-8" icon="date_range" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">This Week</q-item-label>
                <q-item-label caption>Last 7 days activity</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="indigo-6" text-color="white" class="q-px-md q-py-xs">
                  {{ calculateWeeklyOpens(selectedUser) }} times
                </q-badge>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-avatar color="purple-2" text-color="purple-8" icon="calendar_month" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">This Month</q-item-label>
                <q-item-label caption>Current month activity</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="purple-6" text-color="white" class="q-px-md q-py-xs">
                  {{ selectedUser.opensThisMonth || 0 }} times
                </q-badge>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-avatar color="grey-3" text-color="grey-8" icon="timeline" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">All Time</q-item-label>
                <q-item-label caption>Total app opens</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="grey-7" text-color="white" class="q-px-md q-py-xs">
                  {{ selectedUser.totalOpens || 0 }} times
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>

          <!-- Last Activity -->
          <q-card class="bg-grey-1">
            <q-card-section class="q-pa-md">
              <div class="text-caption text-grey-7 q-mb-xs">
                <q-icon name="schedule" size="xs" />
                Last App Open
              </div>
              <div class="text-body2 text-weight-medium text-grey-9">
                {{ selectedUser.lastAppOpen ? formatFullDate(selectedUser.lastAppOpen) : 'Never' }}
              </div>
              <div class="text-caption text-grey-6 q-mt-xs">
                {{ selectedUser.lastAppOpen ? formatDate(selectedUser.lastAppOpen) : '' }}
              </div>
            </q-card-section>
          </q-card>

          <q-separator class="q-my-md" />

          <!-- Additional Info -->
          <div class="text-caption text-grey-6">
            <div class="q-mb-xs">
              <q-icon name="calendar_today" size="xs" />
              Quit Date: {{ formatFullDate(selectedUser.quitDate) }}
            </div>
            <div class="q-mb-xs">
              <q-icon name="smoking_rooms" size="xs" />
              Previous: {{ selectedUser.cigarettesPerDay }} cigarettes/day
            </div>
            <div>
              <q-icon name="attach_money" size="xs" />
              Pack Price: ₱{{ selectedUser.pricePerPack }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Close" color="blue-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Admin PIN Dialog -->
    <q-dialog v-model="showPinDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="bg-blue-6 text-white">
          <div class="text-h6 text-weight-bold text-center">
            <q-icon name="lock" class="q-mr-sm" />
            Admin Authentication
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="text-center q-mb-md">
            <q-icon name="admin_panel_settings" size="64px" color="blue-6" />
          </div>
          <q-input
            v-model="adminPin"
            type="password"
            label="Enter Admin PIN"
            outlined
            autofocus
            color="blue-6"
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="vpn_key" />
            </template>
          </q-input>
          <div class="text-caption text-grey-6 text-center">
            Enter the 4-digit PIN to access admin dashboard
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" color="red" @click="closePinDialog" />
          <q-btn
            unelevated
            label="Verify"
            color="blue-6"
            @click="verifyAdminPin"
            :disable="!adminPin || adminPin.length < 4"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { LocalStorage } from 'quasar'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { userAPI } from '../services/api'

dayjs.extend(relativeTime)

export default {
  data() {
    return {
      deviceId: '',
      userName: '',
      hasStarted: false,
      quitDate: '',
      cigarettesPerDay: '',
      pricePerPack: '',
      showCravingDialog: false,
      currentSlide: 0,
      updateInterval: null,
      // carouselInterval: null,
      carouselAutoplay: 5000,
      carouselRestartTimer: null,
      showAdmin: false,
      allUsers: [],
      showUserDialog: false,
      selectedUser: null,
      isOnline: navigator.onLine,
      syncQueue: [],
      backgroundSyncInterval: null,

      showPinDialog: false,
      adminPin: '',
      correctPin: '1234', // Change this to your desired PIN
      isAdminAuthenticated: false,

      stats: {
        days: 0,
        hours: 0,
        minutes: 0,
        cigarettesAvoided: 0,
        moneySaved: 0,
        lifeRegained: 0,
        healthBoost: 0,
      },

      cravingTips: [
        'Delay Technique – Wait 5–10 minutes before smoking; cravings usually peak and pass.',
        'Deep Breathing – Slow breathing reduces stress-induced urges.',
        'Drink Water – Helps distract and reduces oral craving.',
        'Change Environment – Move to a smoke-free area.',
        'Hand-to-Mouth Substitute – Hold a pen, straw, or stress ball.',
        'Physical Activity – Short walks reduce nicotine cravings.',
        'Mental Distraction – Read, text a friend, or listen to music.',
        'Positive Self-Talk – Remind yourself why you want to reduce smoking.',
        'Avoid Triggers – Identify stress, boredom, or social cues.',
        'Delay First Cigarette – Helps reduce daily dependence.',
        'Cold Water Face Splash – Resets urge intensity.',
        'Chewing Sugar-Free Gum – Reduces oral fixation.',
        'Craving Log – Record time, place, and reason for urge.',
        'Breathing + Counting – Focus attention away from urge.',
        '"One Less Than Yesterday" Rule – Encourages gradual reduction.',
      ],

      motivationalQuotes: [
        'Every cigarette you skip is a step toward better health.',
        'Reducing smoking today helps your future self.',
        "You don't need to quit perfectly—progress still counts.",
        'Choosing health is choosing yourself.',
        'Small changes lead to big improvements.',
        'Your lungs begin to recover the moment you smoke less.',
        'You are stronger than your cravings.',
        'One less cigarette is already a win.',
        'Taking control of smoking is taking control of your life.',
        'You deserve a healthy body and clear mind.',
        'Progress, not perfection.',
        'Cutting down today protects the people you care about.',
        'Your efforts matter, even when they feel small.',
        'Every smoke-free moment helps your body heal.',
        'Staying consistent is more important than being fast.',
      ],

      healthMilestones: [
        {
          time: '20 minutes',
          benefit: 'Heart rate and blood pressure begin to drop.',
        },
        { time: '8–12 hours', benefit: 'Carbon monoxide levels decrease.' },
        { time: '24 hours', benefit: 'Oxygen levels improve.' },
        { time: '48 hours', benefit: 'Nerve endings begin to recover.' },
        { time: '72 hours', benefit: 'Breathing becomes easier.' },
        { time: '1 week', benefit: 'Lung irritation starts to reduce.' },
        { time: '2 weeks', benefit: 'Circulation improves.' },
        { time: '1 month', benefit: 'Coughing and fatigue decrease.' },
        { time: '2–3 months', benefit: 'Lung function improves.' },
        { time: '3–6 months', benefit: 'Immune function strengthens.' },
        { time: '6 months', benefit: 'Reduced respiratory infections.' },
        { time: '1 year', benefit: 'Heart disease risk drops significantly.' },
        { time: '2–5 years', benefit: 'Stroke risk decreases.' },
        { time: '5–10 years', benefit: 'Cancer risk declines.' },
        { time: 'Long-term', benefit: 'Improved quality of life.' },
      ],

      educationalTips: [
        'Cigarette smoke contains thousands of harmful chemicals, many of which damage the lungs and heart.',
        'Smoking increases the risk of heart disease and stroke, even in young adults.',
        'Secondhand smoke harms people around you, including friends and family.',
        'Smoking weakens the immune system, making infections more likely.',
        'Tobacco use reduces lung capacity and physical endurance.',
        'Early smoking initiation increases the risk of long-term addiction.',
        'Smoking is linked to cancers of the lung, mouth, throat, and esophagus.',
        'Even low levels of smoking can negatively affect blood circulation.',
        'Smoking worsens asthma and other respiratory conditions.',
        'Tobacco smoke exposure increases the risk of tuberculosis.',
        'Smoking affects skin health and accelerates aging.',
        'Cigarettes contribute to poor oral health and tooth loss.',
        'Smoking impacts mental focus and academic performance.',
        'Cutting down smoking reduces exposure to harmful toxins.',
        'No amount of smoking is considered safe.',
      ],

      riskFactors: [
        'Increased risk of lung cancer',
        'Higher chance of heart attack',
        'Greater risk of stroke',
        'Development of chronic lung disease (COPD)',
        'Reduced oxygen supply to the body',
        'Higher risk of tuberculosis',
        'Weakened immune defenses',
        'Increased blood pressure',
        'Poor circulation',
        'Reduced physical stamina',
        'Higher risk of diabetes complications',
        'Harm to non-smokers via secondhand smoke',
        'Greater nicotine dependence when started young',
        'Increased healthcare expenses',
      ],

      healthBenefits: [
        'Improved breathing and lung function',
        'Better heart health',
        'Reduced risk of heart disease',
        'Lower risk of stroke',
        'Improved blood circulation',
        'Better sense of taste and smell',
        'Increased energy levels',
        'Stronger immune system',
        'Healthier skin appearance',
        'Reduced coughing and shortness of breath',
        'Lower exposure to toxins',
        'Protection of family and peers from secondhand smoke',
        'Better physical endurance',
        'Improved concentration and focus',
        'Long-term improvement in quality of life',
      ],
      randomCravingTip: '',
    }
  },

  computed: {
    // Admin stats
    totalMoneySaved() {
      return this.allUsers.reduce((sum, user) => sum + parseFloat(user.moneySaved || 0), 0)
    },

    totalCigarettesAvoided() {
      return this.allUsers.reduce((sum, user) => sum + parseInt(user.cigarettesAvoided || 0), 0)
    },

    avgDaysSmokeeFree() {
      if (this.allUsers.length === 0) return 0
      const total = this.allUsers.reduce((sum, user) => sum + user.daysSmokeeFree, 0)
      return Math.round(total / this.allUsers.length)
    },

    formattedTime() {
      return `${this.stats.hours}h ${this.stats.minutes}m`
    },

    cigarettesAvoidedDisplay() {
      return this.stats.cigarettesAvoided || 0
    },

    moneySavedDisplay() {
      return `₱${this.stats.moneySaved.toFixed(2)}`
    },

    lifeRegainedDisplay() {
      return `${Math.floor(this.stats.lifeRegained / 60)}h`
    },

    healthBoostDisplay() {
      return `${this.stats.healthBoost}%`
    },

    isAdmin() {
      return this.userName.toLowerCase() === 'naifa'
    },

    // Check if device is registered
    isRegistered() {
      return !!this.deviceId
    },
  },

  // created() {
  //   this.$q = useQuasar();
  // },

  mounted() {
    window.addEventListener('online', this.handleOnlineStatus)
    window.addEventListener('offline', this.handleOfflineStatus)

    // Load data from LocalStorage
    this.loadFromLocalStorage()
    // this.startCarousel();
    this.setupAggressiveBackgroundSync()

    // ============================================
    // ONLY SYNC IF: Online AND has deviceId
    // ============================================
    if (this.isOnline && this.deviceId) {
      this.syncOnAppOpen()
    }
    if (this.carouselRestartTimer) {
      clearTimeout(this.carouselRestartTimer)
    }
  },

  beforeUnmount() {
    window.removeEventListener('online', this.handleOnlineStatus)
    window.removeEventListener('offline', this.handleOfflineStatus)

    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }

    if (this.backgroundSyncInterval) {
      clearInterval(this.backgroundSyncInterval)
    }

    this.saveToLocalStorage()
  },

  methods: {
    // ============================================
    // DEVICE ID METHODS
    // ============================================
    closePinDialog() {
      this.showPinDialog = false
      this.adminPin = ''
    },

    restartAutoplay() {
      // when user swipes or clicks dot navigation, autoplay pauses
      // this forces it to continue again
      this.carouselAutoplay = 0

      if (this.carouselRestartTimer) {
        clearTimeout(this.carouselRestartTimer)
      }

      this.carouselRestartTimer = setTimeout(() => {
        this.carouselAutoplay = 5000
      }, 200)
    },

    showCrave() {
      this.randomCravingTip = this.cravingTips[Math.floor(Math.random() * this.cravingTips.length)]
      this.showCravingDialog = true
      //       randomCravingTip() {
      //   const erre =
      //     this.cravingTips[Math.floor(Math.random() * this.cravingTips.length)];

      //   return erre;
      // },
    },

    async syncOnAppOpen() {
      try {
        // Step 1: Record app open
        if (this.deviceId) {
          await this.recordAppOpen()
        }

        // Step 2: Sync registration if user exists
        if (this.deviceId && this.userName) {
          await this.syncRegistration()
        }

        // Step 3: Sync tracking start if user has started
        if (this.deviceId && this.hasStarted && this.quitDate) {
          await this.syncTrackingStart()
        }

        // Step 4: Sync current progress if tracking
        if (this.hasStarted && this.deviceId) {
          await this.syncWithDatabase()
        }

        // Step 5: Process any queued syncs from offline
        if (this.syncQueue.length > 0) {
          await this.processSyncQueue()
        }

        // Step 6: Load admin data if admin
        if (this.showAdmin && this.isAdmin) {
          await this.loadAllUsers()
        }
      } catch (error) {
        console.error('❌ Sync error:', error)
      }
    },

    async recordAppOpen() {
      if (!this.deviceId) return

      try {
        await userAPI.recordAppOpen(this.deviceId, this.isOnline)
      } catch (error) {
        console.error('❌ Failed to record app open:', error)
        // Don't block if this fails
      }
    },

    async performAppOpenSync() {
      if (!this.deviceId) {
        return
      }

      try {
        // 1. Sync registration if user exists
        if (this.deviceId && this.userName) {
          await this.syncRegistration()
        }

        // 2. Sync tracking start if user has started
        if (this.deviceId && this.hasStarted && this.quitDate) {
          await this.syncTrackingStart()
        }

        // 3. Sync current progress if tracking started
        if (this.hasStarted && this.deviceId) {
          await this.syncWithDatabase()
        }

        // 4. Process any queued syncs
        if (this.syncQueue.length > 0) {
          await this.processSyncQueue()
        }

        // 5. Load admin data if admin view is active
        if (this.showAdmin) {
          await this.loadAllUsers()
        }
      } catch (error) {
        console.error('❌ App-open sync error:', error)
      }
    },

    getOrCreateDeviceId() {
      let deviceId = LocalStorage.getItem('quit-smoking-device-id')

      if (!deviceId) {
        deviceId = this.generateDeviceId()
        LocalStorage.set('quit-smoking-device-id', deviceId)
      }

      return deviceId
    },

    generateDeviceId() {
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 15)
      const random2 = Math.random().toString(36).substring(2, 15)
      const fingerprint = this.getBrowserFingerprint()

      return `device_${timestamp}_${random}${random2}_${fingerprint}`
    },

    getBrowserFingerprint() {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('fingerprint', 2, 2)

      const fingerprint = canvas.toDataURL().slice(-50)
      return fingerprint.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)
    },

    // ============================================
    // CORE CALCULATION METHODS
    // ============================================

    calculateStatsRealTime() {
      if (!this.hasStarted || !this.quitDate || !this.cigarettesPerDay || !this.pricePerPack) {
        return
      }

      const quitDateString = this.quitDate.endsWith('Z')
        ? this.quitDate.slice(0, -1)
        : this.quitDate

      const quitTime = dayjs(quitDateString)
      const now = dayjs()
      const diffMs = now.diff(quitTime)

      if (diffMs < 0) {
        this.stats = {
          days: 0,
          hours: 0,
          minutes: 0,
          cigarettesAvoided: 0,
          moneySaved: 0,
          lifeRegained: 0,
          healthBoost: 0,
        }
        return
      }

      const totalMinutes = Math.floor(diffMs / (1000 * 60))
      const totalHours = Math.floor(diffMs / (1000 * 60 * 60))
      const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      const remainingHours = totalHours % 24
      const remainingMinutes = totalMinutes % 60

      this.stats.days = totalDays
      this.stats.hours = remainingHours
      this.stats.minutes = remainingMinutes

      const cigarettesPerHour = this.cigarettesPerDay / 24
      this.stats.cigarettesAvoided = Math.floor(totalHours * cigarettesPerHour)

      this.stats.moneySaved = (this.stats.cigarettesAvoided / 20) * this.pricePerPack
      this.stats.lifeRegained = this.stats.cigarettesAvoided * 11
      this.stats.healthBoost = this.stats.days < 30 ? Math.round((this.stats.days / 30) * 100) : 100

      this.saveToLocalStorage()
    },

    // ============================================
    // SYNC METHODS
    // ============================================

    async syncRegistration() {
      if (!this.isOnline || !this.deviceId || !this.userName) {
        return false
      }

      try {
        const response = await userAPI.register(this.deviceId, this.userName)

        // Check response status if your API returns { success, message } or HTTP status
        if (response?.success) {
          // Remove from sync queue
          this.syncQueue = this.syncQueue.filter(
            (s) => !(s.type === 'register' && s.deviceId === this.deviceId),
          )

          this.saveToLocalStorage()
          return true
        } else {
          // Handle API returned error
          console.error('❌ Registration failed:', response?.message || response)

          // Add to queue if not already there
          const existsInQueue = this.syncQueue.some(
            (s) => s.type === 'register' && s.deviceId === this.deviceId,
          )

          if (!existsInQueue) {
            this.syncQueue.push({
              type: 'register',
              deviceId: this.deviceId,
              userName: this.userName,
              timestamp: new Date().toISOString(),
            })
            this.saveToLocalStorage()
          }

          return false
        }
      } catch (error) {
        console.error('❌ Failed to sync registration:', error)

        // Add to queue if not already there
        const existsInQueue = this.syncQueue.some(
          (s) => s.type === 'register' && s.deviceId === this.deviceId,
        )

        if (!existsInQueue) {
          this.syncQueue.push({
            type: 'register',
            deviceId: this.deviceId,
            userName: this.userName,
            timestamp: new Date().toISOString(),
          })
          this.saveToLocalStorage()
        }

        return false
      }
    },

    async syncTrackingStart() {
      if (!this.isOnline || !this.deviceId || !this.quitDate) {
        return false
      }

      try {
        const response = await userAPI.startTracking(
          this.deviceId,
          this.userName,
          this.quitDate,
          this.cigarettesPerDay,
          this.pricePerPack,
        )

        // Check response success
        if (response?.success) {
          // Remove from sync queue
          this.syncQueue = this.syncQueue.filter(
            (s) => !(s.type === 'start_tracking' && s.deviceId === this.deviceId),
          )
          this.saveToLocalStorage()
          return true
        } else {
          console.error('❌ Tracking start failed:', response?.message || response)

          // Add to queue if not already there
          const existsInQueue = this.syncQueue.some(
            (s) => s.type === 'start_tracking' && s.deviceId === this.deviceId,
          )
          if (!existsInQueue) {
            this.syncQueue.push({
              type: 'start_tracking',
              deviceId: this.deviceId,
              userName: this.userName,
              quitDate: this.quitDate,
              cigarettesPerDay: this.cigarettesPerDay,
              pricePerPack: this.pricePerPack,
              timestamp: new Date().toISOString(),
            })
            this.saveToLocalStorage()
          }
          return false
        }
      } catch (error) {
        console.error('❌ Failed to sync tracking start:', error)

        const existsInQueue = this.syncQueue.some(
          (s) => s.type === 'start_tracking' && s.deviceId === this.deviceId,
        )
        if (!existsInQueue) {
          this.syncQueue.push({
            type: 'start_tracking',
            deviceId: this.deviceId,
            userName: this.userName,
            quitDate: this.quitDate,
            cigarettesPerDay: this.cigarettesPerDay,
            pricePerPack: this.pricePerPack,
            timestamp: new Date().toISOString(),
          })
          this.saveToLocalStorage()
        }
        return false
      }
    },

    async syncWithDatabase() {
      if (!this.isOnline || !this.deviceId || !this.hasStarted) {
        return false
      }

      try {
        // Calculate current stats
        this.calculateStatsRealTime()

        const response = await userAPI.updateProgress(
          this.deviceId,
          this.stats.days,
          this.stats.cigarettesAvoided,
          parseFloat(this.stats.moneySaved.toFixed(2)),
        )

        // Check response success
        if (response?.success) {
          // Remove progress syncs from queue for this device
          this.syncQueue = this.syncQueue.filter((s) => !(s.deviceId === this.deviceId && !s.type))
          this.saveToLocalStorage()
          return true
        } else {
          console.error('❌ Progress sync failed:', response?.message || response)

          const now = new Date().toISOString()
          // Remove old progress syncs for this device and add new one
          this.syncQueue = this.syncQueue.filter((s) => !(s.deviceId === this.deviceId && !s.type))
          this.syncQueue.push({
            deviceId: this.deviceId,
            days: this.stats.days,
            cigarettesAvoided: this.stats.cigarettesAvoided,
            moneySaved: parseFloat(this.stats.moneySaved.toFixed(2)),
            timestamp: now,
          })
          this.saveToLocalStorage()
          return false
        }
      } catch (error) {
        console.error('❌ Failed to sync progress with database:', error)

        const now = new Date().toISOString()
        // Remove old progress syncs for this device and add new one
        this.syncQueue = this.syncQueue.filter((s) => !(s.deviceId === this.deviceId && !s.type))
        this.syncQueue.push({
          deviceId: this.deviceId,
          days: this.stats.days,
          cigarettesAvoided: this.stats.cigarettesAvoided,
          moneySaved: parseFloat(this.stats.moneySaved.toFixed(2)),
          timestamp: now,
        })
        this.saveToLocalStorage()
        return false
      }
    },

    async handleOnlineStatus() {
      this.isOnline = true

      if (this.hasStarted) {
        this.calculateStatsRealTime()
      }

      // Sync if we have a deviceId (registered user)
      if (this.deviceId) {
        await this.syncOnAppOpen()
      }
    },

    handleOfflineStatus() {
      this.isOnline = false
    },

    saveToLocalStorage() {
      if (!this.deviceId) return

      const localData = {
        deviceId: this.deviceId,
        userName: this.userName,
        quitDate: this.quitDate,
        cigarettesPerDay: this.cigarettesPerDay,
        pricePerPack: this.pricePerPack,
        hasStarted: this.hasStarted,
        stats: this.stats,
        lastCalculated: new Date().toISOString(),
      }

      LocalStorage.set('quit-smoking-data', localData)
      LocalStorage.set('quit-smoking-sync-queue', this.syncQueue)
    },

    loadFromLocalStorage() {
      const localData = LocalStorage.getItem('quit-smoking-data')
      const savedQueue = LocalStorage.getItem('quit-smoking-sync-queue')

      if (localData) {
        // Load deviceId - might be empty if user hasn't registered
        this.deviceId = localData.deviceId || ''
        this.userName = localData.userName || ''
        this.quitDate = localData.quitDate || ''
        this.cigarettesPerDay = localData.cigarettesPerDay || ''
        this.pricePerPack = localData.pricePerPack || ''
        this.hasStarted = localData.hasStarted || false

        if (this.hasStarted) {
          this.calculateStatsRealTime()
          this.startUpdateInterval()
        }
      }

      if (savedQueue && Array.isArray(savedQueue)) {
        this.syncQueue = savedQueue
      }
    },

    async processSyncQueue() {
      if (this.syncQueue.length === 0 || !this.isOnline) {
        return
      }

      // Sort by timestamp (oldest first)
      const sortedQueue = [...this.syncQueue].sort((a, b) =>
        dayjs(a.timestamp).diff(dayjs(b.timestamp)),
      )

      // Group by device and type, keeping only the latest of each
      const latestSyncs = {}
      sortedQueue.forEach((sync) => {
        const key = `${sync.deviceId}_${sync.type || 'progress'}`
        if (!latestSyncs[key] || dayjs(sync.timestamp).isAfter(dayjs(latestSyncs[key].timestamp))) {
          latestSyncs[key] = sync
        }
      })

      const syncsToProcess = Object.values(latestSyncs)
      const failedSyncs = []

      for (const data of syncsToProcess) {
        try {
          if (data.type === 'register') {
            await userAPI.register(data.deviceId, data.userName)
          } else if (data.type === 'start_tracking') {
            await userAPI.startTracking(
              data.deviceId,
              data.userName,
              data.quitDate,
              data.cigarettesPerDay,
              data.pricePerPack,
            )
          } else {
            // Progress update
            await userAPI.updateProgress(
              data.deviceId,
              data.days,
              data.cigarettesAvoided,
              data.moneySaved,
            )
          }
        } catch (error) {
          console.error(`❌ Failed to sync ${data.type || 'progress'}:`, error)
          failedSyncs.push(data)
        }
      }

      // Update sync queue with only failed items
      this.syncQueue = failedSyncs
      this.saveToLocalStorage()
    },

    setupAggressiveBackgroundSync() {
      // ❌ REMOVED: setInterval(() => { ... }, 30000)
      // NO MORE automatic 30-second syncing!

      // Only sync when user comes back to the tab
      document.addEventListener('visibilitychange', async () => {
        if (!document.hidden) {
          // Only sync if online AND has deviceId
          if (this.isOnline && this.deviceId) {
            await this.syncOnAppOpen()
          }
        }
      })

      // Save data before closing
      window.addEventListener('beforeunload', () => {
        this.saveToLocalStorage()

        // Send beacon sync if online and tracking
        if (this.isOnline && this.hasStarted && this.deviceId) {
          this.sendBeaconSync()
        }
      })

      // Sync when window gains focus (user clicks back to window)
      window.addEventListener('focus', async () => {
        // Only sync if online AND has deviceId
        if (this.isOnline && this.deviceId) {
          if (this.hasStarted) {
            this.calculateStatsRealTime()
          }

          await this.syncOnAppOpen()
        }
      })
    },

    // sendBeaconSync() {
    //   if (!this.hasStarted || !this.deviceId) return;

    //   const data = JSON.stringify({
    //     daysSmokeeFree: this.stats.days,
    //     cigarettesAvoided: this.stats.cigarettesAvoided,
    //     moneySaved: this.stats.moneySaved.toFixed(2),
    //   });

    //   const url = `${
    //     process.env.API_URL || "http://localhost:3000/api"
    //   }/users/${this.deviceId}/progress`;

    //   navigator.sendBeacon(url, data);
    // },

    sendBeaconSync() {
      if (!this.hasStarted || !this.deviceId) return

      const payload = {
        daysSmokeeFree: this.stats.days,
        cigarettesAvoided: this.stats.cigarettesAvoided,
        moneySaved: parseFloat(this.stats.moneySaved.toFixed(2)),
      }

      const url = `${
        process.env.API_URL || 'http://localhost:3000/api'
      }/users/${this.deviceId}/progress`

      const blob = new Blob([JSON.stringify(payload)], {
        type: 'application/json',
      })

      navigator.sendBeacon(url, blob)
    },

    // ============================================
    // DATA LOADING METHODS
    // ============================================

    async loadAllUsers() {
      if (!this.isOnline) return

      try {
        const users = await userAPI.getAllUsers()
        this.allUsers = users.map((user) => ({
          id: user.device_id,
          name: user.name,
          quitDate: user.quit_date,
          cigarettesPerDay: user.cigarettes_per_day,
          pricePerPack: user.price_per_pack,
          daysSmokeeFree: user.days_smoke_free,
          cigarettesAvoided: user.cigarettes_avoided,
          moneySaved: user.money_saved,
          lastUpdated: user.last_updated,
          // App opens statistics
          opensToday: parseInt(user.opens_today) || 0,
          opensThisMonth: parseInt(user.opens_this_month) || 0,
          totalOpens: parseInt(user.total_opens) || 0,
          lastAppOpen: user.last_app_open,
        }))
      } catch (error) {
        console.error('Error loading all users:', error)
      }
    },

    // ============================================
    // USER ACTION METHODS
    // ============================================

    async handleRegister() {
      if (!this.userName || this.userName.trim().length < 2) {
        this.$q.notify({
          color: 'negative',
          message: 'Please enter a valid name (at least 2 characters)',
          icon: 'error',
        })
        return
      }

      // ✅ GENERATE DEVICE ID HERE - ONLY when user registers!
      if (!this.deviceId) {
        this.deviceId = this.generateDeviceId()
        LocalStorage.set('quit-smoking-device-id', this.deviceId)
      }

      // Save to LocalStorage
      this.saveToLocalStorage()

      // Try to sync with server if online
      if (this.isOnline) {
        try {
          await userAPI.register(this.deviceId, this.userName)
        } catch (error) {
          console.error('❌ Server registration failed, will retry later:', error)

          // Add to sync queue
          const existsInQueue = this.syncQueue.some(
            (s) => s.type === 'register' && s.deviceId === this.deviceId,
          )

          if (!existsInQueue) {
            this.syncQueue.push({
              type: 'register',
              deviceId: this.deviceId,
              userName: this.userName,
              timestamp: new Date().toISOString(),
            })
            this.saveToLocalStorage()
          }
        }
      } else {
        // Add to sync queue
        this.syncQueue.push({
          type: 'register',
          deviceId: this.deviceId,
          userName: this.userName,
          timestamp: new Date().toISOString(),
        })
        this.saveToLocalStorage()
      }
    },

    async handleStart() {
      if (!this.quitDate || !this.cigarettesPerDay || !this.pricePerPack) {
        return
      }

      // Update local state first
      this.hasStarted = true
      this.saveToLocalStorage()
      this.calculateStatsRealTime()
      this.startUpdateInterval()

      // Prepare the payload for syncing
      const trackingData = {
        deviceId: this.deviceId,
        userName: this.userName,
        quitDate: this.quitDate,
        cigarettesPerDay: this.cigarettesPerDay,
        pricePerPack: this.pricePerPack,
      }

      try {
        if (this.isOnline) {
          // Attempt to sync tracking start
          const success = await this.syncTrackingStart(trackingData)

          // Also sync initial progress if tracking start succeeded
          if (success) {
            await this.syncWithDatabase()
          }
        } else {
          // Offline: just queue it
          this.addToSyncQueue('start_tracking', trackingData)
        }
      } catch (error) {
        console.error('❌ Start tracking error:', error)
        this.addToSyncQueue('start_tracking', trackingData)
      }
    },

    // Helper to add items to syncQueue safely
    addToSyncQueue(type, payload) {
      const existsInQueue = this.syncQueue.some(
        (s) => s.type === type && s.deviceId === payload.deviceId,
      )

      if (!existsInQueue) {
        this.syncQueue.push({
          type,
          ...payload,
          timestamp: new Date().toISOString(),
        })
        this.saveToLocalStorage()
      }
    },

    handleReset() {
      this.$q
        .dialog({
          title: 'Reset Progress',
          message:
            'Are you sure you want to reset all your progress? This will clear everything including your device registration.',
          cancel: true,
          persistent: true,
          color: 'negative',
        })
        .onOk(async () => {
          if (this.isOnline && this.deviceId) {
            try {
              await userAPI.deleteUser(this.deviceId)
            } catch (error) {
              console.error('❌ Error deleting from database:', error)
            }
          }

          if (this.updateInterval) {
            clearInterval(this.updateInterval)
          }

          // Clear ALL local storage including deviceId
          LocalStorage.remove('quit-smoking-device-id')
          LocalStorage.remove('quit-smoking-data')
          LocalStorage.remove('quit-smoking-sync-queue')

          // Reset ALL state including deviceId
          this.deviceId = '' // ✅ Clear deviceId too
          this.userName = ''
          this.quitDate = ''
          this.cigarettesPerDay = ''
          this.pricePerPack = ''
          this.hasStarted = false
          this.showCraving = false
          this.syncQueue = []
          this.stats = {
            days: 0,
            hours: 0,
            minutes: 0,
            cigarettesAvoided: 0,
            moneySaved: 0,
            lifeRegained: 0,
            healthBoost: 0,
          }
        })
    },

    // ============================================
    // HELPER METHODS
    // ============================================

    startUpdateInterval() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval)
      }

      this.updateInterval = setInterval(() => {
        if (this.hasStarted) {
          this.calculateStatsRealTime()
        }
      }, 1000)
    },

    // startCarousel() {
    //   if (this.carouselInterval) clearInterval(this.carouselInterval);
    //   this.carouselInterval = setInterval(() => {
    //     this.currentSlide =
    //       (this.currentSlide + 1) % this.motivationalQuotes.length;
    //   }, 5000);
    // },

    toggleAdminView() {
      if (!this.showAdmin && !this.isAdminAuthenticated) {
        // Show PIN dialog when entering admin view
        this.showPinDialog = true
      } else if (this.showAdmin) {
        // Exiting admin view
        this.showAdmin = false
      } else {
        // Already authenticated, just toggle
        this.showAdmin = !this.showAdmin
        if (this.showAdmin && this.isOnline) {
          this.loadAllUsers()
        }
      }
    },

    verifyAdminPin() {
      if (this.adminPin === this.correctPin) {
        this.isAdminAuthenticated = true
        this.showAdmin = true
        this.showPinDialog = false
        this.adminPin = ''

        if (this.isOnline) {
          this.loadAllUsers()
        }

        this.$q.notify({
          color: 'positive',
          message: 'Admin access granted',
          icon: 'admin_panel_settings',
          position: 'center',
          timeout: 1500,
          progress: true,
        })
      } else {
        this.$q.notify({
          color: 'negative',
          message: 'Incorrect PIN',
          icon: 'error',
          position: 'center',
          timeout: 1500,
          progress: true,
        })
        this.adminPin = ''
      }
    },

    calculateWeeklyOpens(user) {
      const monthly = user.opensThisMonth || 0
      const today = user.opensToday || 0
      return Math.max(today, Math.round(monthly * 0.25))
    },

    showUserDetails(user) {
      this.selectedUser = user
      this.showUserDialog = true
    },

    formatDate(dateStr) {
      return dayjs(dateStr).fromNow()
    },

    formatFullDate(dateStr) {
      return dayjs(dateStr).format('MMMM D, YYYY h:mm A')
    },

    getBadgeColor(days) {
      if (days > 30) return 'green'
      if (days > 7) return 'orange'
      return 'blue'
    },

    getBadgeLabel(days) {
      if (days > 30) return 'Champion'
      if (days > 7) return 'Strong'
      return 'Beginner'
    },
  },
}
</script>

<style scoped>
.bg-gradient {
  background: #f5f5f5;
  min-height: 100vh;
}

.bg-gradient-blue {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
}

.shadow-xl {
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.shadow-lg {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.hover-lift {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
}

.opacity-80 {
  opacity: 0.8;
}

.opacity-50 {
  opacity: 0.5;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}

.dot.active {
  width: 24px;
  border-radius: 4px;
  background: white;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.5s ease-out forwards;
  opacity: 0;
}

.animate-bounce {
  animation: bounce 2s ease-in-out infinite;
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}

.delay-1 {
  animation-delay: 0.1s;
}
.delay-2 {
  animation-delay: 0.2s;
}
.delay-3 {
  animation-delay: 0.3s;
}
.delay-4 {
  animation-delay: 0.4s;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* Professional card styling */
.registration-card {
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%);
}

/* Logo styling with subtle effects */
.logo-image {
  width: 100%;
  height: auto;
  max-width: 110px;
  max-height: 110px;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08));
  transition: transform 0.3s ease;
}

.logo-image:hover {
  transform: scale(1.05);
}

/* Elegant divider between logos */
.logo-divider {
  width: 2px;
  height: 60px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    #e0e0e0 20%,
    #e0e0e0 80%,
    transparent 100%
  );
}

/* Typography refinements */
.welcome-text {
  font-family: 'Roboto', sans-serif;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.tagline-text {
  font-weight: 400;
  line-height: 1.6;
  max-width: 320px;
  margin: 0 auto;
}

/* Modern input styling */
.input-modern {
  font-size: 16px;
}

.input-modern :deep(.q-field__control) {
  border-radius: 12px;
}

/* Modern button with better interaction */
.modern-button {
  border-radius: 12px;
  padding: 14px 0;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.25);
}

.modern-button:hover:not([disabled]) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(33, 150, 243, 0.35);
}

.modern-button:active:not([disabled]) {
  transform: translateY(0);
}

/* Responsive logo sizing - more refined */
@media (max-width: 599px) {
  .logo-image {
    max-width: 75px;
    max-height: 75px;
  }

  .logo-divider {
    height: 45px;
  }

  .welcome-text {
    font-size: 2rem;
  }

  .tagline-text {
    font-size: 0.9rem;
  }
}

@media (min-width: 600px) and (max-width: 1023px) {
  .logo-image {
    max-width: 95px;
    max-height: 95px;
  }

  .logo-divider {
    height: 55px;
  }
}

@media (min-width: 1024px) {
  .logo-image {
    max-width: 120px;
    max-height: 120px;
  }

  .logo-divider {
    height: 70px;
  }
}
</style>
