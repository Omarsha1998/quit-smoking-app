<!--
  InfoList.vue — Generic numbered/icon list card.

  Usage:
    <InfoList
      title="Educational Tips"
      icon="school"
      header-color="bg-blue-6"
      badge-color="blue-6"
      text-color="text-blue-8"
      :items="EDUCATIONAL_TIPS"
    />
-->
<template>
  <q-card class="q-mb-md shadow-lg">
    <q-card-section :class="[headerColor, 'text-white']">
      <div class="text-h6 text-weight-bold">
        <q-icon :name="icon" class="q-mr-sm" />{{ title }}
      </div>
    </q-card-section>
    <q-card-section>
      <q-list>
        <q-item v-for="(item, idx) in items" :key="idx">
          <!-- Avatar slot: numbered badge OR custom icon -->
          <q-item-section avatar>
            <slot name="avatar" :index="idx" :item="item">
              <q-badge :color="badgeColor" :label="idx + 1" />
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
export default {
  name: 'InfoList',

  props: {
    title:       { type: String, required: true },
    icon:        { type: String, required: true },
    headerColor: { type: String, default: 'bg-blue-6' },
    badgeColor:  { type: String, default: 'blue-6'    },
    textColor:   { type: String, default: 'text-blue-8' },
    items:       { type: Array,  required: true },
  },
}
</script>