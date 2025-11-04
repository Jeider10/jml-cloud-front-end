<!-- src/components/configuracion/usuarios/ConfiguracionEmpresaRegistroUsuariosView.vue -->

<template>
  <div class="registro-wrapper">
    <DashboardSideMenu @menu-toggle="menuOpen = $event" />

    <div :class="['registro-container', { expanded: menuOpen }]">
      <h1 class="titulo">Registro de Usuario</h1>

      <!-- 🔔 Mensaje visual -->
      <transition name="fade">
        <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
          {{ mensaje }}
        </div>
      </transition>

      <div class="form-container">
        <div class="form-row">
          <label>Identificación</label>
          <input v-model="usuarioForm.identificacion" type="text" />

          <label>Nombres</label>
          <input v-model="usuarioForm.nombres" type="text" />

          <label>Apellidos</label>
          <input v-model="usuarioForm.apellidos" type="text" />

          <label>Usuario</label>
          <input v-model="usuarioForm.userName" type="text" />

          <label>Contraseña</label>
          <input v-model="usuarioForm.password" type="text" />

          <label>Correo</label>
          <input v-model="usuarioForm.email" type="email" />

          <label>Teléfono</label>
          <input v-model="usuarioForm.telefono" type="text" />

          <label>Dirección</label>
          <input v-model="usuarioForm.direccion" type="text" />

          <label>Rol</label>
          <select v-model="usuarioForm.roleCode">
            <option disabled value="">Seleccione un rol</option>
            <option v-for="r in roles" :key="r.roleCode" :value="r.roleCode">{{ r.roleName }}</option>
          </select>

          <button type="button"
                  class="agregar-btn"
                  :disabled="!hayDatos()"
                  @click="registrarUsuario">
            ➕ Registrar Usuario
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
import { registrarUsuario } from '@/services/apiConfigEmpresaUsuariosService'
import { listarRoles } from '@/services/apiConfigEmpresaRolesService'

export default {
  name: 'RegistroUsuariosView',
  components: { DashboardSideMenu },
  data() {
    return {
      menuOpen: true,
      usuarioForm: {
        identificacion: '',
        nombres: '',
        apellidos: '',
        userName: '',
        password: '',
        email: '',
        telefono: '',
        direccion: '',
        roleCode: ''
      },
      roles: [],
      mensaje: '',
      mensajeTipo: ''
    }
  },
  async mounted() {
    await this.cargarRoles()
  },
  methods: {
    async cargarRoles() {
      try {
        const { data } = await listarRoles()
        this.roles = data || []
      } catch (error) {
        console.error('❌ Error al cargar roles:', error)
        this.mostrarMensaje('No se pudieron cargar los roles.', 'error')
      }
    },
    mostrarMensaje(texto, tipo = 'success') {
      this.mensaje = texto
      this.mensajeTipo = tipo
      setTimeout(() => {
        this.mensaje = ''
        if (tipo === 'success') {
          this.$router.push({ path: '/configuracion-empresa-usuario', query: { vista: 'usuarios' } })
        }
      }, 2500)
    },
    async registrarUsuario() {
      if (!this.usuarioForm.identificacion || !this.usuarioForm.nombres || !this.usuarioForm.userName || !this.usuarioForm.password || !this.usuarioForm.roleCode) {
        this.mostrarMensaje('⚠️ Complete los campos obligatorios.', 'error')
        return
      }

      try {
        const response = await registrarUsuario(this.usuarioForm)
        const data = response.data
        this.mostrarMensaje(`✅ Usuario "${data.nombres} ${data.apellidos}" registrado correctamente.`, 'success')
        this.limpiarCampos()
      } catch (error) {
        console.error('❌ Error al registrar usuario:', error)

        // Obtener mensaje real desde el backend
        let mensajeBackend = 'Error al registrar usuario.'
        if (error.response && error.response.data) {
          // Si tu backend devuelve { message: "texto" }
          mensajeBackend = error.response.data.message || mensajeBackend
        }

        this.mostrarMensaje(mensajeBackend, 'error')
      }
    },
    hayDatos() {
      return Object.values(this.usuarioForm).some(v => v)
    },
    limpiarCampos() {
      this.usuarioForm = {
        identificacion: '',
        nombres: '',
        apellidos: '',
        userName: '',
        password: '',
        email: '',
        telefono: '',
        direccion: '',
        roleCode: ''
      }
    },
    volverAConfiguracion() {
      this.$router.push({ path: '/configuracion-empresa-usuario', query: { vista: 'usuarios' } })
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

.agregar-btn {
  background: #0077b6;
  padding: 8px 12px;
  border-radius: 6px;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.agregar-btn:hover {
  background: #005f8a;
}

.agregar-btn:disabled {
  background: #a0c4d6;
  cursor: not-allowed;
}

.limpiar-campos-btn {
  background: #f4a261;
  padding: 8px 12px;
  border-radius: 6px;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.limpiar-campos-btn:hover {
  background: #e76f51;
}

.limpiar-campos-btn:disabled {
  background: #a0c4d6;
  cursor: not-allowed;
}

.volver-btn {
  background: #0077b6;
  padding: 8px 12px;
  border-radius: 6px;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.volver-btn:hover {
  background: #005f8a;
}

</style>
