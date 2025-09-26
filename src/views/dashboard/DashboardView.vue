<!-- src/views/DashboardView.vue -->

<template>
  <div class="dashboard-view">
    <DashboardSideMenu @menu-toggle="menuOpen = $event" />

    <div :class="['main-content', { expanded: menuOpen }]">
      <DashboardExpandedView />
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'
import DashboardExpandedView from '@/views/dashboard/DashboardExpandedView.vue'

export default {
  name: 'DashboardView',
  components: {
    DashboardSideMenu,
    DashboardExpandedView
  },
  data() {
    return {
      menuOpen: true, // Siempre arranca expandido y false arranca oculto
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
  left: 200px; /* 60px + 250px del menú desplegable */
}
</style>
