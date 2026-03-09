<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <div class="community-shell">

      <!-- ── Header ── -->
      <div class="comm-header">
        <div class="comm-header-glow" />
        <div class="comm-header-content">
          <button class="comm-close-btn" @click="$emit('update:modelValue', false)">✕</button>
          <div class="comm-header-title">
            <span>🌿</span>
            <span>Community</span>
          </div>
          <div class="comm-header-sub">Anonymous · Supportive · Motivating</div>
          <div class="comm-live-pill">
            <span class="comm-live-dot" />
            {{ communityParticipants }} people in the challenge
          </div>
        </div>
      </div>

      <!-- ── Scrollable body ── -->
      <div class="comm-body">

        <!-- ══ CHALLENGE CARD ══ -->
        <div class="comm-section">
          <div class="comm-section-label"><span>🏆</span> Active Challenge</div>

          <div class="challenge-card" :class="{ 'challenge-joined': joinedChallenge }">
            <div class="challenge-badge">7 DAYS</div>
            <div class="challenge-name">No Puff Challenge</div>
            <div class="challenge-desc">
              Stay smoke-free for 7 days alongside hundreds of anonymous participants. No pressure — just support.
            </div>

            <!-- 7-day progress dots based on real smoke-free days -->
            <div class="challenge-progress-row">
              <div
                v-for="d in 7"
                :key="d"
                class="challenge-day-dot"
                :class="{
                  'day-done':    smokeDays >= d,
                  'day-current': smokeDays === d - 1,
                  'day-future':  smokeDays < d - 1,
                }"
              >
                <span v-if="smokeDays >= d">✓</span>
                <span v-else>{{ d }}</span>
              </div>
            </div>

            <!-- Not joined yet -->
            <div v-if="!joinedChallenge">
              <button
                class="join-btn"
                :disabled="isJoining"
                @click="$emit('join')"
              >
                <span v-if="isJoining">Joining…</span>
                <span v-else>🌱 Join the Challenge</span>
              </button>
            </div>

            <!-- Already joined -->
            <div v-else class="challenge-joined-msg">
              <span class="joined-check">✓</span>
              You're in! Keep going — the community is rooting for you.
            </div>
          </div>
        </div>

        <!-- ══ ENCOURAGEMENT WALL ══ -->
        <div class="comm-section">
          <div class="comm-section-label">
            <span>💬</span> Encouragement Wall
            <span class="section-label-note">positive messages only</span>
          </div>

          <div v-if="loadingMessages" class="wall-loading">
            <div class="wall-loading-dot" v-for="i in 3" :key="i" :style="{ animationDelay: (i * 0.15) + 's' }" />
          </div>

          <div v-else class="wall-messages">
            <TransitionGroup name="msg-pop">
              <div
                v-for="(msg, idx) in encouragementMessages"
                :key="msg.id || idx"
                class="wall-msg"
                :class="[`wall-msg-color-${idx % 4}`]"
              >
                <div class="wall-msg-alias">{{ msg.alias }}</div>
                <div class="wall-msg-text">{{ msg.text || msg.message }}</div>
                <div class="wall-msg-time">{{ formatTime(msg.created_at) }}</div>
              </div>
            </TransitionGroup>

            <div v-if="!encouragementMessages.length" class="wall-empty">
              <div class="wall-empty-icon">🌱</div>
              <div>Be the first to share encouragement!</div>
            </div>
          </div>

          <!-- Post box -->
          <div class="post-box">
            <textarea
              :value="newMessage"
              @input="$emit('update:newMessage', $event.target.value)"
              class="post-input"
              placeholder="Share something kind and encouraging… (posted anonymously)"
              rows="2"
              maxlength="120"
            />
            <div class="post-row">
              <span class="post-char-count">{{ (newMessage || '').length }}/120</span>
              <button
                class="post-btn"
                :disabled="!newMessage || newMessage.trim().length < 3 || isPosting"
                @click="$emit('post')"
              >
                <span v-if="isPosting">Posting…</span>
                <span v-else>Send 🌿</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ══ LEADERBOARD ══ -->
        <div class="comm-section">
          <div class="comm-section-label">
            <span>🏅</span> Leaderboard
          </div>

          <div v-if="loadingLeaderboard" class="wall-loading">
            <div class="wall-loading-dot" v-for="i in 3" :key="i" :style="{ animationDelay: (i * 0.15) + 's' }" />
          </div>

          <div v-else-if="leaderboard.length" class="leaderboard">
            <div
              v-for="(entry, idx) in leaderboard"
              :key="idx"
              class="lb-row"
              :class="[`lb-rank-${idx + 1}`]"
            >
              <div class="lb-medal">
                <span v-if="idx === 0">🥇</span>
                <span v-else-if="idx === 1">🥈</span>
                <span v-else-if="idx === 2">🥉</span>
                <span v-else class="lb-rank-num">{{ idx + 1 }}</span>
              </div>
              <div class="lb-info">
                <div class="lb-alias">{{ entry.alias }}</div>
                <div class="lb-bar-wrap">
                  <div
                    class="lb-bar"
                    :style="{ width: Math.min(100, (entry.days / maxLeaderboardDays) * 100) + '%' }"
                  />
                </div>
              </div>
              <div class="lb-days">
                <span class="lb-days-num">{{ entry.days }}</span>
                <span class="lb-days-label">days</span>
              </div>
            </div>
          </div>

          <div v-else class="wall-empty">
            <div class="wall-empty-icon">🏅</div>
            <div>Join the challenge to appear on the leaderboard!</div>
          </div>
        </div>

        <div style="height: 32px;" />
      </div>

    </div>
  </q-dialog>
