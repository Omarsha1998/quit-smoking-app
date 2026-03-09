<template>
  <div class="reward-card">

    <!-- Header -->
    <div class="reward-header">
      <div class="reward-title-row">
        <span>🎁</span>
        <span class="reward-title">Mystery Reward Box</span>
      </div>
      <div class="reward-count-badge">{{ unlockedCount }}/{{ rewards.length }} unlocked</div>
    </div>

    <!-- Boxes grid -->
    <div class="boxes-grid">
      <div
        v-for="reward in rewards"
        :key="reward.id"
        class="reward-box"
        :class="{
          'reward-unlocked': isUnlocked(reward),
          'reward-locked':   !isUnlocked(reward),
          'reward-new':      isNew(reward),
        }"
        @click="openReward(reward)"
      >
        <!-- Locked state -->
        <template v-if="!isUnlocked(reward)">
          <div class="lock-icon">🔒</div>
          <div class="lock-days">Day {{ reward.requiredDays }}</div>
        </template>

        <!-- Unlocked but not opened -->
        <template v-else-if="!isOpened(reward)">
          <div class="box-emoji gift-bounce">🎁</div>
          <div class="box-new-tag">NEW!</div>
        </template>

        <!-- Opened -->
        <template v-else>
          <div class="box-reward-icon">{{ reward.icon }}</div>
          <div class="box-reward-type">{{ reward.type }}</div>
        </template>
      </div>
    </div>

    <!-- Reward Dialog -->
    <div v-if="showDialog" class="reward-overlay" @click.self="closeDialog">
      <div class="reward-dialog" :class="{ 'dialog-enter': showDialog }">
        <div class="dialog-confetti">
          <span v-for="i in 8" :key="i" class="confetti-piece" :style="confettiStyle(i)">{{ confettiEmojis[i % confettiEmojis.length] }}</span>
        </div>
        <div class="dialog-icon">{{ activeReward.icon }}</div>
        <div class="dialog-type">{{ activeReward.type }}</div>
        <div class="dialog-title">{{ activeReward.title }}</div>
        <div class="dialog-content">{{ activeReward.content }}</div>
        <button class="dialog-close" @click="closeDialog">✨ Claim Reward</button>
      </div>
    </div>

    <!-- Next unlock teaser -->
    <div v-if="nextReward" class="next-unlock">
      <span>🔓 Next unlock in {{ nextReward.requiredDays - smokeDays }} day{{ nextReward.requiredDays - smokeDays !== 1 ? 's' : '' }}</span>
      <span class="next-unlock-name">{{ nextReward.title }}</span>
    </div>

  </div>
</template>

<script>
export default {
  name: 'MysteryRewardBox',

  props: {
    smokeDays: { type: Number, default: 0 },
  },

  data() {
    return {
      openedRewards: [],
      showDialog:    false,
      activeReward:  null,
      confettiEmojis: ['🎉', '⭐', '💚', '🌿', '✨', '🎊'],

      rewards: [
        {
          id: 1, requiredDays: 1, icon: '💬', type: 'Quote',
          title: 'Your First Step',
          content: '"The secret of getting ahead is getting started." Every journey begins with a single day. You did it! 🌱',
        },
        {
          id: 2, requiredDays: 3, icon: '🌿', type: 'Self-Care Idea',
          title: '3-Day Warrior',
          content: 'Treat yourself today! Take a long warm shower, light a candle, and breathe in — your lungs are already healing. You deserve this moment. 🛁',
        },
        {
          id: 3, requiredDays: 7, icon: '⭐', type: 'Milestone Message',
          title: 'One Week Champion!',
          content: 'ONE WEEK! Your circulation has improved, your lung function is getting better. Science says cravings are now getting weaker. You are WINNING! 🏆',
        },
        {
          id: 4, requiredDays: 10, icon: '🎵', type: 'Self-Care Idea',
          title: '10-Day Reward',
          content: 'Create your "Smoke-Free Playlist" — songs that make you feel alive and free. Music is a powerful craving buster. What song defines your journey?  🎶',
        },
        {
          id: 5, requiredDays: 14, icon: '💌', type: 'Inspirational Message',
          title: 'Two Week Hero',
          content: 'Two weeks ago you made a decision that will add years to your life. Every morning you wake up, you are living proof that change is possible. Keep shining. 💚',
        },
        {
          id: 6, requiredDays: 21, icon: '🧘', type: 'Self-Care Idea',
          title: '21-Day Habit Formed!',
          content: 'They say it takes 21 days to form a habit. Today, being smoke-free IS your habit. Celebrate with 10 minutes of meditation — you have earned the peace. 🕊️',
        },
        {
          id: 7, requiredDays: 30, icon: '🌟', type: 'Milestone Message',
          content: 'A FULL MONTH! Your risk of heart attack is already dropping. Your sense of taste and smell are restored. You have saved money, saved time, and saved your life. YOU ARE INCREDIBLE. 🌟🎊',
        },
        {
          id: 8, requiredDays: 60, icon: '🏆', type: 'Grand Reward',
          title: 'Two Month Legend',
          content: 'Two months! You are no longer just quitting — you ARE a non-smoker. Your lung capacity is improving every single day. Share your story, you might inspire someone else to start their journey. 🦋',
        },
      ],
    }
  },

  computed: {
    unlockedCount() {
      return this.rewards.filter(r => this.isUnlocked(r)).length
    },
    nextReward() {
      return this.rewards.find(r => !this.isUnlocked(r)) || null
    },
  },

  mounted() {
    const saved = localStorage.getItem('pf-opened-rewards')
    if (saved) this.openedRewards = JSON.parse(saved)
  },

  methods: {
    isUnlocked(reward) {
      return this.smokeDays >= reward.requiredDays
    },
    isOpened(reward) {
      return this.openedRewards.includes(reward.id)
    },
    isNew(reward) {
      return this.isUnlocked(reward) && !this.isOpened(reward)
    },
    openReward(reward) {
      if (!this.isUnlocked(reward)) return
      this.activeReward = reward
      this.showDialog   = true
    },
    closeDialog() {
      if (!this.openedRewards.includes(this.activeReward.id)) {
        this.openedRewards.push(this.activeReward.id)
        localStorage.setItem('pf-opened-rewards', JSON.stringify(this.openedRewards))
      }
      this.showDialog  = false
      this.activeReward = null
    },
    confettiStyle(i) {
      const angle = (i / 8) * 360
      const dist  = 60 + Math.random() * 30
      return {
        transform: `rotate(${angle}deg) translateY(-${dist}px)`,
        animationDelay: `${i * 0.1}s`,
      }
    },
  },
}
</script>

