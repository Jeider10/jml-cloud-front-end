<!-- src/components/configuracion/ConfiguracionUsuariosEmpresaView.vue -->

<template>
  <div class="configuracion-empresa-wrapper">
    <DashboardSideMenu @menu-toggle="menuOpen = $event" />
    <div :class="['main-content', { expanded: menuOpen }]">
      <h1 class="titulo">Administración de Usuarios y Roles</h1>

      <!-- Selector -->
      <div class="switch-view">
        <button :class="{ activo: vistaActual === 'usuarios' }" @click="cambiarVista('usuarios')">👤 Usuarios</button>
        <button :class="{ activo: vistaActual === 'roles' }" @click="cambiarVista('roles')">🧩 Roles</button>
      </div>

      <!-- 🔍 Filtro compacto dinámico centrado -->
      <div style="display: flex; justify-content: center; margin-top: 15px;">
        <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
          <!-- Selector de tipo de búsqueda -->
          <select v-model="tipoBusqueda" style="height: 32px;">
            <option disabled value="">Seleccione una opción</option>

            <!-- Opciones según vista -->
            <template v-if="vistaActual === 'usuarios'">
              <option value="identificacion">Identificación</option>
              <option value="nombres">Nombres</option>
              <option value="apellidos">Apellidos</option>
              <option value="userName">Usuario</option>
              <option value="roleName">Rol</option>
            </template>
            <template v-else>
              <option value="roleCode">Código</option>
              <option value="roleName">Nombre</option>
              <option value="descripcion">Descripción</option>
            </template>
          </select>

          <!-- 🔍 Termino de búsqueda -->
          <input v-model="busqueda"
                 type="text"
                 placeholder="Ingrese término de búsqueda"
                 :disabled="!tipoBusqueda"
                 style="height: 30px; width: 200px; padding-left: 6px;" />

          <!-- 🔍 Botón de búsqueda -->
          <button type="button"
                  class="buscar-btn"
                  :disabled="!busqueda || !tipoBusqueda"
                  @click="filtrarDatos">
                  🔍 Buscar
          </button>

          <!-- 🧹 Botón de limpiar búsqueda -->
          <button type="button"
                  class="buscar-btn"
                  :disabled="!busqueda"
                  @click="limpiarBusqueda">
                  🧹 Limpiar
          </button>

          <!-- ➕ Botón de registro -->
          <button type="button"
                  class="agregar-btn"
                  @click="irARegistro">
                  ➕ Registrar {{ vistaActual === 'usuarios' ? 'Usuario' : 'Rol' }}
          </button>
        </div>
      </div>

      <!-- 🔔 Mensaje visual -->
      <transition name="fade">
        <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
          {{ mensaje }}
        </div>
      </transition>

      <!-- Tabla de Roles -->
      <table v-if="vistaActual === 'roles'" class="tabla">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Fecha Creación</th>
            <th>Fecha Actualización</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, idx) in roles" :key="r.roleCode">
            <td>{{ r.roleCode }}</td>
            <td>{{ r.roleName }}</td>
            <td>{{ r.descripcion || '-' }}</td>
            <td>{{ r.fechaCreacion || '-' }}</td>
            <td>{{ r.fechaActualizacion || '-' }}</td>
            <td>
              <button class="update-btn" @click="abrirConfirmacionActualizarRol(r)">✏️</button>
              <button class="delete-btn" @click="abrirConfirmacionEliminarRol(idx)">🗑️</button>
            </td>
          </tr>
          <tr v-if="roles.length === 0">
            <td colspan="6" class="empty-row">No hay roles registrados.</td>
          </tr>
        </tbody>
      </table>

      <!-- Tabla de Usuarios -->
      <table v-else class="tabla">
        <thead>
          <tr>
            <th>Identificación</th>
            <th>Nombres</th>
            <th>Apellidos</th>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Creación</th>
            <th>Actualización</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(u, idx) in usuarios" :key="u.identificacion">
            <td>{{ u.identificacion }}</td>
            <td>{{ u.nombres }}</td>
            <td>{{ u.apellidos }}</td>
            <td>{{ u.userName }}</td>
            <td>{{ u.roleName }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.telefono }}</td>
            <td>{{ u.direccion }}</td>
            <td>{{ u.fechaCreacion || '-' }}</td>
            <td>{{ u.fechaActualizacion || '-' }}</td>
            <td>
              <button class="update-btn" @click="abrirConfirmacionActualizarUsuario(u)">✏️</button>
              <button class="delete-btn" @click="abrirConfirmacionEliminarUsuario(idx)">🗑️</button>
            </td>
          </tr>
          <tr v-if="usuarios.length === 0">
            <td colspan="11" class="empty-row">No hay usuarios registrados.</td>
          </tr>
        </tbody>
      </table>

      <!-- Botón de registro -->
      <div class="acciones">
        <button class="registrar-btn" @click="irARegistro">
          ➕ Registrar {{ vistaActual === 'usuarios' ? 'Usuario' : 'Rol' }}
        </button>
      </div>
    </div>

    <!-- Modal de confirmación para actualización -->
    <div v-if="mostrarConfirmacionActualizar" class="modal-overlay">
      <div class="modal">
        <h3>⚠️ Confirmación</h3>
        <p>¿Deseas actualizar este {{ vistaActual === 'usuarios' ? 'usuario' : 'rol' }}?</p>
        <div class="modal-buttons">
          <button class="si-btn" @click="confirmarActualizar">Sí</button>
          <button class="no-btn" @click="cerrarModalActualizar">No</button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para eliminación -->
    <div v-if="mostrarConfirmacionEliminar" class="modal-overlay">
      <div class="modal">
        <h3>⚠️ Confirmación</h3>
        <p>¿Seguro que deseas eliminar este {{ vistaActual === 'usuarios' ? 'usuario' : 'rol' }}?</p>
        <div class="modal-buttons">
          <button class="si-btn" @click="confirmarEliminar">Sí</button>
          <button class="no-btn" @click="cerrarModalEliminar">No</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'