</template>

<script>
export default {
  name: 'CommunityDialog',

  props: {
    modelValue:            { type: Boolean, required: true },
    joinedChallenge:       { type: Boolean, required: true },
    communityParticipants: { type: Number,  required: true },
    newMessage:            { type: String,  required: true },
    encouragementMessages: { type: Array,   required: true },
    leaderboard:           { type: Array,   required: true },
    smokeDays:             { type: Number,  default: 0 },
    loadingMessages:       { type: Boolean, default: false },
    loadingLeaderboard:    { type: Boolean, default: false },
    isPosting:             { type: Boolean, default: false },
    isJoining:             { type: Boolean, default: false },
  },

  emits: ['update:modelValue', 'update:newMessage', 'join', 'post'],

  computed: {
    maxLeaderboardDays() {
      if (!this.leaderboard.length) return 1
      return Math.max(...this.leaderboard.map(e => e.days), 1)
    },
  },

  methods: {
    formatTime(ts) {
      if (!ts) return ''
      const d = new Date(ts)
      const now = new Date()
      const diffMs = now - d
      const diffMins = Math.floor(diffMs / 60000)
      if (diffMins < 1)  return 'just now'
      if (diffMins < 60) return `${diffMins}m ago`
      const diffHrs = Math.floor(diffMins / 60)
      if (diffHrs < 24)  return `${diffHrs}h ago`
      const diffDays = Math.floor(diffHrs / 24)
      return `${diffDays}d ago`
    },
  },
}
</script>

<style scoped>
.community-shell {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: #f4f0e8;
  overflow: hidden;
  font-family: 'Georgia', 'Times New Roman', serif;
}

.comm-header {
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  padding: 20px 20px 24px;
  background: linear-gradient(160deg, #3a6b3a 0%, #2e5230 60%, #1e3b20 100%);
}

.comm-header-glow {
  position: absolute;
  top: -40px; right: -40px;
  width: 180px; height: 180px;
  background: radial-gradient(circle, rgba(126,171,126,0.35) 0%, transparent 70%);
  pointer-events: none;
}

.comm-header-content { position: relative; z-index: 1; }

.comm-close-btn {
  position: absolute;
  top: 0; right: 0;
  width: 36px; height: 36px;
  border: none;
  background: rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.85);
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.comm-close-btn:hover { background: rgba(255,255,255,0.25); }

.comm-header-title {
  font-size: 1.7rem;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.comm-header-sub {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.65);
  font-style: italic;
  margin-bottom: 14px;
  letter-spacing: 0.4px;
}

.comm-live-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: rgba(255,255,255,0.13);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 0.78rem;
  color: rgba(255,255,255,0.9);
}

.comm-live-dot {
  width: 7px; height: 7px;
  background: #7edb7e;
  border-radius: 50%;
  box-shadow: 0 0 6px #7edb7e;
  animation: livePulse 1.8s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes livePulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(1.4); }
}

.comm-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 16px 0;
  -webkit-overflow-scrolling: touch;
}

.comm-section { margin-bottom: 20px; }

.comm-section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #4a6b4a;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 10px;
}

.section-label-note {
  font-size: 0.68rem;
  font-weight: 400;
  color: #9aaa90;
  font-style: italic;
  text-transform: none;
  letter-spacing: 0;
  margin-left: auto;
}

.challenge-card {
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  border: 2px solid #d4e8d4;
  box-shadow: 0 4px 20px rgba(93,148,96,0.10);
  transition: border-color 0.3s;
}

