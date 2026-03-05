<template>
  <q-card class="q-mb-md shadow-lg">
    <q-card-section class="bg-blue-6 text-white">
      <div class="row items-center justify-between">
        <div class="text-h6 text-weight-bold">
          <q-icon name="show_chart" class="q-mr-sm" />Cigarettes Avoided Over Time
        </div>
        <div v-if="totalCigsAvoided > 0" class="text-subtitle2 text-blue-1">
          Total: <strong>{{ totalCigsAvoided }}</strong>
        </div>
      </div>
    </q-card-section>

    <q-card-section class="q-pa-sm">

      <!-- Empty state -->
      <div v-if="chartPoints.length < 2" class="text-center q-pa-lg">
        <q-icon name="show_chart" size="48px" color="blue-3" />
        <div class="text-caption text-grey-6 q-mt-sm">
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
          <linearGradient id="cigGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stop-color="#1976d2" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#1976d2" stop-opacity="0.02" />
          </linearGradient>
        </defs>

        <!-- Horizontal grid lines -->
        <line
          v-for="i in 4" :key="'grid' + i"
          :x1="PL" :y1="PT + (innerH / 4) * (i - 1)"
          :x2="W - PR" :y2="PT + (innerH / 4) * (i - 1)"
          stroke="#e8eaf6" stroke-width="1"
        />

        <!-- Y-axis labels -->
        <text
          v-for="(label, i) in yLabels" :key="'yl' + i"
          :x="PL - 6"
          :y="PT + (innerH / 4) * i + 4"
          text-anchor="end"
          font-size="9"
          fill="#9e9e9e"
        >{{ label }}</text>

        <!-- Dashed "perfect" line — what full avoidance looks like each day -->
        <line
          :x1="PL" :y1="perfectLineY"
          :x2="W - PR" :y2="perfectLineY"
          stroke="#90caf9"
          stroke-width="1"
          stroke-dasharray="4,3"
        />
        <text
          :x="W - PR - 2"
          :y="perfectLineY - 3"
          text-anchor="end"
          font-size="8"
          fill="#90caf9"
        >goal</text>

        <!-- Gradient area fill under the avoided line -->
        <path :d="areaPath" fill="url(#cigGradient)" />

        <!-- Main smooth avoided line (blue) -->
        <path
          :d="smoothPath"
          fill="none"
          stroke="#1976d2"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Dots for every data point -->
        <g v-for="(pt, i) in chartPoints" :key="'dot' + i">

          <!-- Glow ring on last point -->
          <circle
            v-if="i === chartPoints.length - 1"
            :cx="pt.x" :cy="pt.y"
            r="8"
            :fill="pt.smoked ? 'rgba(229,57,53,0.15)' : 'rgba(25,118,210,0.12)'"
          />

          <!-- Dot: red on smoked days, blue on avoided days -->
          <circle
            :cx="pt.x" :cy="pt.y"
            r="4"
            fill="white"
            :stroke="pt.smoked ? '#e53935' : '#1976d2'"
            stroke-width="2"
          />

          <!-- Cumulative avoided value label above dot -->
          <text
            v-if="chartPoints.length <= 8 || i === chartPoints.length - 1 || pt.smoked"
            :x="pt.x"
            :y="pt.y - 9"
            text-anchor="middle"
            font-size="8"
            font-weight="bold"
            :fill="pt.smoked ? '#c62828' : '#1565c0'"
          >{{ pt.cumulative }}</text>

          <!-- On smoked days: show how many they smoked below the dot -->
          <text
            v-if="pt.smoked && pt.smokedCount > 0"
            :x="pt.x"
            :y="pt.y + 18"
            text-anchor="middle"
            font-size="9"
            fill="#e53935"
          >🚬{{ pt.smokedCount }}</text>

        </g>

        <!-- X-axis day labels -->
        <text
          v-for="(pt, i) in xLabelPoints" :key="'xl' + i"
          :x="pt.x"
          :y="H - 2"
          text-anchor="middle"
          font-size="9"
          fill="#9e9e9e"
        >Day {{ pt.day }}</text>

        <!-- Y-axis title (rotated) -->
        <text
          :x="8"
          :y="PT + innerH / 2"
          text-anchor="middle"
          font-size="8"
          fill="#bdbdbd"
          transform="rotate(-90, 8, 100)"
        >Cigs avoided</text>
      </svg>

      <!-- Legend -->
      <div v-if="chartPoints.length >= 2" class="row justify-center q-gutter-md q-mt-xs">
        <div class="row items-center" style="gap:4px">
          <div style="width:14px;height:3px;background:#1976d2;border-radius:2px"></div>
          <span class="text-caption text-grey-7">Avoided</span>
        </div>
        <div class="row items-center" style="gap:4px">
          <div style="width:10px;height:10px;border-radius:50%;border:2px solid #e53935;background:white"></div>
          <span class="text-caption text-grey-7">Smoked day</span>
        </div>
        <div class="row items-center" style="gap:4px">
          <div style="width:14px;border-top:2px dashed #90caf9"></div>
          <span class="text-caption text-grey-7">Daily goal</span>
        </div>
      </div>

    </q-card-section>
  </q-card>
