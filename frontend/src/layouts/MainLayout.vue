<template>
  <q-layout view="lHh Lpr lFf">

    <q-page-container class="pf-page-container">
      <router-view :active-tab="activeTab" @tab-change="activeTab = $event" />
    </q-page-container>

    <Transition name="nav-slide">
      <div v-if="showNav" class="pf-bottom-nav">
        <button
          v-for="tab in navTabs"
          :key="tab.name"
          class="pf-nav-item"
          :class="{ 'pf-nav-active': activeTab === tab.name }"
          @click="activeTab = tab.name"
        >
          <div class="pf-nav-icon-wrap">
            <q-icon :name="activeTab === tab.name ? tab.iconActive : tab.icon" size="22px" />
          </div>
          <span class="pf-nav-label">{{ tab.label }}</span>
        </button>
      </div>
    </Transition>

  </q-layout>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import { LocalStorage } from 'quasar'

export default defineComponent({
  name: 'MainLayout',

  setup() {
    const activeTab = ref('home')
    const showNav = ref(false)

    // Check immediately on load
    const checkNav = () => {
      const data = LocalStorage.getItem('quit-smoking-data')
      showNav.value = !!(data?.hasStarted)
    }

    // Run immediately
    checkNav()

    // Listen for the event from IndexPage
    const onAppStarted = () => {
      showNav.value = true
    }

    // Poll as backup every 500ms
    const interval = setInterval(checkNav, 500)

    onMounted(() => {
      window.addEventListener('app-started', onAppStarted)
    })

    onUnmounted(() => {
      window.removeEventListener('app-started', onAppStarted)
      clearInterval(interval)
    })

    const navTabs = [
      { name: 'home',  label: 'Home',  icon: 'home',       iconActive: 'home'       },
      { name: 'tips',  label: 'Tips',  icon: 'school',     iconActive: 'school'     },
      { name: 'track', label: 'Track', icon: 'show_chart', iconActive: 'show_chart' },
      { name: 'more',  label: 'More',  icon: 'more_horiz', iconActive: 'more_horiz' },
    ]

    return {
      activeTab,
      navTabs,
      showNav,
    }
  },
})
</script>

<style scoped>
/* ── Safe area / notch fix ───────────────────────────────── */
.pf-page-container {
  padding-top: env(safe-area-inset-top, 0px) !important;
  padding-left: env(safe-area-inset-left, 0px) !important;
  padding-right: env(safe-area-inset-right, 0px) !important;
}

/* ── Nav slide animation ─────────────────────────────────── */
.nav-slide-enter-active,
.nav-slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.nav-slide-enter-from,
.nav-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* ── Bottom Navigation Bar ───────────────────────────────── */
.pf-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  align-items: stretch;
  background: rgba(255, 253, 248, 0.97);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1.5px solid #d4c4a0;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.10);
  z-index: 2000;
  padding: 0 8px;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.pf-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 6px 4px;
  border-radius: 0;
  transition: all 0.18s ease;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.pf-nav-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 28px;
  border-radius: 14px;
  transition: all 0.18s ease;
  color: #b0a090;
}

.pf-nav-label {
  font-size: 0.67rem;
  font-weight: 500;
  color: #b0a090;
  letter-spacing: 0.2px;
  line-height: 1;
  transition: color 0.18s ease;
}

.pf-nav-active .pf-nav-icon-wrap {
  background: #d6efd6;
  color: #5d9460;
}

.pf-nav-active .pf-nav-label {
  color: #5d9460;
  font-weight: 700;
}

.pf-nav-item:active .pf-nav-icon-wrap {
  transform: scale(0.88);
  background: #ede0c4;
  color: #a87840;
}
</style>