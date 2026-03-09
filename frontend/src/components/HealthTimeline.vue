<template>
  <div class="timeline-card">

    <!-- Header -->
    <div class="timeline-header">
      <div class="timeline-title-row">
        <span>❤️</span>
        <span class="timeline-title">Health Recovery Timeline</span>
      </div>
      <div class="timeline-done-badge">{{ completedCount }}/{{ milestones.length }} achieved</div>
    </div>

    <!-- Overall health score -->
    <div class="health-score-wrap">
      <div class="health-score-label">Overall Health Recovery</div>
      <div class="health-score-bar-bg">
        <div class="health-score-bar-fill" :style="{ width: overallScore + '%' }">
          <span class="health-score-value">{{ overallScore }}%</span>
        </div>
      </div>
    </div>

    <!-- Timeline -->
    <div class="timeline-list">
      <div
        v-for="(milestone, index) in milestones"
        :key="milestone.id"
        class="timeline-item"
        :class="{
          'tl-achieved':   isAchieved(milestone),
          'tl-upcoming':  !isAchieved(milestone) && isNext(index),
          'tl-future':    !isAchieved(milestone) && !isNext(index),
        }"
      >
        <!-- Line connector -->
        <div class="tl-connector">
          <div class="tl-line" :class="{ 'tl-line-done': isAchieved(milestone) }"></div>
          <div class="tl-dot" :class="{ 'tl-dot-done': isAchieved(milestone), 'tl-dot-next': isNext(index) && !isAchieved(milestone) }">
            <span v-if="isAchieved(milestone)" class="tl-check">✓</span>
            <span v-else-if="isNext(index)" class="tl-pulse-dot"></span>
          </div>
        </div>

        <!-- Content -->
        <div class="tl-content">
          <div class="tl-time-label" :class="{ 'tl-time-done': isAchieved(milestone) }">
            {{ milestone.timeLabel }}
          </div>
          <div class="tl-benefit">{{ milestone.benefit }}</div>
          <div v-if="isAchieved(milestone)" class="tl-achieved-tag">✅ Achieved!</div>
          <div v-else-if="isNext(index)" class="tl-upcoming-tag">
            {{ daysUntil(milestone) }} day{{ daysUntil(milestone) !== 1 ? 's' : '' }} away
          </div>
          <!-- Progress bar for current milestone -->
          <div v-if="isNext(index)" class="tl-progress-wrap">
            <div class="tl-progress-bg">
              <div class="tl-progress-fill" :style="{ width: milestoneProgress(milestone, index) + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- Icon -->
        <div class="tl-icon" :class="{ 'tl-icon-done': isAchieved(milestone) }">
          {{ milestone.icon }}
        </div>

      </div>
    </div>

    <!-- Future projection -->
    <!--
    <div class="future-projection">
      <div class="projection-title">🔮 Your Future at 1 Year Smoke-Free</div>
      <div class="projection-grid">
        <div class="projection-item">
          <div class="proj-icon">💰</div>
          <div class="proj-value">₱{{ yearlySavings.toLocaleString() }}</div>
          <div class="proj-label">Saved</div>
        </div>
        <div class="projection-item">
          <div class="proj-icon">🚬</div>
          <div class="proj-value">{{ yearlyAvoided.toLocaleString() }}</div>
          <div class="proj-label">Cigs Avoided</div>
        </div>
        <div class="projection-item">
          <div class="proj-icon">⏰</div>
          <div class="proj-value">{{ yearlyDays }}d</div>
          <div class="proj-label">Life Regained</div>
        </div>
      </div>
    </div>
    -->
  </div>
</template>

