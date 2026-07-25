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
      menuOpen: localStorage.getItem('menuPinned') === 'true', // Siempre arranca expandido y false arranca oculto
    }
  }
}
</script>

<style scoped>
.dashboard-view {
  display: flex;
}

/* Estilo base — contenido empieza después del menú colapsado */
.main-content {
  position: absolute;
  top: 0;
  left: 60px;
  right: 0;
  bottom: 0;
  transition: left 0.5s ease;
}

/* Cuando el menú está abierto/pinned */
.main-content.expanded {
  left: 220px;
}
</style>
