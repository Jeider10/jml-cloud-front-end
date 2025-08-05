<!-- src/views/DashboardView.vue -->
<template>
  <div class="dashboard-view">
    <DashboardSideMenu @menu-toggle="menuOpen = $event" />

    <div :class="['main-content', { expanded: menuOpen }]">
      <DashboardDownloaded />
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/components/DashboardSideMenu.vue'
import DashboardDownloaded from '@/views/admin/Dashboard.vue'

export default {
  name: 'DashboardView',
  components: {
    DashboardSideMenu,
    DashboardDownloaded
  },
  data() {
    return {
      menuOpen: false
    }
  }
}
</script>

<style scoped>
.dashboard-view {
  display: flex;
}

/* Estilo base */
.main-content {
  margin-left: 60px;
  width: 100%;
  transition: margin-left 0.3s ease;
}

/* Cuando el menú está abierto */
.main-content.expanded {
  margin-left: 310px; /* 60px (panel) + 250px (menú desplegable) */
}
</style>