import { listarRoles, eliminarRole } from '@/services/apiConfigEmpresaRolesService'
import { listarUsuarios, eliminarUsuario } from '@/services/apiConfigEmpresaUsuariosService'

export default {
  name: 'ConfiguracionUsuariosEmpresaView',
  components: { DashboardSideMenu },
  data() {
    return {
      menuOpen: true,
      vistaActual: 'usuarios',
      roles: [],
      usuarios: [],
      usuariosOriginal: [],
      rolesOriginal: [],
      tipoBusqueda: '',
      busqueda: '',
      mostrarConfirmacionActualizar: false,
      mostrarConfirmacionEliminar: false,
      usuarioSeleccionado: null,
      rolSeleccionado: null,
      indiceSeleccionado: null,
      mensaje: '',
      mensajeTipo: 'success'
    }
  },

  async mounted() {
    const vista = this.$route.query.vista
    if (vista === 'roles' || vista === 'usuarios') {
        this.vistaActual = vista
    } else {
        this.vistaActual = 'usuarios'
    }
    await this.cargarDatos()
  },

  methods: {
    // 🔹 Método de mostrar mensaje
    mostrarMensaje(texto, tipo = 'success') {
      this.mensaje = texto
      this.mensajeTipo = tipo
      setTimeout(() => {
        this.mensaje = ''
      }, 3000)
    },

    async cargarDatos() {
      if (this.vistaActual === 'roles') {
        const { data } = await listarRoles()
        this.roles = data || []
        this.rolesOriginal = [...this.roles]
      } else {
        const { data } = await listarUsuarios()
        this.usuarios = data || []
        this.usuariosOriginal = [...this.usuarios]
      }
    },

    async cambiarVista(vista) {
      this.vistaActual = vista
      this.tipoBusqueda = ''
      this.busqueda = ''
      await this.cargarDatos()
    },

    // 🔍 Filtrar según tipo y término
    filtrarDatos() {
      const termino = this.busqueda.trim().toLowerCase()
      if (!termino) return

      if (this.vistaActual === 'usuarios') {
        this.usuarios = this.usuariosOriginal.filter(u => {
          const valor = u[this.tipoBusqueda]
          return valor && valor.toString().toLowerCase().includes(termino)
        })
      } else {
        this.roles = this.rolesOriginal.filter(r => {
          const valor = r[this.tipoBusqueda]
          return valor && valor.toString().toLowerCase().includes(termino)
        })
      }
    },

    // 🧹 Limpiar filtro
    limpiarBusqueda() {
      this.busqueda = ''
      this.tipoBusqueda = ''
      if (this.vistaActual === 'usuarios') {
        this.usuarios = [...this.usuariosOriginal]
      } else {
        this.roles = [...this.rolesOriginal]
      }
    },

    irARegistro() {
      if (this.vistaActual === 'roles') {
        this.$router.push({ name: 'ConfiguracionRegistroRolesView' })
      } else {
        this.$router.push({ name: 'ConfiguracionRegistroUsuariosView' })
      }
    },

    // 🔹 Abrir modal de confirmación para actualización de usuario
    abrirConfirmacionActualizarUsuario(usuario) {
      this.usuarioSeleccionado = usuario
      this.mostrarConfirmacionActualizar = true
    },

    // 🔹 Abrir modal de confirmación para actualización de rol
    abrirConfirmacionActualizarRol(role) {
      this.rolSeleccionado = role
      this.mostrarConfirmacionActualizar = true
    },

    confirmarActualizar() {
      if (this.vistaActual === 'usuarios' && this.usuarioSeleccionado) {
        this.$router.push({
          name: 'ConfiguracionActualizarUsuarioView',
          params: { identificacion: this.usuarioSeleccionado.identificacion }
        })
      } else if (this.vistaActual === 'roles' && this.rolSeleccionado) {
        this.$router.push({
          name: 'ConfiguracionActualizarRoleView',
          params: { roleCode: this.rolSeleccionado.roleCode }
        })
      }
      this.cerrarModalActualizar()
    },

    cerrarModalActualizar() {
      this.mostrarConfirmacionActualizar = false
      this.usuarioSeleccionado = null
      this.rolSeleccionado = null
    },

    // 🔹 Abrir modal de confirmación para eliminación
    abrirConfirmacionEliminarUsuario(idx) {
      this.indiceSeleccionado = idx
      this.mostrarConfirmacionEliminar = true
    },

    abrirConfirmacionEliminarRol(idx) {
      this.indiceSeleccionado = idx
      this.mostrarConfirmacionEliminar = true
    },

    async confirmarEliminar() {
      try {
        if (this.vistaActual === 'usuarios') {
          const usuario = this.usuarios[this.indiceSeleccionado]
          await eliminarUsuario(usuario.identificacion)
          this.mostrarMensaje(`✅ Usuario "${usuario.nombres} ${usuario.apellidos}" eliminado correctamente.`)
          this.usuarios.splice(this.indiceSeleccionado, 1)
        } else if (this.vistaActual === 'roles') {
          const rol = this.roles[this.indiceSeleccionado]
          await eliminarRole(rol.roleCode)
          this.mostrarMensaje(`✅ Rol "${rol.roleName}" eliminado correctamente.`)
          this.roles.splice(this.indiceSeleccionado, 1)
        }
      } catch (error) {
        this.mostrarMensaje(`❌ Error al eliminar ${this.vistaActual === 'usuarios' ? 'usuario' : 'rol'}: ${error.message}`, 'error')
      } finally {
        this.cerrarModalEliminar()
      }
    },

    cerrarModalEliminar() {
      this.mostrarConfirmacionEliminar = false
      this.indiceSeleccionado = null
    }
  }
}
</script>


