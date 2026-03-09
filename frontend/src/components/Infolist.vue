<!--
  InfoList.vue — Generic numbered/icon list card.

  Usage:
    <InfoList
      title="Educational Tips"
      icon="school"
      header-color="pf-header-beige"
      badge-color="pf-badge-beige"
      text-color="pf-text-beige"
      :items="EDUCATIONAL_TIPS"
    />

  Available themes (defined in IndexPage scoped styles & app.scss):
    Green:  pf-header-green / pf-badge-green / pf-text-green
    Beige:  pf-header-beige / pf-badge-beige / pf-text-beige
    Rose:   pf-header-rose  / pf-badge-rose  / pf-text-rose
-->
<template>
  <q-card class="q-mb-md shadow-lg" style="border-radius: 18px; overflow: hidden;" :style="cardBorderStyle">

    <!-- Header — driven by headerColor class -->
    <q-card-section :class="[headerColor, 'text-white']">
      <div class="text-h6 text-weight-bold" style="letter-spacing: 0.3px;">
        <q-icon :name="icon" class="q-mr-sm" />{{ title }}
      </div>
    </q-card-section>

    <!-- Body — Honey Beige -->
    <q-card-section style="background: #f5ead8;">
      <q-list>
        <q-item v-for="(item, idx) in items" :key="idx" style="border-radius: 8px;">

          <!-- Avatar slot: numbered badge OR custom -->
          <q-item-section avatar>
            <slot name="avatar" :index="idx" :item="item">
              <q-badge
                :class="badgeColor"
                :label="idx + 1"
                style="border-radius: 6px; padding: 4px 7px; font-weight: 700;"
              />
            </slot>
          </q-item-section>

          <!-- Content slot: default = plain text label -->
          <q-item-section>
            <slot name="item" :item="item" :index="idx">
              <q-item-label :class="[textColor, 'text-justify']">{{ item }}</q-item-label>
            </slot>
          </q-item-section>

        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script>
// Map header theme → matching border color
const BORDER_MAP = {
  'pf-header-green': '1.5px solid #b8d4b0',
  'pf-header-beige': '1.5px solid #ddc8a8',
  'pf-header-rose':  '1.5px solid #e8aab8',
}

export default {
  name: 'InfoList',

  props: {
    title:       { type: String, required: true },
    icon:        { type: String, required: true },
    headerColor: { type: String, default: 'pf-header-green' },
    badgeColor:  { type: String, default: 'pf-badge-green'  },
    textColor:   { type: String, default: 'pf-text-green'   },
    items:       { type: Array,  required: true },
  },

  computed: {
    cardBorderStyle() {
      return { border: BORDER_MAP[this.headerColor] || '1.5px solid #b8d4b0' }
    },
  },
}
</script>