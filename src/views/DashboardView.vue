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
  position: absolute;
  top: 0;
  left: 0px;
  right: 0;
  bottom: 0;
  transition: left 0.5s ease;
}

/* Cuando el menú está abierto */
.main-content.expanded {
  left: 310px; /* 60px + 250px del menú desplegable */
}
</style>
