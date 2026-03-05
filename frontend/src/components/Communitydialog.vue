<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 340px; max-width: 500px; max-height: 85vh" class="column">
      <q-card-section class="bg-indigo-6 text-white">
        <div class="text-h6 text-weight-bold"><q-icon name="groups" class="q-mr-sm" />Community Challenges</div>
        <div class="text-caption">Anonymous, supportive, and motivating</div>
      </q-card-section>

      <q-card-section class="col overflow-auto">
        <!-- Active challenge banner -->
        <q-banner class="bg-indigo-1 text-indigo-9 q-mb-md rounded-borders">
          <template v-slot:avatar><q-icon name="emoji_events" color="indigo-6" /></template>
          <div class="text-weight-bold">7-Day No Puff Challenge</div>
          <div class="text-caption">{{ communityParticipants }} anonymous participants</div>
          <template v-slot:action>
            <q-btn v-if="!joinedChallenge" flat color="indigo-7" label="Join" @click="$emit('join')" />
            <q-chip v-else color="green-2" text-color="green-9" icon="check">Joined!</q-chip>
          </template>
        </q-banner>

        <!-- Encouragement wall -->
        <div class="text-subtitle2 text-weight-bold text-indigo-9 q-mb-sm">
          <q-icon name="favorite" class="q-mr-xs" color="pink-5" />Encouragement Wall
        </div>
        <div class="encouragement-wall q-mb-md">
          <div
            v-for="(msg, idx) in encouragementMessages"
            :key="idx"
            class="encouragement-msg q-pa-sm q-mb-xs rounded-borders"
            :class="idx % 2 === 0 ? 'bg-blue-1' : 'bg-indigo-1'"
          >
            <div class="text-caption text-grey-6">{{ msg.alias }}</div>
            <div class="text-body2 text-blue-9">{{ msg.text }}</div>
          </div>
        </div>

        <!-- Post message -->
        <q-input
          :model-value="newMessage"
          @update:model-value="$emit('update:newMessage', $event)"
          outlined
          label="Share an encouraging message (anonymous)"
          color="indigo-6"
          class="q-mb-sm"
          maxlength="120"
          counter
        >
          <template v-slot:prepend><q-icon name="edit" /></template>
        </q-input>
        <q-btn
          @click="$emit('post')"
          :disable="!newMessage || newMessage.trim().length < 3"
          color="indigo-6"
          label="Post Anonymously"
          unelevated
          class="full-width q-mb-md"
          icon="send"
        />

        <!-- Leaderboard -->
        <div class="text-subtitle2 text-weight-bold text-indigo-9 q-mb-sm">
          <q-icon name="leaderboard" class="q-mr-xs" />Anonymous Leaderboard
        </div>
        <q-list bordered separator class="rounded-borders">
          <q-item v-for="(entry, idx) in leaderboard" :key="idx">
            <q-item-section avatar>
              <q-avatar
                :color="idx === 0 ? 'amber-6' : idx === 1 ? 'grey-5' : idx === 2 ? 'deep-orange-4' : 'blue-3'"
                text-color="white"
                size="36px"
              >{{ idx + 1 }}</q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ entry.alias }}</q-item-label>
              <q-item-label caption>{{ entry.days }} days smoke-free</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon v-if="idx === 0" name="emoji_events" color="amber-6" size="24px" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Close" color="indigo-6" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'CommunityDialog',

  props: {
    modelValue:           { type: Boolean, required: true },
    joinedChallenge:      { type: Boolean, required: true },
    communityParticipants:{ type: Number,  required: true },
    newMessage:           { type: String,  required: true },
    encouragementMessages:{ type: Array,   required: true },
    leaderboard:          { type: Array,   required: true },
  },

  emits: ['update:modelValue', 'update:newMessage', 'join', 'post'],
}
</script>