</template>

<script>
// Canvas dimensions
const W  = 340   // total SVG width
const H  = 215   // taller to fit 🚬 labels below dots on smoked days
const PL = 38    // left padding for Y labels
const PR = 28    // right padding for "goal" label
const PT = 20    // top padding
const PB = 24    // bottom padding for X labels

const MAX_POINTS = 12

export default {
  name: 'CigarettesGraph',

  props: {
    totalDays:        { type: Number, required: true },
    cigarettesPerDay: { type: Number, required: true },
    // Array of { date: 'YYYY-MM-DD', smoked: boolean, smokedCount: number }
    dailyLogs:        { type: Array,  default: () => [] },
  },

  data() {
    return { W, H, PL, PR, PT, PB }
  },

  computed: {
    innerH() { return H - PT - PB },
    innerW() { return W - PL - PR },

    // Total cigarettes actually avoided across all logged days
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

    // Y-axis maximum = theoretical maximum (all days smoke-free)
    yMax() {
      const theoretical = Math.max(this.totalDays, 1) * this.cigarettesPerDay
      return Math.max(theoretical, this.cigarettesPerDay)
    },

    // Y position of the "goal" dashed line (theoretical max avoided)
    perfectLineY() {
      return PT // top of chart = perfect score
    },

    // Build chart data points from dailyLogs (or fallback to estimate)
    chartPoints() {
      if (!this.totalDays || !this.cigarettesPerDay || this.totalDays < 1) return []

      let rawPoints = []

      if (this.dailyLogs && this.dailyLogs.length > 0) {
        // Sort logs oldest → newest
        const sorted = [...this.dailyLogs].sort((a, b) =>
          a.date < b.date ? -1 : a.date > b.date ? 1 : 0
        )

        // Accumulate avoided cigarettes per day
        let cumulative = 0
        sorted.forEach((log, idx) => {
          const avoided = log.smoked
            ? Math.max(0, this.cigarettesPerDay - (log.smokedCount || 0))
            : this.cigarettesPerDay
          cumulative += avoided
          rawPoints.push({
            day:         idx + 1,
            cumulative,
            smoked:      !!log.smoked,
            smokedCount: log.smokedCount || 0,
          })
        })
      } else {
        // Fallback — no logs yet, project based on totalDays
        const numPts = Math.min(this.totalDays + 1, MAX_POINTS)
        rawPoints = Array.from({ length: numPts }, (_, i) => {
          const day = i === numPts - 1
            ? this.totalDays
            : Math.round((i / (numPts - 1)) * this.totalDays)
          return {
            day,
            cumulative:  Math.floor(day * this.cigarettesPerDay),
            smoked:      false,
            smokedCount: 0,
          }
        })
      }

      // Always prepend Day 0 at origin
      rawPoints = [{ day: 0, cumulative: 0, smoked: false, smokedCount: 0 }, ...rawPoints]

      // Thin out if we have too many points
      if (rawPoints.length > MAX_POINTS) {
        const step = Math.ceil(rawPoints.length / MAX_POINTS)
        rawPoints = rawPoints.filter((_, i) => i === 0 || i % step === 0 || i === rawPoints.length - 1)
      }

      const yMax = this.yMax || 1
      const total = rawPoints.length

      // Attach SVG coordinates
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

    // Smooth cubic bezier path through all avoided points
    smoothPath() {
      const pts = this.chartPoints
      if (pts.length < 2) return ''
      let d = `M ${pts[0].x} ${pts[0].y}`
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1]
        const curr = pts[i]
        const cpX  = (prev.x + curr.x) / 2
        d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`
      }
      return d
    },

    // Closed area below the avoided line for the gradient fill
    areaPath() {
      const pts    = this.chartPoints
      if (pts.length < 2) return ''
      const bottom = PT + this.innerH
      let d = `M ${pts[0].x} ${bottom} L ${pts[0].x} ${pts[0].y}`
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1]
        const curr = pts[i]
        const cpX  = (prev.x + curr.x) / 2
        d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`
      }
      d += ` L ${pts[pts.length - 1].x} ${bottom} Z`
      return d
    },
  },
}
</script>