<template>
  <div class="plant-card">
    <!-- Header -->
    <div class="plant-header">
      <div class="plant-title-row">
        <span class="plant-icon">🌱</span>
        <span class="plant-title">Your Wellness Plant</span>
      </div>
      <div class="plant-stage-badge" :style="{ background: currentStage.badgeBg, color: currentStage.badgeColor }">
        {{ currentStage.name }}
      </div>
    </div>

    <!-- Plant Visual -->
    <div class="plant-scene">
      <div class="plant-glow" :style="{ background: currentStage.glowColor }"></div>

      <!-- Pot -->
      <div class="pot-wrap">
        <svg class="pot-svg" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Soil -->
          <ellipse cx="60" cy="18" rx="42" ry="10" fill="#6b4a2a" opacity="0.7"/>
          <!-- Pot body -->
          <path d="M18 18 Q14 60 22 72 Q60 82 98 72 Q106 60 102 18 Q60 28 18 18Z" fill="#c97a4a"/>
          <path d="M18 18 Q14 60 22 72 Q60 82 98 72 Q106 60 102 18 Q60 28 18 18Z" fill="url(#potGrad)"/>
          <!-- Pot rim -->
          <ellipse cx="60" cy="18" rx="44" ry="11" fill="#d4894f"/>
          <ellipse cx="60" cy="18" rx="42" ry="9" fill="#c97a4a"/>
          <defs>
            <linearGradient id="potGrad" x1="18" y1="18" x2="102" y2="72" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="white" stop-opacity="0.15"/>
              <stop offset="100%" stop-color="black" stop-opacity="0.1"/>
            </linearGradient>
          </defs>
        </svg>

        <!-- Plant layers by stage -->
        <div class="plant-growth" :class="`stage-${smokeDays}`">

          <!-- STAGE 0: Seed (0 days) -->
          <div v-if="currentStage.id === 0" class="seed-wrap">
            <div class="seed">🌰</div>
            <div class="seed-label">Just planted...</div>
          </div>

          <!-- STAGE 1: Sprout (1-2 days) -->
          <div v-else-if="currentStage.id === 1" class="sprout-wrap">
            <svg viewBox="0 0 80 80" class="plant-svg">
              <line x1="40" y1="75" x2="40" y2="35" stroke="#5d9460" stroke-width="4" stroke-linecap="round"/>
              <ellipse cx="32" cy="42" rx="12" ry="7" fill="#7eab7e" transform="rotate(-30 32 42)"/>
              <ellipse cx="48" cy="48" rx="12" ry="7" fill="#5d9460" transform="rotate(30 48 48)"/>
              <circle cx="40" cy="32" r="5" fill="#a8d4a8"/>
            </svg>
          </div>

          <!-- STAGE 2: Seedling (3-6 days) -->
          <div v-else-if="currentStage.id === 2" class="seedling-wrap">
            <svg viewBox="0 0 80 100" class="plant-svg plant-svg-tall">
              <line x1="40" y1="95" x2="40" y2="25" stroke="#5d9460" stroke-width="4" stroke-linecap="round"/>
              <ellipse cx="26" cy="55" rx="16" ry="9" fill="#7eab7e" transform="rotate(-25 26 55)"/>
              <ellipse cx="54" cy="65" rx="16" ry="9" fill="#5d9460" transform="rotate(25 54 65)"/>
              <ellipse cx="24" cy="38" rx="14" ry="8" fill="#a8d4a8" transform="rotate(-20 24 38)"/>
              <ellipse cx="56" cy="45" rx="14" ry="8" fill="#7eab7e" transform="rotate(20 56 45)"/>
              <circle cx="40" cy="22" r="7" fill="#b8e4b8"/>
            </svg>
          </div>

          <!-- STAGE 3: Young Plant (7-13 days) -->
          <div v-else-if="currentStage.id === 3" class="young-wrap">
            <svg viewBox="0 0 100 120" class="plant-svg plant-svg-large">
              <line x1="50" y1="115" x2="50" y2="20" stroke="#5d9460" stroke-width="5" stroke-linecap="round"/>
              <!-- branches -->
              <line x1="50" y1="80" x2="25" y2="55" stroke="#5d9460" stroke-width="3" stroke-linecap="round"/>
              <line x1="50" y1="65" x2="75" y2="45" stroke="#5d9460" stroke-width="3" stroke-linecap="round"/>
              <!-- leaves -->
              <ellipse cx="18" cy="48" rx="18" ry="10" fill="#7eab7e" transform="rotate(-30 18 48)"/>
              <ellipse cx="82" cy="38" rx="18" ry="10" fill="#5d9460" transform="rotate(30 82 38)"/>
              <ellipse cx="28" cy="75" rx="16" ry="9" fill="#a8d4a8" transform="rotate(-20 28 75)"/>
              <ellipse cx="72" cy="68" rx="16" ry="9" fill="#7eab7e" transform="rotate(20 72 68)"/>
              <ellipse cx="35" cy="35" rx="14" ry="8" fill="#b8e4b8" transform="rotate(-15 35 35)"/>
              <circle cx="50" cy="16" r="9" fill="#c8f4c8"/>
            </svg>
          </div>

          <!-- STAGE 4: Flowering (14-29 days) -->
          <div v-else-if="currentStage.id === 4" class="flower-wrap">
            <svg viewBox="-10 0 140 140" class="plant-svg plant-svg-xlarge">
              <line x1="60" y1="135" x2="60" y2="30" stroke="#5d9460" stroke-width="5" stroke-linecap="round"/>
              <line x1="60" y1="95" x2="28" y2="65" stroke="#5d9460" stroke-width="3" stroke-linecap="round"/>
              <line x1="60" y1="78" x2="92" y2="52" stroke="#5d9460" stroke-width="3" stroke-linecap="round"/>
              <line x1="60" y1="110" x2="35" y2="95" stroke="#5d9460" stroke-width="3" stroke-linecap="round"/>
              <!-- big leaves -->
              <ellipse cx="16" cy="56" rx="22" ry="12" fill="#7eab7e" transform="rotate(-35 16 56)"/>
              <ellipse cx="104" cy="44" rx="22" ry="12" fill="#5d9460" transform="rotate(35 104 44)"/>
              <ellipse cx="22" cy="90" rx="18" ry="10" fill="#a8d4a8" transform="rotate(-20 22 90)"/>
              <ellipse cx="98" cy="78" rx="18" ry="10" fill="#7eab7e" transform="rotate(20 98 78)"/>
              <!-- flower petals -->
              <circle cx="60" cy="14" r="7" fill="#ffd580" opacity="0.9" class="petal"/>
              <circle cx="72" cy="18" r="7" fill="#ffb347" opacity="0.9" class="petal"/>
              <circle cx="48" cy="18" r="7" fill="#ffd580" opacity="0.9" class="petal"/>
              <circle cx="68" cy="28" r="7" fill="#ffb347" opacity="0.9" class="petal"/>
              <circle cx="52" cy="28" r="7" fill="#ffd580" opacity="0.9" class="petal"/>
              <circle cx="60" cy="22" r="8" fill="#fff176"/>
            </svg>
          </div>

          <!-- STAGE 5: Full Bloom (30+ days) -->
          <div v-else class="bloom-wrap">
            <svg viewBox="-10 0 160 160" class="plant-svg plant-svg-full">
              <line x1="70" y1="155" x2="70" y2="35" stroke="#4a7a4a" stroke-width="6" stroke-linecap="round"/>
              <line x1="70" y1="110" x2="30" y2="75" stroke="#4a7a4a" stroke-width="4" stroke-linecap="round"/>
              <line x1="70" y1="88" x2="110" y2="58" stroke="#4a7a4a" stroke-width="4" stroke-linecap="round"/>
              <line x1="70" y1="130" x2="38" y2="112" stroke="#4a7a4a" stroke-width="3" stroke-linecap="round"/>
              <line x1="70" y1="125" x2="102" y2="108" stroke="#4a7a4a" stroke-width="3" stroke-linecap="round"/>
              <!-- lush leaves -->
              <ellipse cx="14" cy="64" rx="26" ry="14" fill="#7eab7e" transform="rotate(-35 14 64)"/>
              <ellipse cx="126" cy="50" rx="26" ry="14" fill="#5d9460" transform="rotate(35 126 50)"/>
              <ellipse cx="20" cy="106" rx="22" ry="12" fill="#a8d4a8" transform="rotate(-25 20 106)"/>
              <ellipse cx="120" cy="96" rx="22" ry="12" fill="#7eab7e" transform="rotate(25 120 96)"/>
              <ellipse cx="32" cy="80" rx="18" ry="10" fill="#b8e4b8" transform="rotate(-15 32 80)"/>
              <!-- big flower -->
              <circle cx="70" cy="15" r="9" fill="#ffd580" class="petal"/>
              <circle cx="86" cy="20" r="9" fill="#ffb347" class="petal"/>
              <circle cx="54" cy="20" r="9" fill="#ffd580" class="petal"/>
              <circle cx="82" cy="33" r="9" fill="#ffb347" class="petal"/>
              <circle cx="58" cy="33" r="9" fill="#ffd580" class="petal"/>
              <circle cx="70" cy="25" r="11" fill="#fff176"/>
              <!-- sparkles -->
              <text x="108" y="25" font-size="14" class="sparkle">✨</text>
              <text x="18" y="30" font-size="12" class="sparkle">🌟</text>
            </svg>
          </div>

        </div>
      </div>
    </div>

    <!-- Stage message -->
    <div class="plant-message">
      <p class="message-text">{{ currentStage.message }}</p>
    </div>

    <!-- Progress to next stage -->
    <div v-if="nextStage" class="progress-wrap">
      <div class="progress-label">
        <span>{{ daysToNext }} day{{ daysToNext !== 1 ? 's' : '' }} to {{ nextStage.name }}</span>
        <span>{{ nextStage.emoji }}</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" :style="{ width: progressPercent + '%', background: currentStage.barColor }"></div>
      </div>
    </div>
    <div v-else class="fully-bloomed">
      🌸 Fully bloomed! You're amazing!
    </div>

    <!-- Relapse warning (wilting) -->
    <div v-if="relapseToday" class="relapse-msg">
      🌧️ Every plant needs care. Let's try again tomorrow 💚
    </div>

  </div>
