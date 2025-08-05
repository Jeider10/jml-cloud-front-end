<template>
  <div class="dashboard-view">
    <DashboardSideMenu />

    <div class="main-content">
      <!-- Aquí todo el contenido del dashboard -->
      <h1>Bienvenido al Dashboard</h1>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/components/DashboardSideMenu.vue'

export default {
  name: 'DashboardView',
  components: {
    DashboardSideMenu
  }
}
</script>

<style scoped>
.dashboard-view {
  display: flex;
}

.main-content {
  margin-left: 60px;
  padding: 20px;
  width: 100%;
  transition: margin-left 0.3s ease;
}

.side-menu.expanded ~ .main-content {
  margin-left: 280px;
}
</style>
