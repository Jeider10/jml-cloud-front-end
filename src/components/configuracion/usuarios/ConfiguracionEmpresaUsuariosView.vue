<!-- src/components/configuracion/usuarios/ConfiguracionEmpresaUsuariosView.vue -->

<template>
  <div class="configuracion-empresa-wrapper">
    <DashboardSideMenu @menu-toggle="menuOpen = $event" />
    <div :class="['main-content', { expanded: menuOpen }]">
      <h1 class="titulo">Administración de Usuarios y Roles</h1>

      <!-- Selector -->
      <div class="switch-view">
        <button
          :class="{ activo: vistaActual === 'usuarios' }"
          @click="cambiarVista('usuarios')"
        >
          👤 Usuarios
        </button>
        <button
          :class="{ activo: vistaActual === 'roles' }"
          @click="cambiarVista('roles')"
        >
          🧩 Roles
        </button>
      </div>

      <!-- 🔍 Filtro compacto dinámico centrado -->
      <div style="display: flex; justify-content: center; margin-top: 15px">
        <div
          style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap"
        >
          <!-- Selector de tipo de búsqueda -->
          <select v-model="tipoBusqueda" style="height: 32px">
            <option disabled value="">Seleccione una opción</option>

            <!-- Opciones según vista -->
            <template v-if="vistaActual === 'usuarios'">
              <option value="identificacion">Identificación</option>
              <option value="nombres">Nombres</option>
              <option value="apellidos">Apellidos</option>
              <option value="userName">Usuario</option>
              <option value="roleName">Rol</option>
              <option value="fechaCreacion">Fecha de Creación</option>
            </template>
            <template v-else>
              <option value="roleCode">Código</option>
              <option value="roleName">Nombre</option>
              <option value="descripcion">Descripción</option>
              <option value="fechaCreacion">Fecha de Creación</option>
            </template>
          </select>

          <!-- 🔍 Termino de búsqueda -->
          <input
            v-if="tipoBusqueda !== 'fechaCreacion'"
            v-model="busqueda"
            type="text"
            placeholder="Ingrese término de búsqueda"
            :disabled="!tipoBusqueda"
            style="height: 30px; width: 200px; padding-left: 6px"
          />

          <!-- 📅 Selector de rango de fecha estilo CloudWatch -->
          <DateRangePicker
            v-if="tipoBusqueda === 'fechaCreacion'"
            @aplicar="onFechaRangoAplicar"
          />

          <!-- 🔍 Botón de búsqueda -->
          <button
            type="button"
            class="buscar-btn"
            :disabled="!puedeFiltrarse"
            @click="filtrarDatos"
          >
            🔍 Buscar
          </button>

          <!-- 🧹 Botón de limpiar búsqueda -->
          <button
            type="button"
            class="buscar-btn"
            :disabled="!puedeFiltrarse && tipoBusqueda !== 'fechaCreacion'"
            @click="limpiarBusqueda"
          >
            🧹 Limpiar
          </button>

          <!-- ➕ Botón de registro -->
          <button type="button" class="agregar-btn" @click="irARegistro">
            ➕ Registrar {{ vistaActual === "usuarios" ? "Usuario" : "Rol" }}
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
            <td>{{ r.descripcion || "-" }}</td>
            <td>{{ r.fechaCreacion || "-" }}</td>
            <td>{{ r.fechaActualizacion || "-" }}</td>
            <td>
              <button
                class="update-btn"
                title="Editar"
                @click="abrirConfirmacionActualizarRol(r)"
              >
                ✏️
              </button>
              <button
                class="delete-btn"
                title="Eliminar"
                @click="abrirConfirmacionEliminarRol(idx)"
              >
                🗑️
              </button>
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
            <th>Fecha Creación</th>
            <th>Fecha Actualización</th>
            <th>Historial de Actualización</th>
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
            <td>{{ u.fechaCreacion || "-" }}</td>
            <td>{{ u.fechaActualizacion || "-" }}</td>
            <td>{{ u.historialUltimoActualizado || "-" }}</td>
            <td>
              <button
                class="update-btn"
                title="Editar"
                @click="abrirConfirmacionActualizarUsuario(u)"
              >
                ✏️
              </button>
              <button
                class="delete-btn"
                title="Eliminar"
                @click="abrirConfirmacionEliminarUsuario(idx)"
              >
                🗑️
              </button>
              <button
                class="reset-pwd-btn"
                @click="abrirModalResetPassword(u)"
                title="Resetear contraseña"
              >
                🔑
              </button>
            </td>
          </tr>
          <tr v-if="usuarios.length === 0">
            <td colspan="12" class="empty-row">No hay usuarios registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de confirmación para actualización -->
    <div v-if="mostrarConfirmacionActualizar" class="modal-overlay">
      <div class="modal">
        <h3>⚠️ Confirmación</h3>
        <p>
          ¿Deseas actualizar este
          {{ vistaActual === "usuarios" ? "usuario" : "rol" }}?
        </p>
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
        <p>
          ¿Seguro que deseas eliminar este
          {{ vistaActual === "usuarios" ? "usuario" : "rol" }}?
        </p>
        <div class="modal-buttons">
          <button class="si-btn" @click="confirmarEliminar">Sí</button>
          <button class="no-btn" @click="cerrarModalEliminar">No</button>
        </div>
      </div>
    </div>

    <!-- Modal de resetear contraseña -->
    <div v-if="modalResetPassword.visible" class="modal-overlay">
      <div class="modal">
        <h3>🔑 Resetear Contraseña</h3>
        <p>
          Usuario: <strong>{{ modalResetPassword.userName }}</strong>
        </p>
        <p style="font-size: 12px; color: #666">
          Ingrese la nueva contraseña temporal:
        </p>
        <div style="position: relative; margin: 10px 0">
          <input
            :type="mostrarPassword ? 'text' : 'password'"
            v-model="modalResetPassword.nuevaPassword"
            placeholder="Nueva contraseña"
            style="
              width: 100%;
              padding: 8px 35px 8px 8px;
              border: 1px solid #ccc;
              border-radius: 6px;
              box-sizing: border-box;
            "
          />
          <button
            type="button"
            @click="mostrarPassword = !mostrarPassword"
            style="
              position: absolute;
              right: 8px;
              top: 50%;
              transform: translateY(-50%);
              border: none;
              background: none;
              cursor: pointer;
              font-size: 16px;
            "
          >
            {{ mostrarPassword ? "🙈" : "👁️" }}
          </button>
        </div>

        <p
          v-if="
            modalResetPassword.nuevaPassword &&
            modalResetPassword.nuevaPassword.length < 3
          "
          style="color: #e74c3c; font-size: 11px; margin-top: 5px"
        >
          La contraseña no cumple con lo requerido (minimo 3 caracteres)
        </p>

        <div class="modal-buttons">
          <button
            class="si-btn"
            @click="confirmarResetPassword"
            :disabled="
              !modalResetPassword.nuevaPassword ||
              modalResetPassword.nuevaPassword.length < 3
            "
          >
            Confirmar
          </button>
          <button class="no-btn" @click="modalResetPassword.visible = false">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from "@/views/dashboard/DashboardSideMenu.vue";