</template>

<script>
export default {
  name: 'VirtualPlant',

  props: {
    smokeDays:   { type: Number, default: 0 },
    relapseToday: { type: Boolean, default: false },
  },

  data() {
    return {
      stages: [
        {
          id: 0, name: 'Seed', emoji: '🌰', minDays: 0, maxDays: 0,
          message: 'Your journey begins. A tiny seed of hope is planted! 🌰',
          glowColor: 'radial-gradient(circle, rgba(180,140,90,0.3) 0%, transparent 70%)',
          badgeBg: '#ede0c4', badgeColor: '#7a5a30', barColor: '#c8a870',
        },
        {
          id: 1, name: 'Sprout', emoji: '🌱', minDays: 1, maxDays: 2,
          message: 'A tiny sprout emerges! Your lungs are already thanking you. 🌱',
          glowColor: 'radial-gradient(circle, rgba(126,171,126,0.3) 0%, transparent 70%)',
          badgeBg: '#d6efd6', badgeColor: '#2e4a2e', barColor: '#7eab7e',
        },
        {
          id: 2, name: 'Seedling', emoji: '🌿', minDays: 3, maxDays: 6,
          message: 'Growing stronger! Blood pressure is normalizing. Keep it up! 🌿',
          glowColor: 'radial-gradient(circle, rgba(126,171,126,0.35) 0%, transparent 70%)',
          badgeBg: '#c8e8c8', badgeColor: '#2e4a2e', barColor: '#5d9460',
        },
        {
          id: 3, name: 'Young Plant', emoji: '🪴', minDays: 7, maxDays: 13,
          message: 'One week strong! Your circulation is improving beautifully. 🪴',
          glowColor: 'radial-gradient(circle, rgba(93,148,96,0.4) 0%, transparent 70%)',
          badgeBg: '#b8d4b0', badgeColor: '#1e3a1e', barColor: '#4a8a50',
        },
        {
          id: 4, name: 'Flowering', emoji: '🌸', minDays: 14, maxDays: 29,
          message: 'Two weeks! Your plant is flowering — just like your health! 🌸',
          glowColor: 'radial-gradient(circle, rgba(255,213,128,0.35) 0%, transparent 70%)',
          badgeBg: '#fff3d6', badgeColor: '#7a5a10', barColor: '#ffb347',
        },
        {
          id: 5, name: 'Full Bloom', emoji: '🌻', minDays: 30, maxDays: Infinity,
          message: '30+ days smoke-free! Your plant is in FULL BLOOM. You are incredible! 🌻✨',
          glowColor: 'radial-gradient(circle, rgba(255,213,128,0.5) 0%, transparent 70%)',
          badgeBg: 'linear-gradient(135deg, #ffd580, #ffb347)', badgeColor: '#5a3a00', barColor: '#ffd580',
        },
      ],
    }
  },

  computed: {
    currentStage() {
      const days = this.smokeDays
      for (let i = this.stages.length - 1; i >= 0; i--) {
        if (days >= this.stages[i].minDays) return this.stages[i]
      }
      return this.stages[0]
    },

    nextStage() {
      const idx = this.stages.findIndex(s => s.id === this.currentStage.id)
      return idx < this.stages.length - 1 ? this.stages[idx + 1] : null
    },

    daysToNext() {
      return this.nextStage ? this.nextStage.minDays - this.smokeDays : 0
    },

    progressPercent() {
      if (!this.nextStage) return 100
      const start = this.currentStage.minDays
      const end   = this.nextStage.minDays
      const done  = this.smokeDays - start
      return Math.min(100, Math.round((done / (end - start)) * 100))
    },
  },
}
</script>