<script>
export default {
  name: 'HealthTimeline',

  props: {
    smokeDays:        { type: Number, default: 0 },
    cigarettesPerDay: { type: Number, default: 10 },
    pricePerPack:     { type: Number, default: 0 },
  },

  data() {
    return {
      milestones: [
        { id: 1,  days: 0.014, timeLabel: '20 Minutes',   icon: '❤️',  benefit: 'Heart rate and blood pressure drop to normal levels.' },
        { id: 2,  days: 0.5,   timeLabel: '12 Hours',     icon: '🫁',  benefit: 'Carbon monoxide levels in blood return to normal.' },
        { id: 3,  days: 1,     timeLabel: '1 Day',        icon: '🩺',  benefit: 'Risk of heart attack begins to decrease significantly.' },
        { id: 4,  days: 2,     timeLabel: '2 Days',       icon: '👃',  benefit: 'Sense of smell and taste begin to improve noticeably.' },
        { id: 5,  days: 3,     timeLabel: '3 Days',       icon: '💨',  benefit: 'Lung capacity increases. Breathing becomes easier.' },
        { id: 6,  days: 7,     timeLabel: '1 Week',       icon: '🔄',  benefit: 'Circulation improves. Nicotine fully cleared from body.' },
        { id: 7,  days: 14,    timeLabel: '2 Weeks',      icon: '🏃',  benefit: 'Lung function improves up to 30%. Walking gets easier.' },
        { id: 8,  days: 30,    timeLabel: '1 Month',      icon: '🫀',  benefit: 'Cilia in lungs regenerate. Infection risk drops.' },
        { id: 9,  days: 90,    timeLabel: '3 Months',     icon: '💪',  benefit: 'Lung capacity significantly improved. Less coughing.' },
        { id: 10, days: 180,   timeLabel: '6 Months',     icon: '🌟',  benefit: 'Stress levels lower than when you were smoking.' },
        { id: 11, days: 365,   timeLabel: '1 Year',       icon: '🏆',  benefit: 'Heart disease risk cut in HALF compared to a smoker.' },
        { id: 12, days: 1825,  timeLabel: '5 Years',      icon: '🧠',  benefit: 'Stroke risk reduced to that of a non-smoker.' },
        { id: 13, days: 3650,  timeLabel: '10 Years',     icon: '🎗️', benefit: 'Lung cancer risk drops to half that of a smoker.' },
        { id: 14, days: 5475,  timeLabel: '15 Years',     icon: '🌈',  benefit: 'Heart disease risk same as someone who never smoked.' },
      ],
    }
  },

  computed: {
    completedCount() {
      return this.milestones.filter(m => this.isAchieved(m)).length
    },

    overallScore() {
      return Math.round((this.completedCount / this.milestones.length) * 100)
    },

    yearlySavings() {
      const packsPerDay = this.cigarettesPerDay / 20
      return Math.round(packsPerDay * this.pricePerPack * 365)
    },

    yearlyAvoided() {
      return this.cigarettesPerDay * 365
    },

    yearlyDays() {
      // Approx 11 minutes per cigarette
      return Math.round((this.yearlyAvoided * 11) / (60 * 24))
    },
  },

  methods: {
    isAchieved(milestone) {
      return this.smokeDays >= milestone.days
    },

    isNext(index) {
      // The first unachieved milestone
      return !this.isAchieved(this.milestones[index]) &&
        (index === 0 || this.isAchieved(this.milestones[index - 1]))
    },

    daysUntil(milestone) {
      return Math.ceil(milestone.days - this.smokeDays)
    },

    milestoneProgress(milestone, index) {
      const prevDays = index > 0 ? this.milestones[index - 1].days : 0
      const range    = milestone.days - prevDays
      const done     = this.smokeDays - prevDays
      return Math.min(100, Math.max(0, Math.round((done / range) * 100)))
    },
  },
}
</script>

<style scoped>
.timeline-card {
  background: linear-gradient(135deg, #f6f0e4, #f0f6f0);
  border-radius: 20px;
  border: 1.5px solid #d4c4a0;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.07);
}

/* Header */
.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.timeline-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #2e4a2e;
}
.timeline-done-badge {
  font-size: 0.72rem;
  font-weight: 600;
  background: #d6efd6;
  color: #2e4a2e;
  padding: 3px 10px;
  border-radius: 20px;
}