import DateRangePicker from "@/components/common/DateRangePicker.vue";
import {
  buscarRolePorRoleCode,
  listarRoles,
  eliminarRole,
  buscarRolePorRoleName,
  buscarRolePorFechaCreacion,
} from "@/services/apiConfigEmpresaRolesService";

import {
  buscarUsuarioPorIdentificacion,
  listarUsuarios,
  eliminarUsuario,
  buscarUsuarioPorUserName,
  buscarUsuarioPorNombres,
  buscarUsuarioPorApellidos,
  buscarUsuarioPorRoleName,
  buscarUsuarioPorFechaCreacion,
} from "@/services/apiConfigEmpresaUsuariosService";

import { getSession, updateForgotPassword } from "@/services/apiAuthService";

export default {
  name: "ConfiguracionEmpresaUsuariosView",
  components: { DashboardSideMenu, DateRangePicker },
  data() {
    return {
      menuOpen: localStorage.getItem("menuPinned") === "true", // Siempre arranca expandido y false arranca oculto
      vistaActual: "usuarios",
      roles: [],
      usuarios: [],
      usuariosOriginal: [],
      rolesOriginal: [],
      tipoBusqueda: "",
      busqueda: "",
      fechaRango: { fechaInicio: "", fechaFin: "" },
      mostrarConfirmacionActualizar: false,
      mostrarConfirmacionEliminar: false,
      usuarioSeleccionado: null,
      rolSeleccionado: null,
      indiceSeleccionado: null,
      mensaje: "",
      mensajeTipo: "success",
      userLogin: null,
      mostrarPassword: false,
      modalResetPassword: {
        visible: false,
        userName: "",
        nuevaPassword: "",
      },
    };
  },

  computed: {
    puedeFiltrarse() {
      if (!this.tipoBusqueda) return false;
      if (this.tipoBusqueda === "fechaCreacion") {
        return (
          this.fechaRango.fechaInicio !== "" && this.fechaRango.fechaFin !== ""
        );
      }
      return this.busqueda.trim().length > 0;
    },
  },

  async mounted() {
    const vista = this.$route.query.vista;
    if (vista === "roles" || vista === "usuarios") {
      this.vistaActual = vista;
    } else {
      this.vistaActual = "usuarios";
    }

    // ✅ Cargar usuario logueado desde la sesión
    try {
      const session = getSession(); // ✅ Obtenemos la sesión activa
      console.log("👤 sesión:", session);
      const token = session?.refreshToken;

      if (!token) {
        this.mostrarMensaje(
          "⚠️ No hay sesión activa. Inicia sesión nuevamente.",
          "warning",
        );
        this.$router.push("/login");
        return;
      }

      this.userLogin = session?.user?.login || null;
      console.log("🆕 Usuario logueado detectado:", this.userLogin);

      if (this.userLogin) {
        const { data: datosUsuario } = await buscarUsuarioPorUserName(
          this.userLogin,
        );
        console.log("🔹 buscarUsuarioPorUserName →", datosUsuario);

        // ⚠️ Si el backend devuelve un array, toma el primer elemento
        const nombreUsuarioLogin = Array.isArray(datosUsuario)
          ? datosUsuario[0]
          : datosUsuario;
        console.log("🔹 Nombre usuario login →", nombreUsuarioLogin.nombres);

        this.userLogin =
          nombreUsuarioLogin.nombres + " " + nombreUsuarioLogin.apellidos;
      }

      console.log("🆕 Nombre de Usuario logueado detectado:", this.userLogin);
    } catch (error) {
      console.error("❌ Error al obtener usuario logueado:", error);
      this.mostrarMensaje("❌ Error al obtener el usuario actual.", "error");
    }

    await this.cargarDatos();
  },

  methods: {
    // 🔹 Método de mostrar mensaje
    mostrarMensaje(texto, tipo = "success") {
      this.mensaje = texto;
      this.mensajeTipo = tipo;
      setTimeout(() => {
        this.mensaje = "";
      }, 3000);
    },

    async cargarDatos() {
      if (this.vistaActual === "roles") {
        const { data } = await listarRoles();
        this.roles = data || [];
        this.rolesOriginal = [...this.roles];
      } else {
        const { data } = await listarUsuarios();
        this.usuarios = data || [];
        this.usuariosOriginal = [...this.usuarios];
      }
    },

    async cambiarVista(vista) {
      this.vistaActual = vista;
      this.tipoBusqueda = "";
      this.busqueda = "";

      // ✅ Actualiza la query en la URL sin recargar la vista
      this.$router.replace({
        query: { vista },
      });

      await this.cargarDatos();
    },

    // 🔍 Filtrar según tipo y término
    async filtrarDatos() {
      // Caso especial: busqueda por fecha (aplica a usuarios y roles)
      if (this.tipoBusqueda === "fechaCreacion") {
        if (this.vistaActual === "usuarios") {
          return this.filtrarUsuariosPorFecha();
        } else {
          return this.filtrarRolesPorFecha();
        }
      }

      const termino = this.busqueda.trim();
      if (!termino || !this.tipoBusqueda) {
        this.mostrarMensaje(
          "⚠️ Por favor, seleccione un tipo de búsqueda y un término.",
          "error",
        );
        return;
      }

      try {
        if (this.vistaActual === "usuarios") {
          let response;

          switch (this.tipoBusqueda) {
            case "identificacion":
              response = await buscarUsuarioPorIdentificacion(termino);

              if (response.data) {
                // ✅ Usuario encontrado
                this.usuarios = [response.data];
                this.mostrarMensaje(
                  "✅ Usuario encontrado correctamente.",
                  "success",
                );
              } else {
                // ❌ No se encontró usuario (null)
                this.usuarios = [];
                this.mostrarMensaje(
                  `❌ No se encontró usuario con identificación: ${termino}`,
                  "warning",
                );
              }
              break;

            case "userName":
              response = await buscarUsuarioPorUserName(termino);
              if (response.data && response.data.length > 0) {
                this.usuarios = response.data;
                this.mostrarMensaje(
                  `✅ Se encontraron ${response.data.length} usuarios con userName parecido a "${termino}".`,
                  "success",
                );
              } else {
                this.usuarios = [];
                this.mostrarMensaje(
                  `❌ No se encontraron usuarios con userName: ${termino}`,
                  "warning",
                );
              }
              break;

            case "nombres":
              response = await buscarUsuarioPorNombres(termino);
              if (response.data && response.data.length > 0) {
                this.usuarios = response.data;
                this.mostrarMensaje(
                  `✅ Se encontraron ${response.data.length} usuarios con nombres similares a "${termino}".`,
                  "success",
                );
              } else {
                this.usuarios = [];
                this.mostrarMensaje(
                  `❌ No se encontraron usuarios con nombres: ${termino}`,
                  "warning",
                );
              }
              break;

            case "apellidos":
              response = await buscarUsuarioPorApellidos(termino);
              if (response.data && response.data.length > 0) {
                this.usuarios = response.data;
                this.mostrarMensaje(
                  `✅ Se encontraron ${response.data.length} usuarios con apellidos similares a "${termino}".`,
                  "success",
                );
              } else {
                this.usuarios = [];
                this.mostrarMensaje(
                  `❌ No se encontraron usuarios con apellidos: ${termino}`,
                  "warning",
                );
              }
              break;

            case "roleName":
              response = await buscarUsuarioPorRoleName(termino);
              if (response.data && response.data.length > 0) {
                this.usuarios = response.data;
                this.mostrarMensaje(
                  `✅ Se encontraron ${response.data.length} usuarios con rol parecido a "${termino}".`,
                  "success",
                );
              } else {
                this.usuarios = [];
                this.mostrarMensaje(
                  `❌ No se encontraron usuarios con rol: ${termino}`,
                  "warning",
                );
              }
              break;

            default:
              this.mostrarMensaje("⚠️ Tipo de búsqueda no soportado.", "error");
              return;
          }
        } else if (this.vistaActual === "roles") {
          // 🔍 Filtrado de roles
          let response;

          switch (this.tipoBusqueda) {
            case "roleCode":
              response = await buscarRolePorRoleCode(termino);
              if (response.data) {
                this.roles = [response.data];
                this.mostrarMensaje(
                  "✅ Rol encontrado correctamente.",
                  "success",
                );
              } else {
                this.roles = [];
                this.mostrarMensaje(
                  `❌ No se encontró rol con código: ${termino}`,
                  "warning",
                );
              }
              break;

            case "roleName":
              response = await buscarRolePorRoleName(termino);
              if (response.data?.length > 0) {
                this.roles = response.data;
                this.mostrarMensaje(
                  `✅ ${response.data.length} roles encontrados.`,
                  "success",
                );
              } else {
                this.roles = [];
                this.mostrarMensaje(
                  `❌ No se encontraron roles con nombre: ${termino}`,
                  "warning",
                );
              }
              break;

            default:
              this.mostrarMensaje(
                "⚠️ Tipo de búsqueda no soportado para roles.",
                "error",
              );
          }
        }
      } catch (error) {
        // Si algo falla realmente (error HTTP, conexión, etc.)
        this.mostrarMensaje(
          error.response?.data?.message ||
            `❌ Error de conexión: ${error.message}`,
          "error",
        );
      }
    },

    // 🧹 Limpiar filtro
    limpiarBusqueda() {
      this.busqueda = "";
      this.tipoBusqueda = "";
      this.fechaRango = { fechaInicio: "", fechaFin: "" };
      if (this.vistaActual === "usuarios") {
        this.usuarios = [...this.usuariosOriginal];
      } else {
        this.roles = [...this.rolesOriginal];
      }
    },

    // 🔹 Callback del DateRangePicker
    onFechaRangoAplicar(rango) {
      this.fechaRango = rango;
      if (this.vistaActual === "usuarios") {
        this.filtrarUsuariosPorFecha();
      } else {
        this.filtrarRolesPorFecha();
      }
    },

    // 🔹 Metodo para filtrar usuarios por rango de fecha de creacion
    async filtrarUsuariosPorFecha() {
      try {
        const inicio = this.fechaRango.fechaInicio;
        const fin = this.fechaRango.fechaFin;

        if (!inicio || !fin) {
          this.mostrarMensaje("⚠️ Seleccione un rango de fechas.", "error");
          return;
        }

        const response = await buscarUsuarioPorFechaCreacion(inicio, fin);

        if (response.status === 204) {
          this.usuarios = [];
          this.mostrarMensaje(
            "❌ No se encontraron usuarios en el rango de fechas seleccionado.",
            "warning",
          );
          return;
        }

        if (response.data) {
          this.usuarios = Array.isArray(response.data)
            ? response.data
            : [response.data];
          this.mostrarMensaje(
            "✅ " +
              this.usuarios.length +
              " usuario(s) encontrado(s) en el rango de fechas.",
            "success",
          );
        }
      } catch (error) {
        this.mostrarMensaje(
          error.response?.data?.message ||
            "❌ Error al filtrar usuarios por fecha.",
          "error",
        );
      }
    },

    // 🔹 Metodo para filtrar roles por rango de fecha de creacion
    async filtrarRolesPorFecha() {
      try {
        const inicio = this.fechaRango.fechaInicio;
        const fin = this.fechaRango.fechaFin;

        if (!inicio || !fin) {
          this.mostrarMensaje("⚠️ Seleccione un rango de fechas.", "error");
          return;
        }

        const response = await buscarRolePorFechaCreacion(inicio, fin);

        if (response.status === 204) {
          this.roles = [];
          this.mostrarMensaje(
            "❌ No se encontraron roles en el rango de fechas seleccionado.",
            "warning",
          );
          return;
        }

        if (response.data) {
          this.roles = Array.isArray(response.data)
            ? response.data
            : [response.data];
          this.mostrarMensaje(
            "✅ " +
              this.roles.length +
              " rol(es) encontrado(s) en el rango de fechas.",
            "success",
          );
        }
      } catch (error) {
        this.mostrarMensaje(
          error.response?.data?.message ||
            "❌ Error al filtrar roles por fecha.",
          "error",
        );
      }
    },

    irARegistro() {
      if (this.vistaActual === "roles") {
        this.$router.push({ name: "ConfiguracionEmpresaRegistroRolesView" });
      } else {
        this.$router.push({ name: "ConfiguracionEmpresaRegistroUsuariosView" });
      }
    },

    // 🔹 Abrir modal de confirmación para actualización de usuario
    abrirConfirmacionActualizarUsuario(usuario) {
      this.usuarioSeleccionado = usuario;
      this.mostrarConfirmacionActualizar = true;
    },

    // 🔹 Abrir modal de confirmación para actualización de rol
    abrirConfirmacionActualizarRol(role) {
      this.rolSeleccionado = role;
      this.mostrarConfirmacionActualizar = true;
    },

    confirmarActualizar() {
      if (this.vistaActual === "usuarios" && this.usuarioSeleccionado) {
        this.$router.push({
          name: "ConfiguracionEmpresaActualizarUsuarioView",
          params: {
            identificacion: this.usuarioSeleccionado.identificacion,
            userLogin: this.userLogin,
          },
        });
      } else if (this.vistaActual === "roles" && this.rolSeleccionado) {
        this.$router.push({
          name: "ConfiguracionEmpresaActualizarRoleView",
          params: { roleCode: this.rolSeleccionado.roleCode },
        });
      }
      this.cerrarModalActualizar();
    },

    cerrarModalActualizar() {
      this.mostrarConfirmacionActualizar = false;
      this.usuarioSeleccionado = null;
      this.rolSeleccionado = null;
    },

    // 🔹 Abrir modal de confirmación para eliminación
    abrirConfirmacionEliminarUsuario(idx) {
      this.indiceSeleccionado = idx;
      this.mostrarConfirmacionEliminar = true;
    },

    abrirConfirmacionEliminarRol(idx) {
      this.indiceSeleccionado = idx;
      this.mostrarConfirmacionEliminar = true;
    },

    async confirmarEliminar() {
      try {
        if (this.vistaActual === "usuarios") {
          const usuario = this.usuarios[this.indiceSeleccionado];
          await eliminarUsuario(usuario.identificacion);
          this.mostrarMensaje(
            `✅ Usuario "${usuario.nombres} ${usuario.apellidos}" eliminado correctamente.`,
          );
          this.usuarios.splice(this.indiceSeleccionado, 1);
        } else if (this.vistaActual === "roles") {
          const rol = this.roles[this.indiceSeleccionado];
          await eliminarRole(rol.roleCode);
          this.mostrarMensaje(
            `✅ Rol "${rol.roleName}" eliminado correctamente.`,
          );
          this.roles.splice(this.indiceSeleccionado, 1);
        }
      } catch (error) {
        this.mostrarMensaje(
          `❌ Error al eliminar ${this.vistaActual === "usuarios" ? "usuario" : "rol"}: ${error.message}`,
          "error",
        );
      } finally {
        this.cerrarModalEliminar();
      }
    },

    cerrarModalEliminar() {
      this.mostrarConfirmacionEliminar = false;
      this.indiceSeleccionado = null;
    },

    // 🔑 Abrir modal para resetear contraseña
    abrirModalResetPassword(usuario) {
      this.modalResetPassword = {
        visible: true,
        userName: usuario.userName,
        nuevaPassword: "",
      };
      this.mostrarPassword = false;
    },

    // 🔑 Confirmar reset de contraseña
    async confirmarResetPassword() {
      try {
        await updateForgotPassword(
          this.modalResetPassword.userName,
          this.modalResetPassword.nuevaPassword,
        );
        this.mostrarMensaje(
          "✅ Contraseña actualizada correctamente para " +
            this.modalResetPassword.userName,
          "success",
        );
        this.modalResetPassword.visible = false;
      } catch (error) {
        this.mostrarMensaje(
          error.response?.data?.message ||
            "❌ Error al resetear la contraseña.",
          "error",
        );
      }
    },
  },
};
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
  overflow: auto; /* scroll solo cuando el contenido lo necesita */
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

.update-btn,
.delete-btn,
.reset-pwd-btn {
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

.reset-pwd-btn:hover {
  color: #f4a261;
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
  z-index: 99999;
}

.modal {
  background: #fff;
  padding: 25px;
  border-radius: 10px;
  text-align: center;
  width: 380px;
  max-width: 90vw;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
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
