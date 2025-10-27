<!-- src/components/configuracion/ConfiguracionActualizarRoleView.vue -->
<template>
  <div class="registro-proveedor-wrapper">
    <DashboardSideMenu @menu-toggle="menuOpen = $event" />
    <div :class="['proveedor-container', { expanded: menuOpen }]">
      <h1 class="titulo">Actualizar Rol</h1>

      <transition name="fade">
        <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
          {{ mensaje }}
        </div>
      </transition>

      <div class="form-container">
        <div class="form-row">
          <label>Código</label>
          <input v-model="rolForm.roleCode" type="text" disabled />

          <label>Nombre</label>
          <input v-model="rolForm.roleName" type="text" />

          <label>Descripción</label>
          <input v-model="rolForm.descripcion" type="text" />

          <button type="button" class="agregar-btn" @click="actualizarRol">💾 Actualizar</button>
          <button type="button" class="volver-btn" @click="volverConfiguracion">↩️ Volver</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'
import { buscarRolPorCodigo, actualizarRol } from '@/services/apiConfigEmpresaRolesService'

export default {
  name: 'ConfiguracionActualizarRoleView',
  components: { DashboardSideMenu },
  props: ['roleCode'],
  data() {
    return {
      menuOpen: true,
      rolForm: {
        roleCode: '',
        roleName: '',
        descripcion: ''
      },
      mensaje: '',
      mensajeTipo: ''
    }
  },
  async mounted() {
    await this.cargarRol()
  },
  methods: {
    async cargarRol() {
      try {
        const response = await buscarRolPorCodigo(this.roleCode)
        this.rolForm = { ...response.data }
      } catch (error) {
        this.mostrarMensaje('Error al cargar rol.', 'error')
      }
    },
    async actualizarRol() {
      try {
        await actualizarRol(this.rolForm)
        this.mostrarMensaje('✅ Rol actualizado correctamente.', 'success')
      } catch (error) {
        this.mostrarMensaje('❌ Error al actualizar rol.', 'error')
      }
    },
    mostrarMensaje(texto, tipo) {
      this.mensaje = texto
      this.mensajeTipo = tipo
      setTimeout(() => {
        this.mensaje = ''
        if (tipo === 'success') {
          this.$router.push({ path: '/configuracion-empresa-usuario', query: { vista: 'roles' } })
        }
      }, 2000)
    },
    volverConfiguracion() {
      this.$router.push({ path: '/configuracion-empresa-usuario', query: { vista: 'roles' } })
    }
  }
}
</script>

<style scoped>
.registro-proveedor-wrapper {
  display: flex;
}

.proveedor-container {
  position: absolute;
  top: 0;
  left: 60px;
  right: 0;
  bottom: 0;
  padding: 20px;
  background-color: #6fffd4;
  overflow-y: auto;
  transition: left 0.3s ease;
  display: flex;
  flex-direction: column;
}

.proveedor-container.expanded {
  left: 220px;
}

.titulo {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
  margin-top: 1px;    /* espacio desde arriba */
}

.mensaje {
  padding: 12px 18px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-weight: bold;
  text-align: center;
  box-shadow: 0px 4px 8px rgba(0,0,0,0.15);
}

.mensaje.success {
  background: #2ecc71;
  color: white;
}

.mensaje.warning {
  background: #f1c40f;
  color: #333;
}

.mensaje.error {
  background: #e74c3c;
  color: white;
}

.form-container {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

label {
  font-weight: bold;
}

input {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.agregar-btn {
  padding: 8px 12px;
  border-radius: 6px;
  background: #0077b6;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.agregar-btn:hover {
  background: #005f8a;
}

.volver-btn {
  padding: 8px 12px;
  border-radius: 6px;
  background: #0077b6;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.volver-btn:hover {
  background: #005f8a;
}
</style>
