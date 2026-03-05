<template>
  <q-card class="q-mb-md shadow-lg animate-fade-in">
    <q-card-section class="bg-indigo-6 text-white">
      <div class="text-h6 text-weight-bold">
        <q-icon name="today" class="q-mr-sm" />Daily Check-In
      </div>
      <div class="text-caption">{{ todayDateLabel }}</div>
    </q-card-section>

    <q-card-section>
      <!-- Not yet logged today -->
      <div v-if="!todayLogged">
        <div class="text-body1 text-blue-9 q-mb-md text-center">Did you smoke today?</div>
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-btn @click="$emit('log', false)" color="green-6" icon="check_circle" label="No, I didn't!" unelevated class="full-width" size="lg" />
          </div>
          <div class="col-6">
            <q-btn @click="$emit('log', true)" color="red-4" icon="smoking_rooms" label="Yes, I did" outline class="full-width" size="lg" />
          </div>
        </div>
      </div>

      <!-- Already logged -->
      <div v-else class="text-center">
        <q-icon
          :name="todaySmoked ? 'sentiment_dissatisfied' : 'sentiment_very_satisfied'"
          :color="todaySmoked ? 'red-5' : 'green-6'"
          size="56px"
          class="q-mb-sm"
        />
        <div class="text-h6 text-weight-bold" :class="todaySmoked ? 'text-red-7' : 'text-green-7'">
          {{ todaySmoked ? "It's okay — every day is a new chance." : 'Amazing! You stayed smoke-free today! 🎉' }}
        </div>
        <div class="text-caption text-grey-6 q-mt-xs">Logged for today. See you tomorrow!</div>
        <div class="row justify-center q-mt-md q-col-gutter-md">
          <div class="col-auto">
            <q-chip color="orange-2" text-color="orange-9" icon="local_fire_department" size="lg">
              🔥 {{ currentStreak }} day streak
            </q-chip>
          </div>
          <div class="col-auto">
            <q-chip color="green-2" text-color="green-9" icon="block" size="lg">
              {{ totalSmokeFreedays }} smoke-free days total
            </q-chip>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: 'DailyCheckIn',

  props: {
    todayDateLabel:    { type: String,  required: true },
    todayLogged:       { type: Boolean, required: true },
    todaySmoked:       { type: Boolean, required: true },
    currentStreak:     { type: Number,  required: true },
    totalSmokeFreedays:{ type: Number,  required: true },
  },

  emits: ['log'],
}
</script>