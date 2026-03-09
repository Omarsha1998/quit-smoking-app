<!-- CigarettesGraph.vue -->
<template>
  <q-card class="q-mb-md shadow-lg" style="border-radius: 18px; overflow: hidden; border: 1.5px solid #b8d4b0;">

    <!-- Header — Light Sage Green -->
    <q-card-section style="background: linear-gradient(135deg, #7eab7e 0%, #5d9460 100%);" class="text-white">
      <div class="row items-center justify-between">
        <div class="text-h6 text-weight-bold" style="letter-spacing: 0.3px;">
          <q-icon name="show_chart" class="q-mr-sm" />Cigarettes Avoided Over Time
        </div>
        <div v-if="totalCigsAvoided > 0" class="text-subtitle2" style="opacity: 0.88;">
          Total: <strong>{{ totalCigsAvoided }}</strong>
        </div>
      </div>
    </q-card-section>

    <!-- Graph body — Warm Honey Beige -->
    <q-card-section class="q-pa-sm" style="background: #f5ead8;">

      <!-- Empty state -->
      <div v-if="chartPoints.length < 2" class="text-center q-pa-lg">
        <q-icon name="show_chart" size="48px" style="color: #8ec08e;" />
        <div class="text-caption q-mt-sm" style="color: #9aaa90;">
          Your growth chart will appear after your first full day smoke-free!
        </div>
      </div>

      <!-- Graph -->
      <svg
        v-else
        :viewBox="`0 0 ${W} ${H}`"
        class="full-width"
        style="display:block"
      >
        <defs>
          <!-- Light sage gradient fill -->
          <linearGradient id="cigGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stop-color="#7eab7e" stop-opacity="0.30" />
            <stop offset="100%" stop-color="#7eab7e" stop-opacity="0.02" />
          </linearGradient>
        </defs>

        <!-- Horizontal grid lines — visible warm beige -->
        <line
          v-for="i in 4" :key="'grid' + i"
          :x1="PL" :y1="PT + (innerH / 4) * (i - 1)"
          :x2="W - PR" :y2="PT + (innerH / 4) * (i - 1)"
          stroke="#dcc8a8" stroke-width="1"
        />

        <!-- Y-axis labels -->
        <text
          v-for="(label, i) in yLabels" :key="'yl' + i"
          :x="PL - 6"
          :y="PT + (innerH / 4) * i + 4"
          text-anchor="end"
          font-size="9"
          fill="#b09870"
        >{{ label }}</text>

        <!-- Dashed "goal" line — dusty rose accent -->
        <line
          :x1="PL" :y1="perfectLineY"
          :x2="W - PR" :y2="perfectLineY"
          stroke="#c97a8a"
          stroke-width="1.5"
          stroke-dasharray="4,3"
        />
        <text
          :x="W - PR - 2"
          :y="perfectLineY - 3"
          text-anchor="end"
          font-size="8"
          fill="#c97a8a"
        >goal</text>

        <!-- Gradient area fill -->
        <path :d="areaPath" fill="url(#cigGradient)" />

        <!-- Main smooth line — Light Sage Green -->
        <path
          :d="smoothPath"
          fill="none"
          stroke="#7eab7e"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Dots -->
        <g v-for="(pt, i) in chartPoints" :key="'dot' + i">

          <!-- Glow ring on last point -->
          <circle
            v-if="i === chartPoints.length - 1"
            :cx="pt.x" :cy="pt.y"
            r="8"
            :fill="pt.smoked ? 'rgba(201,122,138,0.18)' : 'rgba(126,171,126,0.18)'"
          />

          <!-- Dot: dusty rose on smoked days, sage green on avoided days -->
          <circle
            :cx="pt.x" :cy="pt.y"
            r="4"
            fill="white"
            :stroke="pt.smoked ? '#c97a8a' : '#7eab7e'"
            stroke-width="2"
          />

          <!-- Cumulative avoided label above dot -->
          <text
            v-if="chartPoints.length <= 8 || i === chartPoints.length - 1 || pt.smoked"
            :x="pt.x"
            :y="pt.y - 9"
            text-anchor="middle"
            font-size="8"
            font-weight="bold"
            :fill="pt.smoked ? '#a85c6e' : '#5d9460'"
          >{{ pt.cumulative }}</text>

          <!-- Smoked count below dot — Dusty Rose -->
          <text
            v-if="pt.smoked && pt.smokedCount > 0"
            :x="pt.x"
            :y="pt.y + 18"
            text-anchor="middle"
            font-size="9"
            fill="#c97a8a"
          >🚬{{ pt.smokedCount }}</text>

        </g>

        <!-- X-axis day labels -->
        <text
          v-for="(pt, i) in xLabelPoints" :key="'xl' + i"
          :x="pt.x"
          :y="H - 2"
          text-anchor="middle"
          font-size="9"
          fill="#b09870"
        >Day {{ pt.day }}</text>

        <!-- Y-axis title (rotated) -->
        <text
          :x="8"
          :y="PT + innerH / 2"
          text-anchor="middle"
          font-size="8"
          fill="#c8a870"
          transform="rotate(-90, 8, 100)"
        >Cigs avoided</text>
      </svg>

      <!-- Legend -->
      <div v-if="chartPoints.length >= 2" class="row justify-center q-gutter-md q-mt-xs">
        <div class="row items-center" style="gap:4px">
          <div style="width:14px;height:3px;background:#7eab7e;border-radius:2px"></div>
          <span class="text-caption" style="color: #9aaa90;">Avoided</span>
        </div>
        <div class="row items-center" style="gap:4px">
          <div style="width:10px;height:10px;border-radius:50%;border:2px solid #c97a8a;background:white"></div>
          <span class="text-caption" style="color: #9aaa90;">Smoked day</span>
        </div>
        <div class="row items-center" style="gap:4px">
          <div style="width:14px;border-top:2px dashed #c97a8a"></div>
          <span class="text-caption" style="color: #9aaa90;">Daily goal</span>
        </div>
      </div>

    </q-card-section>
  </q-card>