/* Health score */
.health-score-wrap { margin-bottom: 16px; }
.health-score-label {
  font-size: 0.75rem;
  color: #7a8a7a;
  margin-bottom: 5px;
  font-weight: 600;
}
.health-score-bar-bg {
  background: #e0d8c8;
  border-radius: 12px;
  height: 22px;
  overflow: hidden;
}
.health-score-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #7eab7e, #5d9460);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  transition: width 1s ease;
  min-width: 36px;
}
.health-score-value {
  font-size: 0.72rem;
  font-weight: 800;
  color: white;
}

/* Timeline list */
.timeline-list { margin-bottom: 16px; }

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 0;
  margin-bottom: 0;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}
.tl-achieved { opacity: 1; }
.tl-upcoming { opacity: 1; }

/* Connector */
.tl-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 28px;
  flex-shrink: 0;
}
.tl-line {
  width: 2px;
  flex: 1;
  min-height: 16px;
  background: #d4c4a0;
  margin: 0 auto;
}
.tl-line-done { background: #7eab7e; }

.tl-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #d4c4a0;
  border: 2px solid #c4b490;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin: 2px 0;
}
.tl-dot-done {
  background: linear-gradient(135deg, #7eab7e, #5d9460);
  border-color: #5d9460;
}
.tl-dot-next {
  background: #fff3d6;
  border-color: #ffb347;
  animation: nextPulse 1.5s ease-in-out infinite;
}
@keyframes nextPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,179,71,0.4); }
  50%       { box-shadow: 0 0 0 6px rgba(255,179,71,0); }
}
.tl-check { font-size: 0.65rem; color: white; font-weight: 800; }
.tl-pulse-dot {
  width: 8px; height: 8px;
  background: #ffb347;
  border-radius: 50%;
}

/* Content */
.tl-content {
  flex: 1;
  padding: 2px 8px 12px 6px;
}
.tl-time-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #9aaa90;
  margin-bottom: 2px;
}
.tl-time-done { color: #5d9460; }

.tl-benefit {
  font-size: 0.78rem;
  color: #5a6a5a;
  line-height: 1.4;
}

.tl-achieved-tag {
  font-size: 0.65rem;
  color: #5d9460;
  font-weight: 700;
  margin-top: 3px;
}
.tl-upcoming-tag {
  font-size: 0.65rem;
  color: #c8a030;
  font-weight: 600;
  margin-top: 3px;
}

/* Progress for next milestone */
.tl-progress-wrap { margin-top: 5px; }
.tl-progress-bg {
  background: #e8dfc8;
  border-radius: 6px;
  height: 5px;
  overflow: hidden;
}
.tl-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffb347, #ffd580);
  border-radius: 6px;
  transition: width 0.8s ease;
}

/* Icon */
.tl-icon {
  font-size: 1.3rem;
  padding-top: 2px;
  filter: grayscale(0.6);
  flex-shrink: 0;
}
.tl-icon-done { filter: grayscale(0); }

/* Future projection */
.future-projection {
  background: linear-gradient(135deg, #2e4a2e, #1e3a1e);
  border-radius: 16px;
  padding: 14px;
}
.projection-title {
  font-size: 0.78rem;
  color: #b8d4b0;
  font-weight: 600;
  text-align: center;
  margin-bottom: 12px;
}
.projection-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.projection-item {
  text-align: center;
  background: rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 8px 4px;
}
.proj-icon  { font-size: 1.3rem; margin-bottom: 3px; }
.proj-value { font-size: 0.82rem; font-weight: 800; color: #fff; margin-bottom: 2px; }
.proj-label { font-size: 0.62rem; color: #7eab7e; font-weight: 500; }
</style>