<style scoped>
.configuracion-empresa-wrapper {
  display: flex;
}

.main-content {
  position: absolute;
  top: 0;
  left: 60px;
  right: 0;
  bottom: 0;
  padding: 20px;
  background-color: #d4f8e8;
  transition: left 0.5s ease;
}

.main-content.expanded {
  left: 220px;
}

.titulo {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.switch-view {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.switch-view button {
  padding: 10px 20px;
  border-radius: 8px;
  border: 2px solid #28a745;
  background: white;
  cursor: pointer;
  font-weight: bold;
}

.switch-view button.activo {
  background: #28a745;
  color: white;
}

.tabla {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  margin-top: 20px;
}

.tabla {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
}

td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
}

th {
  background: #0077b6;
  color: white;
}

.tabla th {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: center;
}

.tabla td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: center;
}

.tabla th {
  background-color: #28a745;
  color: white;
}

.acciones {
  text-align: center;
}

.registrar-btn {
  background: #007bff;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.registrar-btn:hover {
  background: #0056b3;
}

.update-btn, .delete-btn {
  border: none;
  cursor: pointer;
  font-size: 18px;
  margin: 0 4px;
}

.update-btn:hover {
  color: #0077b6;
}

.delete-btn:hover {
  color: #e63946;
}

.empty-row {
  text-align: center;
  color: #777;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  padding: 25px;
  border-radius: 10px;
  text-align: center;
  width: 350px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
}

.modal h3 {
  margin-bottom: 15px;
  color: #e67e22;
}

.modal-buttons {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

.si-btn {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.no-btn {
  background-color: #c0392b;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.si-btn:hover {
  background-color: #1e8449;
}

.no-btn:hover {
  background-color: #922b21;
}

.mensaje {
  margin: 10px auto 20px auto;
  padding: 10px 20px;
  width: 80%;
  border-radius: 8px;
  text-align: center;
  font-weight: bold;
  transition: all 0.3s ease;
}

.mensaje.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.mensaje.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.filtro-container {
  margin: 12px 0 20px;
}

.buscar-btn {
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 14px;
  height: 32px;
}

.buscar-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.agregar-btn {
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 14px;
  height: 32px;
}

</style>
