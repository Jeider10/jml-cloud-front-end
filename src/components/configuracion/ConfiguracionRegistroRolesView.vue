<!-- src/components/configuracion/RegistroRolesView.vue -->

<template>
  <div class="registro-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="menuOpen = $event" />

    <!-- Contenido principal -->
    <div :class="['registro-container', { expanded: menuOpen }]">
      <h1 class="titulo">Registro de Rol</h1>

      <!-- 🔔 Mensaje visual -->
      <transition name="fade">
        <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
          {{ mensaje }}
        </div>
      </transition>

      <!-- Formulario de rol -->
      <div class="form-container">
        <div class="form-row">
          <label>Código Rol</label>
          <input v-model="roleForm.roleCode" type="text" />

          <label>Nombre Rol</label>
          <input v-model="roleForm.roleName" type="text" />

          <label>Descripción</label>
          <input v-model="roleForm.descripcion" type="text" />

          <!-- Botones -->
          <button type="button"
                  class="agregar-btn"
                  :disabled="!hayDatos()"
                  @click="registrarRol">
            ➕ Registrar Rol
          </button>

          <button type="button"
                  class="limpiar-campos-btn"
                  :disabled="!hayDatos()"
                  @click="limpiarCampos">
            🧹 Limpiar
          </button>

          <button type="button"
                  class="volver-btn"
                  @click="volverAConfiguracion">
            ↩️ Volver
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'
import { registrarRole } from '@/services/apiConfigEmpresaRolesService'

export default {
  name: 'RegistroRolesView',
  components: { DashboardSideMenu },
  data() {
    return {
      menuOpen: true,
      roleForm: {
        roleCode: '',
        roleName: '',
        descripcion: ''
      },
      mensaje: '',
      mensajeTipo: ''
    }
  },
  methods: {
    mostrarMensaje(texto, tipo = 'success') {
      this.mensaje = texto
      this.mensajeTipo = tipo
      setTimeout(() => {
        this.mensaje = ''
        if (tipo === 'success') {
          this.$router.push('/configuracion/usuarios-empresa')
        }
      }, 2500)
    },
    async registrarRol() {
      if (!this.roleForm.roleCode || !this.roleForm.roleName) {
        this.mostrarMensaje('⚠️ Complete los campos obligatorios.', 'error')
        return
      }

      try {
        const response = await registrarRole(this.roleForm)
        const data = response.data
        this.mostrarMensaje(`✅ Rol "${data.roleName}" registrado correctamente.`, 'success')
        this.limpiarCampos()
      } catch (error) {
        console.error('❌ Error al registrar rol:', error)
        this.mostrarMensaje(error.message || 'Error al registrar rol.', 'error')
      }
    },
    hayDatos() {
      return this.roleForm.roleCode || this.roleForm.roleName || this.roleForm.descripcion
    },
    limpiarCampos() {
      this.roleForm = { roleCode: '', roleName: '', descripcion: '' }
    },
    volverAConfiguracion() {
      this.$router.push('/configuracion-empresa-usuario')
    }
  }
}
</script>

<style scoped>
.registro-wrapper {
  display: flex;
}

.registro-container {
  position: absolute;
  top: 0;
  left: 60px;
  right: 0;
  bottom: 0;
  padding: 20px;
  background-color: #c6ffe6;
  overflow-y: auto;
  transition: left 0.3s ease;
  display: flex;
  flex-direction: column;
}

.registro-container.expanded {
  left: 220px;
}

.titulo {
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
}

.mensaje {
  padding: 12px 18px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-weight: bold;
  text-align: center;
  box-shadow: 0px 4px 8px rgba(0,0,0,0.15);
}

.mensaje.success { background: #2ecc71; color: white; }
.mensaje.warning { background: #f1c40f; color: #333; }
.mensaje.error { background: #e74c3c; color: white; }

.form-container {
  margin-bottom: 0px;
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

input, select {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.agregar-btn, .limpiar-campos-btn, .volver-btn {
  padding: 8px 12px;
  border-radius: 6px;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.agregar-btn { background: #0077b6; }
.agregar-btn:hover { background: #005f8a; }

.limpiar-campos-btn { background: #f4a261; }
.limpiar-campos-btn:hover { background: #e76f51; }

.volver-btn { background: #0077b6; }
.volver-btn:hover { background: #005f8a; }

</style>
