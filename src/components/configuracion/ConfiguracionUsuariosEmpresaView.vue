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
              <button class="update-btn" @click="abrirActualizarRol(r)">✏️</button>
              <button class="delete-btn" @click="confirmarEliminarRol(idx)">🗑️</button>
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
              <button class="update-btn" @click="abrirActualizarUsuario(u)">✏️</button>
              <button class="delete-btn" @click="confirmarEliminarUsuario(idx)">🗑️</button>
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
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'
import { listarRoles } from '@/services/apiConfigEmpresaRolesService'
import { listarUsuarios } from '@/services/apiConfigEmpresaUsuariosService'

export default {
  name: 'ConfiguracionUsuariosEmpresaView',
  components: { DashboardSideMenu },
  data() {
    return {
      menuOpen: true,
      vistaActual: 'usuarios',
      roles: [],
      usuarios: []
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
    async cargarDatos() {
      if (this.vistaActual === 'roles') {
        const { data } = await listarRoles()
        this.roles = data || []
      } else {
        const { data } = await listarUsuarios()
        this.usuarios = data || []
      }
    },
    async cambiarVista(vista) {
      this.vistaActual = vista
      await this.cargarDatos()
    },
    irARegistro() {
      if (this.vistaActual === 'roles') {
        this.$router.push('/registro/roles')
      } else {
        this.$router.push('/registro/usuarios')
      }
    },

    abrirActualizarUsuario(usuario) {
      this.$router.push({
        name: 'ConfiguracionActualizarUsuarioView',
        params: { identificacion: usuario.identificacion }
      })
    },

    abrirActualizarRol(rol) {
      this.$router.push({ path: `/actualizar-rol/${rol.roleCode}` })
    },
    confirmarEliminarUsuario(idx) {
      const u = this.usuarios[idx]
      if (confirm(`¿Desea eliminar al usuario ${u.nombres} ${u.apellidos}?`)) {
        this.usuarios.splice(idx, 1)
      }
    },
    confirmarEliminarRol(idx) {
      const r = this.roles[idx]
      if (confirm(`¿Desea eliminar el rol ${r.roleName}?`)) {
        this.roles.splice(idx, 1)
      }
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
}
.tabla th, .tabla td {
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

.tabla {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
}

th {
  background: #0077b6;
  color: white;
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
</style>