</template>

<script>
const W  = 340
const H  = 215
const PL = 38
const PR = 28
const PT = 20
const PB = 24
const MAX_POINTS = 12

export default {
  name: 'CigarettesGraph',

  props: {
    totalDays:        { type: Number, required: true },
    cigarettesPerDay: { type: Number, required: true },
    dailyLogs:        { type: Array,  default: () => [] },
  },

  data() {
    return { W, H, PL, PR, PT, PB }
  },

  computed: {
    innerH() { return H - PT - PB },
    innerW() { return W - PL - PR },

    totalCigsAvoided() {
      if (!this.cigarettesPerDay) return 0
      if (this.dailyLogs && this.dailyLogs.length > 0) {
        return this.dailyLogs.reduce((sum, log) => {
          const avoided = log.smoked
            ? Math.max(0, this.cigarettesPerDay - (log.smokedCount || 0))
            : this.cigarettesPerDay
          return sum + avoided
        }, 0)
      }
      return Math.floor(this.totalDays * this.cigarettesPerDay)
    },

    yMax() {
      const theoretical = Math.max(this.totalDays, 1) * this.cigarettesPerDay
      return Math.max(theoretical, this.cigarettesPerDay)
    },

    perfectLineY() { return PT },

    chartPoints() {
      if (!this.totalDays || !this.cigarettesPerDay || this.totalDays < 1) return []

      let rawPoints = []

      if (this.dailyLogs && this.dailyLogs.length > 0) {
        const sorted = [...this.dailyLogs].sort((a, b) =>
          a.date < b.date ? -1 : a.date > b.date ? 1 : 0
        )
        let cumulative = 0
        sorted.forEach((log, idx) => {
          const avoided = log.smoked
            ? Math.max(0, this.cigarettesPerDay - (log.smokedCount || 0))
            : this.cigarettesPerDay
          cumulative += avoided
          rawPoints.push({ day: idx + 1, cumulative, smoked: !!log.smoked, smokedCount: log.smokedCount || 0 })
        })
      } else {
        const numPts = Math.min(this.totalDays + 1, MAX_POINTS)
        rawPoints = Array.from({ length: numPts }, (_, i) => {
          const day = i === numPts - 1 ? this.totalDays : Math.round((i / (numPts - 1)) * this.totalDays)
          return { day, cumulative: Math.floor(day * this.cigarettesPerDay), smoked: false, smokedCount: 0 }
        })
      }

      rawPoints = [{ day: 0, cumulative: 0, smoked: false, smokedCount: 0 }, ...rawPoints]

      if (rawPoints.length > MAX_POINTS) {
        const step = Math.ceil(rawPoints.length / MAX_POINTS)
        rawPoints = rawPoints.filter((_, i) => i === 0 || i % step === 0 || i === rawPoints.length - 1)
      }

      const yMax  = this.yMax || 1
      const total = rawPoints.length

      return rawPoints.map((pt, i) => {
        const x = PL + (i / (total - 1)) * this.innerW
        const y = PT + this.innerH - (pt.cumulative / yMax) * this.innerH
        return { ...pt, x, y }
      })
    },

    yLabels() {
      const max = this.yMax || 1
      return [max, Math.round(max * 0.75), Math.round(max * 0.5), Math.round(max * 0.25), 0]
    },

    xLabelPoints() {
      if (!this.chartPoints.length) return []
      const pts = this.chartPoints
      if (pts.length <= 4) return pts
      const indices = new Set([0, pts.length - 1])
      const step = Math.floor(pts.length / 3)
      for (let i = step; i < pts.length - 1; i += step) indices.add(i)
      return [...indices].sort((a, b) => a - b).map(i => pts[i])
    },

    smoothPath() {
      const pts = this.chartPoints
      if (pts.length < 2) return ''
      let d = `M ${pts[0].x} ${pts[0].y}`
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1], curr = pts[i]
        const cpX = (prev.x + curr.x) / 2
        d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`
      }
      return d
    },

    areaPath() {
      const pts = this.chartPoints
      if (pts.length < 2) return ''
      const bottom = PT + this.innerH
      let d = `M ${pts[0].x} ${bottom} L ${pts[0].x} ${pts[0].y}`
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1], curr = pts[i]
        const cpX = (prev.x + curr.x) / 2
        d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`
      }
      d += ` L ${pts[pts.length - 1].x} ${bottom} Z`
      return d
    },
  },
}
</script>