.challenge-card.challenge-joined {
  border-color: #7eab7e;
  background: linear-gradient(135deg, #f4fbf4, #fff);
}

.challenge-badge {
  display: inline-block;
  background: linear-gradient(135deg, #7eab7e, #5d9460);
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  padding: 3px 10px;
  border-radius: 20px;
  margin-bottom: 8px;
}

.challenge-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2e4a2e;
  margin-bottom: 6px;
}

.challenge-desc {
  font-size: 0.82rem;
  color: #7a8a7a;
  line-height: 1.5;
  margin-bottom: 16px;
  font-style: italic;
}

.challenge-progress-row {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
}

.challenge-day-dot {
  flex: 1;
  aspect-ratio: 1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  transition: all 0.3s;
}

.day-done {
  background: linear-gradient(135deg, #7eab7e, #5d9460);
  color: white;
  box-shadow: 0 2px 8px rgba(93,148,96,0.35);
}

.day-current {
  background: #ede0c4;
  color: #a87840;
  border: 2px dashed #c8a870;
  animation: dayPulse 2s ease-in-out infinite;
}

.day-future { background: #f0ece4; color: #c0b090; }

@keyframes dayPulse {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.08); }
}

.join-btn {
  width: 100%;
  padding: 13px;
  border: none;
  border-radius: 12px;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(135deg, #7eab7e, #5d9460);
  color: white;
  box-shadow: 0 3px 14px rgba(93,148,96,0.30);
  font-family: 'Georgia', serif;
  transition: all 0.2s;
}

.join-btn:disabled { background: #c4dcc4; box-shadow: none; cursor: not-allowed; }
.join-btn:not(:disabled):active { transform: scale(0.97); }

.challenge-joined-msg {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #f0fbf0;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 0.83rem;
  color: #3a6b3a;
  line-height: 1.5;
  font-style: italic;
}

.joined-check {
  background: linear-gradient(135deg, #7eab7e, #5d9460);
  color: white;
  width: 22px; height: 22px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.wall-loading {
  display: flex;
  gap: 8px;
  justify-content: center;
  padding: 24px;
}

.wall-loading-dot {
  width: 8px; height: 8px;
  background: #b8d4b0;
  border-radius: 50%;
  animation: loadBounce 0.9s ease-in-out infinite;
}

@keyframes loadBounce {
  0%, 100% { transform: translateY(0); opacity: 0.5; }
  50%       { transform: translateY(-6px); opacity: 1; }
}

.wall-messages {
  max-height: 240px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  -webkit-overflow-scrolling: touch;
}

.wall-msg { border-radius: 12px; padding: 10px 14px; }

.wall-msg-color-0 { background: #f0fbf0; }
.wall-msg-color-1 { background: #faf4ea; }
.wall-msg-color-2 { background: #f0f4fb; }
.wall-msg-color-3 { background: #fdf0f4; }

.wall-msg-alias {
  font-size: 0.68rem;
  color: #9aaa90;
  font-style: italic;
  margin-bottom: 3px;
}

.wall-msg-text {
  font-size: 0.88rem;
  color: #3a4a3a;
  line-height: 1.45;
}

.wall-msg-time {
  font-size: 0.62rem;
  color: #c0b890;
  margin-top: 4px;
}

.wall-empty {
  text-align: center;
  padding: 28px 20px;
  color: #b0a890;
  font-size: 0.82rem;
  font-style: italic;
}

.wall-empty-icon { font-size: 2rem; margin-bottom: 8px; }

.msg-pop-enter-active { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.msg-pop-enter-from   { opacity: 0; transform: translateY(-10px) scale(0.96); }

.post-box {
  background: #fff;
  border-radius: 14px;
  border: 1.5px solid #d4e8d4;
  overflow: hidden;
}

.post-input {
  width: 100%;
  padding: 12px 14px;
  border: none;
  outline: none;
  resize: none;
  font-size: 0.88rem;
  color: #3a4a3a;
  background: transparent;
  font-family: 'Georgia', serif;
  line-height: 1.5;
  box-sizing: border-box;
}

.post-input::placeholder { color: #b8c8b8; font-style: italic; }

.post-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px 10px;
  border-top: 1px solid #eef4ee;
}

.post-char-count { font-size: 0.68rem; color: #b8c8b8; }

.post-btn {
  background: linear-gradient(135deg, #7eab7e, #5d9460);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 7px 18px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Georgia', serif;
  transition: all 0.2s;
  min-width: 80px;
}

.post-btn:disabled { background: #d4e8d4; color: #9aaa90; cursor: not-allowed; }
.post-btn:not(:disabled):active { transform: scale(0.95); }

.leaderboard { display: flex; flex-direction: column; gap: 8px; }

.lb-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 14px;
  padding: 12px 14px;
  border: 1.5px solid #e8e4da;
}

.lb-rank-1 { border-color: #f0d070; background: linear-gradient(135deg, #fffdf0, #fff); }
.lb-rank-2 { border-color: #d0d8e0; }
.lb-rank-3 { border-color: #e8c4a0; }

.lb-medal { font-size: 1.4rem; width: 36px; text-align: center; flex-shrink: 0; }

.lb-rank-num {
  display: inline-flex;
  width: 28px; height: 28px;
  background: #f0ece4;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #9a8a7a;
}

.lb-info { flex: 1; min-width: 0; }

.lb-alias {
  font-size: 0.9rem;
  font-weight: 700;
  color: #2e4a2e;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lb-bar-wrap {
  height: 4px;
  background: #f0ece4;
  border-radius: 2px;
  overflow: hidden;
}

.lb-bar {
  height: 100%;
  background: linear-gradient(90deg, #b8d4b0, #7eab7e);
  border-radius: 2px;
  transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.lb-rank-1 .lb-bar { background: linear-gradient(90deg, #f0d070, #d4a820); }

.lb-days { text-align: right; flex-shrink: 0; line-height: 1; }

.lb-days-num {
  font-size: 1rem;
  font-weight: 700;
  color: #5d9460;
  display: block;
}

.lb-days-label { font-size: 0.62rem; color: #9aaa90; }
</style>