<style scoped>
.plant-card {
  background: linear-gradient(135deg, #f6f0e4, #eef5ee);
  border-radius: 20px;
  border: 1.5px solid #d4c4a0;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.07);
  overflow: visible; /* CHANGED from hidden */
  position: relative;
}

.plant-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.plant-title-row { display: flex; align-items: center; gap: 6px; }
.plant-icon { font-size: 1.2rem; }
.plant-title { font-size: 0.95rem; font-weight: 700; color: #2e4a2e; }
.plant-stage-badge {
  font-size: 0.72rem; font-weight: 700;
  padding: 3px 10px; border-radius: 20px; letter-spacing: 0.3px;
}

.plant-scene {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 200px; /* reduced — just enough for pot + plant */
  margin-bottom: 8px;
  overflow: visible;
}

.plant-glow {
  position: absolute;
  width: 200px; height: 200px;
  border-radius: 50%;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: glowPulse 3s ease-in-out infinite;
}
@keyframes glowPulse {
  0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
  50%       { opacity: 1;   transform: translate(-50%, -50%) scale(1.1); }
}

.pot-wrap {
  position: relative;
  width: 100%; /* fill available space */
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: visible;
}
.pot-svg { width: 120px; }

.plant-growth {
  position: absolute;
  bottom: 50px; /* sits just above soil */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  overflow: visible;
  animation: plantAppear 0.6s ease-out;
}
@keyframes plantAppear {
  from { opacity: 0; transform: translateX(-50%) scale(0.8); }
  to   { opacity: 1; transform: translateX(-50%) scale(1); }
}

/* SVG sizes exactly match their viewBox */
.plant-svg        { width: 80px;  height: 80px;  }
.plant-svg-tall   { width: 80px;  height: 100px; }
.plant-svg-large  { width: 100px; height: 120px; }
.plant-svg-xlarge { width: 120px; height: 140px; }
.plant-svg-full   { width: 140px; height: 160px; }

.seed-wrap { text-align: center; }
.seed      { font-size: 2.5rem; animation: seedBob 2s ease-in-out infinite; }
.seed-label{ font-size: 0.7rem; color: #9aaa90; margin-top: 4px; }
@keyframes seedBob {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-4px); }
}

.petal { animation: petalSway 3s ease-in-out infinite; }
@keyframes petalSway {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.08); }
}

.sparkle { animation: sparklePop 2s ease-in-out infinite; }
@keyframes sparklePop {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

.plant-message { text-align: center; margin-bottom: 12px; }
.message-text {
  font-size: 0.82rem; color: #5d7a5d;
  font-style: italic; margin: 0; line-height: 1.4;
}

.progress-wrap { margin-bottom: 4px; }
.progress-label {
  display: flex; justify-content: space-between;
  font-size: 0.72rem; color: #9aaa90; margin-bottom: 5px;
}
.progress-bar-bg {
  background: #e8dfc8; border-radius: 10px;
  height: 7px; overflow: hidden;
}
.progress-bar-fill {
  height: 100%; border-radius: 10px; transition: width 0.8s ease;
}

.fully-bloomed {
  text-align: center; font-size: 0.82rem;
  font-weight: 700; color: #5d9460; padding: 4px 0;
}

.relapse-msg {
  margin-top: 8px;
  background: rgba(201,122,138,0.12);
  border: 1px solid #e8aab8;
  border-radius: 10px; padding: 8px 12px;
  font-size: 0.78rem; color: #a85c6e; text-align: center;
}   
</style>