<style scoped>
.reward-card {
  background: linear-gradient(135deg, #faf2e4, #f0ede4);
  border-radius: 20px;
  border: 1.5px solid #d4c4a0;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.07);
  position: relative;
}

/* Header */
.reward-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.reward-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #2e4a2e;
}
.reward-count-badge {
  font-size: 0.72rem;
  font-weight: 600;
  background: #d6efd6;
  color: #2e4a2e;
  padding: 3px 10px;
  border-radius: 20px;
}

/* Grid */
.boxes-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.reward-box {
  aspect-ratio: 1;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  position: relative;
  overflow: hidden;
}
.reward-box:active { transform: scale(0.93); }

/* Locked */
.reward-locked {
  background: #e8dfc8;
  border: 1.5px dashed #c4b090;
}
.lock-icon { font-size: 1.3rem; filter: grayscale(0.3); }
.lock-days { font-size: 0.6rem; color: #9a8a70; font-weight: 600; }

/* Unlocked not opened */
.reward-unlocked:not(.reward-box .box-reward-icon ~ *) {
  background: linear-gradient(135deg, #d6efd6, #b8d4b0);
  border: 1.5px solid #7eab7e;
  box-shadow: 0 4px 12px rgba(126,171,126,0.3);
}
.reward-new {
  background: linear-gradient(135deg, #fff3d6, #ffd580) !important;
  border: 1.5px solid #ffb347 !important;
  box-shadow: 0 4px 12px rgba(255,179,71,0.35) !important;
  animation: newPulse 2s ease-in-out infinite;
}
@keyframes newPulse {
  0%, 100% { box-shadow: 0 4px 12px rgba(255,179,71,0.35); }
  50%       { box-shadow: 0 4px 20px rgba(255,179,71,0.6); }
}

.box-emoji { font-size: 1.8rem; }
.gift-bounce { animation: giftBounce 1.5s ease-in-out infinite; }
@keyframes giftBounce {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50%       { transform: translateY(-5px) rotate(5deg); }
}
.box-new-tag {
  font-size: 0.55rem;
  font-weight: 800;
  color: #7a5a10;
  background: #fff;
  padding: 1px 5px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

/* Opened */
.reward-box:has(.box-reward-icon) {
  background: linear-gradient(135deg, #d6efd6, #b8d4b0);
  border: 1.5px solid #7eab7e;
}
.box-reward-icon { font-size: 1.5rem; }
.box-reward-type { font-size: 0.55rem; color: #2e4a2e; font-weight: 600; text-align: center; padding: 0 2px; }

/* Dialog overlay */
.reward-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.reward-dialog {
  background: linear-gradient(135deg, #faf2e4, #f6f0e4);
  border-radius: 24px;
  padding: 32px 24px 24px;
  text-align: center;
  max-width: 320px;
  width: 100%;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  animation: dialogPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes dialogPop {
  from { opacity: 0; transform: scale(0.7); }
  to   { opacity: 1; transform: scale(1); }
}

/* Confetti */
.dialog-confetti {
  position: absolute;
  top: 50%;
  left: 50%;
  pointer-events: none;
}
.confetti-piece {
  position: absolute;
  font-size: 1.2rem;
  animation: confettiFly 2s ease-out forwards;
}
@keyframes confettiFly {
  from { opacity: 1; transform: rotate(0deg) translateY(0); }
  to   { opacity: 0; }
}

.dialog-icon    { font-size: 3.5rem; margin-bottom: 8px; }
.dialog-type    { font-size: 0.72rem; font-weight: 700; color: #7eab7e; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
.dialog-title   { font-size: 1.15rem; font-weight: 800; color: #2e4a2e; margin-bottom: 12px; }
.dialog-content {
  font-size: 0.88rem;
  color: #5a6a5a;
  line-height: 1.6;
  margin-bottom: 20px;
  background: rgba(255,255,255,0.6);
  border-radius: 12px;
  padding: 12px;
}
.dialog-close {
  background: linear-gradient(135deg, #7eab7e, #5d9460);
  color: white;
  border: none;
  border-radius: 14px;
  padding: 12px 28px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  transition: transform 0.15s ease;
}
.dialog-close:active { transform: scale(0.96); }

/* Next unlock */
.next-unlock {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.72rem;
  color: #9aaa90;
  padding-top: 4px;
}
.next-unlock-name { color: #7eab7e; font-weight: 600; }
</style>