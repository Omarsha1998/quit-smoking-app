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

      <!-- Empty state: less than 1 full day elapsed -->
      <div v-if="points.length < 2" class="text-center q-pa-lg">
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
          <!-- Gradient fill under the line -->
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

        <!-- Y-axis labels (cigarette counts) -->
        <text
          v-for="(label, i) in yLabels" :key="'yl' + i"
          :x="PL - 6"
          :y="PT + (innerH / 4) * i + 4"
          text-anchor="end"
          font-size="9"
          fill="#9e9e9e"
        >{{ label }}</text>

        <!-- Area fill under the curve -->
        <path :d="areaPath" fill="url(#cigGradient)" />

        <!-- Smooth curved line using cubic bezier -->
        <path
          :d="smoothPath"
          fill="none"
          stroke="#1976d2"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Data point dots -->
        <g v-for="(pt, i) in points" :key="'dot' + i">
          <!-- Outer glow ring on last point -->
          <circle
            v-if="i === points.length - 1"
            :cx="pt.x" :cy="pt.y"
            r="7"
            fill="rgba(25,118,210,0.15)"
          />
          <circle
            :cx="pt.x" :cy="pt.y"
            r="4"
            fill="white"
            stroke="#1976d2"
            stroke-width="2"
          />
          <!-- Tooltip: show value above dot -->
          <text
            v-if="points.length <= 8 || i === points.length - 1"
            :x="pt.x"
            :y="pt.y - 9"
            text-anchor="middle"
            font-size="8"
            font-weight="bold"
            fill="#1565c0"
          >{{ pt.cigs }}</text>
        </g>

        <!-- X-axis day labels -->
        <text
          v-for="(pt, i) in xLabelPoints" :key="'xl' + i"
          :x="pt.x"
          :y="H - 3"
          text-anchor="middle"
          font-size="9"
          fill="#9e9e9e"
        >Day {{ pt.day }}</text>

        <!-- Y-axis title -->
        <text
          :x="8"
          :y="PT + innerH / 2"
          text-anchor="middle"
          font-size="8"
          fill="#bdbdbd"
          transform="rotate(-90, 8, 100)"
        >Cigs avoided</text>
      </svg>

    </q-card-section>
  </q-card>
</template>

<script>
// Canvas dimensions and padding
const W  = 340   // total width
const H  = 200   // total height
const PL = 38    // left padding (room for Y labels)
const PR = 12    // right padding
const PT = 16    // top padding
const PB = 20    // bottom padding (room for X labels)

// Max number of plotted data points
const MAX_POINTS = 10

export default {
  name: 'CigarettesGraph',

  props: {
    totalDays:        { type: Number, required: true },
    cigarettesPerDay: { type: Number, required: true },
  },

  data() {
    return { W, H, PL, PR, PT, PB }
  },

  computed: {
    innerH() { return H - PT - PB },
    innerW() { return W - PL - PR },

    // Total cumulative cigarettes avoided so far
    totalCigsAvoided() {
      return Math.floor(this.totalDays * this.cigarettesPerDay)
    },

    // Build evenly-spaced data points starting from Day 0
    // Each point: { day, cigs (cumulative avoided), x, y }
    points() {
      if (!this.totalDays || !this.cigarettesPerDay || this.totalDays < 1) return []

      const numPoints = Math.min(this.totalDays + 1, MAX_POINTS)
      const maxCigs   = this.totalCigsAvoided

      return Array.from({ length: numPoints }, (_, i) => {
        // Distribute evenly; last point is always the current day
        const day  = i === numPoints - 1
          ? this.totalDays
          : Math.round((i / (numPoints - 1)) * this.totalDays)

        // Cumulative cigarettes avoided up to this day
        const cigs = Math.floor(day * this.cigarettesPerDay)

        const x = PL + (i / (numPoints - 1)) * this.innerW
        const y = PT + this.innerH - (maxCigs > 0 ? (cigs / maxCigs) * this.innerH : 0)

        return { x, y, day, cigs }
      })
    },

    // Y-axis labels: top → bottom = max → 0
    yLabels() {
      const max = this.totalCigsAvoided || 1
      return [max, Math.round(max * 0.75), Math.round(max * 0.5), Math.round(max * 0.25), 0]
    },

    // Only show a subset of X labels to avoid crowding
    xLabelPoints() {
      if (!this.points.length) return []
      const pts = this.points
      if (pts.length <= 4) return pts
      // Always show first, last, and up to 3 evenly spaced in between
      const indices = new Set([0, pts.length - 1])
      const step = Math.floor(pts.length / 3)
      for (let i = step; i < pts.length - 1; i += step) indices.add(i)
      return [...indices].sort((a, b) => a - b).map(i => pts[i])
    },

    // Smooth cubic bezier path through all points
    smoothPath() {
      if (this.points.length < 2) return ''
      const pts = this.points
      let d = `M ${pts[0].x} ${pts[0].y}`
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1]
        const curr = pts[i]
        // Control points at 40% of the horizontal distance
        const cpX = (prev.x + curr.x) / 2
        d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`
      }
      return d
    },

    // Closed area path for the gradient fill — mirrors the smooth curve
    areaPath() {
      if (this.points.length < 2) return ''
      const pts    = this.points
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