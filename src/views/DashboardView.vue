<!-- src/views/DashboardView.vue -->

<template>
  <div class="dashboard-view">
    <DashboardSideMenu />

    <div class="main-content">
      <!-- Aquí usamos el Dashboard original descargado -->
      <DashboardDownloaded />
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/components/DashboardSideMenu.vue'
import DashboardDownloaded from '@/views/admin/Dashboard.vue' // <-- Importas el nuevo dashboard

export default {
  name: 'DashboardView',
  components: {
    DashboardSideMenu,
    DashboardDownloaded
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
