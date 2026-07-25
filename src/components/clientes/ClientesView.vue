<!-- src/components/clientes/ClientesView.vue -->

<template>
  <div class="registro-cliente-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="handleMenuToggle" />

    <!-- Contenido principal -->
    <div :class="['cliente-container', { expanded: menuOpen }]">
      <h1 class="titulo">Clientes</h1>

      <!-- 🔔 Mensaje visual -->
      <transition name="fade">
        <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
          {{ mensaje }}
        </div>
      </transition>

      <!-- Modal de confirmación de eliminación -->
      <transition name="fade">
        <div v-if="modalEliminar.visible" class="modal-overlay">
          <div class="modal-content">
            <p>
              ⚠️ ¿Está seguro de eliminar al cliente
              {{ modalEliminar.cliente.nombres }}
              {{ modalEliminar.cliente.apellidos }}?
            </p>
            <div class="modal-buttons">
              <!-- ✅ Botón de si -->
              <button
                class="btn-yes"
                @click="eliminarCliente(modalEliminar.idx)"
              >
                Sí
              </button>
              <!-- ❌️ Botón de no -->
              <button class="btn-no" @click="modalEliminar.visible = false">
                No
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- 🔍 Filtro de búsqueda -->
      <div class="form-filtro">
        <!-- Texto descriptivo -->
        <!-- <span style="font-weight: bold;">Buscar por:</span> -->
        <span class="buscar-label">Buscar por:</span>

        <!-- Nuevo: selector + input + botones -->
        <div style="display: flex; gap: 4px">
          <select v-model="tipoBusqueda">
            <option disabled value="">Seleccione una opción</option>
            <option value="identificacion">Identificación</option>
            <option value="nombres">Nombres</option>
            <option value="apellidos">Apellidos</option>
            <option value="direccion">Dirección</option>
            <option value="fechaCreacion">Fecha de Creación</option>
          </select>

          <!-- 🔍 Termino de búsqueda -->
          <input
            v-if="tipoBusqueda !== 'fechaCreacion'"
            v-model="busqueda"
            type="text"
            placeholder="Ingrese término de búsqueda"
            :disabled="!tipoBusqueda"
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
            @click="filtrarClientes"
          >
            🔍 Buscar
          </button>

          <!-- 🧹 Botón de limpiar búsqueda -->
          <button
            type="button"
            class="limpiar-btn"
            :disabled="!puedeFiltrarse && tipoBusqueda !== 'fechaCreacion'"
            @click="limpiarBusqueda"
          >
            🧹 Limpiar
          </button>

          <!-- ➕ Botón de registrar producto -->
          <button type="button" class="registrar-btn" @click="agregarCliente">
            ➕ Registrar Cliente
          </button>
        </div>
      </div>

      <!-- Tabla de clientes -->
      <table class="clientes-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>IDENTIFICACIÓN</th>
            <th>NOMBRES</th>
            <th>APELLIDOS</th>
            <th>TELÉFONO</th>
            <th>DIRECCIÓN</th>
            <th>FECHA CREACIÓN</th>
            <th>FECHA ACTUALIZACIÓN</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(c, idx) in clientesFiltrados" :key="idx">
            <td>{{ idx + 1 }}</td>
            <td>{{ c.identificacion }}</td>
            <td>{{ c.nombres }}</td>
            <td>{{ c.apellidos }}</td>
            <td>{{ c.telefono }}</td>
            <td>{{ c.direccion }}</td>
            <td>{{ c.fechaCreacion }}</td>
            <!-- ⏰ Fecha de registro -->
            <td>{{ c.fechaActualizacion }}</td>
            <!-- ⏰ Fecha actualización, inicialmente vacía -->
            <td>
              <!-- ✏️ Botón de editar -->
              <button
                class="update-btn"
                title="Editar"
                @click="abrirActualizarCliente(c)"
              >
                ✏️
              </button>
              <!-- 🗑️️ Botón de eliminar -->
              <button
                class="delete-btn"
                title="Eliminar"
                @click="confirmarEliminar(idx)"
              >
                🗑️
              </button>
            </td>
          </tr>
          <tr v-if="clientesFiltrados.length === 0">
            <td colspan="9" class="empty-row">No hay clientes registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from "@/views/dashboard/DashboardSideMenu.vue";
import DateRangePicker from "@/components/common/DateRangePicker.vue";
import {
  listarClientes,
  buscarClientePorIdentificacion,
  buscarClientePorNombres,
  buscarClientePorApellidos,
  buscarClientePorFechaCreacion,
  buscarClientePorDireccion,
  eliminarClientePorIdentificacion,
} from "@/services/apiCustomerService.js";

export default {
  name: "ClientesView",
  components: { DashboardSideMenu, DateRangePicker },
  data() {
    return {
      menuOpen: localStorage.getItem("menuPinned") === "true", // Siempre arranca expandido y false arranca oculto
      clienteForm: {
        identificacion: "",
        nombres: "",
        apellidos: "",
        telefono: "",
        direccion: "",
      },
      clientes: [],
      clientesFiltrados: [],
      mensaje: "",
      mensajeTipo: "",
      busqueda: "",
      tipoBusqueda: "",
      fechaRango: { fechaInicio: "", fechaFin: "" },
      modalEliminar: {
        visible: false,
        idx: null,
        cliente: {},
      },
    };
  },

  // 🔹 Cargar todos los clientes desde backend al iniciar
  mounted() {
    this.cargarClientes();
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

  methods: {
    // handleMenuToggle(state) {
    // this.menuOpen = state // Se descomenta cuando menuOpen: false
    // },

    // 🔹 Método de mostrar mensaje
    mostrarMensaje(texto, tipo = "success") {
      this.mensaje = texto;
      this.mensajeTipo = tipo;
      setTimeout(() => {
        this.mensaje = "";
      }, 3000);
    },

    // 🔹 Método para cargar clientes desde el backend
    async cargarClientes() {
      try {
        const response = await listarClientes();

        // 🟡 Caso 1: No hay clientes (HTTP 204)
        if (response.status === 204) {
          this.clientes = [];
          this.clientesFiltrados = [];
          this.mostrarMensaje(
            "⚠️ No se encontraron clientes en el sistema.",
            "warning",
          );
          return;
        }

        // 🟢 Caso 2: Clientes cargados exitosamente
        this.clientes = response.data;
        this.clientesFiltrados = [...this.clientes];

        this.mostrarMensaje(
          `✅ ${this.clientes.length} cliente${this.clientes.length === 1 ? "" : "s"} cargado${this.clientes.length === 1 ? "" : "s"} correctamente.`,
          "success",
        );
      } catch (error) {
        this.manejarErrorApiClientes(error, "cargar clientes");
      }
    },

    // 🔹 Método para llamar al componente de agregar cliente
    async agregarCliente(cliente) {
      this.$router.push({
        name: "RegistroClienteView",
        state: { cliente },
      });
    },

    // 🔹 Método para llamar al componente de actualizar cliente
    abrirActualizarCliente(cliente) {
      this.$router.push({
        name: "ActualizarClienteView",
        params: {
          identificacion: cliente.identificacion,
        },
      });
    },

    // 🔹 Método para eliminar cliente
    async eliminarCliente(idx) {
      const cliente = this.clientes[idx];

      try {
        await eliminarClientePorIdentificacion(cliente.identificacion);

        // ✅ Eliminamos solo si backend respondió bien
        this.clientes.splice(idx, 1);
        this.clientesFiltrados = [...this.clientes];

        this.mostrarMensaje(
          `🗑️ Cliente ${cliente.nombres} ${cliente.apellidos} eliminado correctamente.`,
          "success",
        );
      } catch (error) {
        this.manejarErrorApiClientes(
          error,
          `eliminar cliente ${cliente.nombres}`,
        );
      } finally {
        // 🧹 Siempre cerramos el modal de confirmación
        this.modalEliminar.visible = false;
      }
    },

    // 🔹 Método para filtrar clientes según el tipo de búsqueda
    async filtrarClientes() {
      // Caso especial: busqueda por fecha
      if (this.tipoBusqueda === "fechaCreacion") {
        return this.filtrarClientesPorFecha();
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
        let response;

        switch (this.tipoBusqueda) {
          case "identificacion":
            response = await buscarClientePorIdentificacion(termino);
            break;
          case "nombres":
            response = await buscarClientePorNombres(termino);
            break;
          case "apellidos":
            response = await buscarClientePorApellidos(termino);
            break;
          case "direccion":
            response = await buscarClientePorDireccion(termino);
            break;
          default:
            this.mostrarMensaje("⚠️ Tipo de búsqueda no válido.", "error");
            return;
        }

        console.log("📦 Respuesta del backend:", response);

        // ✅ Cliente(s) no encontrado(s)
        if (response.status === 204) {
          this.clientesFiltrados = [];
          this.mostrarMensaje(
            `❌ No se encontraron clientes con ${this.tipoBusqueda}: ${termino}`,
            "warning",
          );
          return;
        }

        // ✅ Cliente(s) encontrado(s)
        if (response.data) {
          if (Array.isArray(response.data)) {
            this.clientesFiltrados = response.data;
          } else {
            this.clientesFiltrados = [response.data];
          }
          this.mostrarMensaje(
            `✅ Cliente${Array.isArray(response.data) && response.data.length > 1 ? "s" : ""} encontrado${Array.isArray(response.data) && response.data.length > 1 ? "s" : ""} correctamente.`,
            "success",
          );
          return;
        }

        // ⚠️ Caso defensivo (nunca debería entrar aquí)
        this.clientesFiltrados = [];
        this.mostrarMensaje(
          `❌ No se encontró cliente con ${this.tipoBusqueda}: ${termino}`,
          "warning",
        );
      } catch (error) {
        this.manejarErrorApiClientes(
          error,
          `filtrar clientes por ${this.tipoBusqueda}`,
        );
      }
    },

    // 🔹 Método para abrir modal en vez de window.confirm
    confirmarEliminar(idx) {
      this.modalEliminar.idx = idx;
      this.modalEliminar.cliente = this.clientes[idx];
      this.modalEliminar.visible = true;
    },

    // 🔹 Método para saber si hay datos en el cuadro de filtro
    hayDatosFiltro() {
      return this.busqueda.trim().length > 0;
    },

    // 🔹 Método para saber si hay datos en el formulario
    hayDatos() {
      return (
        this.clienteForm.identificacion ||
        this.clienteForm.nombres ||
        this.clienteForm.apellidos ||
        this.clienteForm.telefono ||
        this.clienteForm.direccion
      );
    },

    // 🔹 Método de limpiar campos del formulario
    limpiarCampos() {
      this.clienteForm = {
        identificacion: "",
        nombres: "",
        apellidos: "",
        telefono: "",
        direccion: "",
      };
    },

    // 🔹 Método para limpiar búsqueda
    limpiarBusqueda() {
      this.busqueda = "";
      this.tipoBusqueda = ""; // 🔹 Resetea la opción del selector
      this.fechaRango = { fechaInicio: "", fechaFin: "" };
      this.cargarClientes(); // 🔹 Vuelve a cargar todos los clientes
    },

    // 🔹 Callback del DateRangePicker
    onFechaRangoAplicar(rango) {
      this.fechaRango = rango;
      // Auto-buscar al aplicar el rango
      this.filtrarClientesPorFecha();
    },

    // 🔹 Metodo para filtrar clientes por rango de fecha de creacion
    async filtrarClientesPorFecha() {
      try {
        const inicio = this.fechaRango.fechaInicio;
        const fin = this.fechaRango.fechaFin;

        if (!inicio || !fin) {
          this.mostrarMensaje("⚠️ Seleccione un rango de fechas.", "error");
          return;
        }

        const response = await buscarClientePorFechaCreacion(inicio, fin);

        if (response.status === 204) {
          this.clientesFiltrados = [];
          this.mostrarMensaje(
            "❌ No se encontraron clientes en el rango de fechas seleccionado.",
            "warning",
          );
          return;
        }

        if (response.data) {
          this.clientesFiltrados = Array.isArray(response.data)
            ? response.data
            : [response.data];
          this.mostrarMensaje(
            "✅ " +
              this.clientesFiltrados.length +
              " cliente(s) encontrado(s) en el rango de fechas.",
            "success",
          );
        }
      } catch (error) {
        this.manejarErrorApiClientes(error, "filtrar clientes por fecha");
      }
    },

    // 🔹 Método para manejar errores de API
    manejarErrorApiClientes(error, contexto = "") {
      console.error(`❌ Error en ${contexto || "operación"}:`, error);

      // 🔴 Caso 1: Error con respuesta del servidor
      if (error.response) {
        const status = error.response.status;

        switch (status) {
          case 400:
            this.mostrarMensaje(
              "⚠️ Solicitud incorrecta. Revisa los parámetros enviados.",
              "warning",
            );
            break;
          case 401:
            this.mostrarMensaje(
              "🚫 No autorizado. Inicia sesión nuevamente.",
              "error",
            );
            break;
          case 403:
            this.mostrarMensaje(
              "🔒 Acceso denegado. No tienes permisos para esta acción.",
              "error",
            );
            break;
          case 404:
            this.mostrarMensaje(
              "⚠️ Recurso no encontrado en el servidor.",
              "warning",
            );
            break;
          case 409:
            this.mostrarMensaje(
              "⚠️ Conflicto con el recurso. Puede estar siendo utilizado.",
              "warning",
            );
            break;
          case 500:
            this.mostrarMensaje(
              "💥 Error interno en el servidor. Inténtalo más tarde.",
              "error",
            );
            break;
          default:
            this.mostrarMensaje(
              `⚠️ ${error.response?.data?.message || "Error desconocido en el servidor."}`,
              "error",
            );
        }

        // 🌐 Caso 2: No hay conexión o CORS bloqueado
      } else if (error.request) {
        this.mostrarMensaje(
          "🌐 No se pudo conectar con el servidor. Verifica tu conexión.",
          "error",
        );

        // ⚙️ Caso 3: Error inesperado en frontend
      } else {
        this.mostrarMensaje(`⚠️ Error inesperado: ${error.message}`, "error");
      }
    },
  },
};
</script>

<style scoped>
.registro-cliente-wrapper {
  display: flex;
}

.cliente-container {
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

.cliente-container.expanded {
  left: 220px;
}

.titulo {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
  margin-top: -10px; /* espacio desde arriba */
}

.buscar-label {
  display: block; /* para que respete el margen como línea */
  margin-top: -20px; /* sube el texto hacia arriba */
  font-weight: bold;
}

.mensaje {
  padding: 12px 18px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-weight: bold;
  text-align: center;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
}

.mensaje.success {
  background: #2ecc71;
  color: #0b2e13;
}

.mensaje.warning {
  background: #f1c40f;
  color: #333;
}

.mensaje.error {
  background: #e74c3c;
  color: #2b0500;
}

.form-filtro {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center; /* o center según prefieras */
  gap: 4px; /* espacio entre el texto y los inputs/botones */
  margin-top: 20px; /* espacio arriba del bloque */
  margin-bottom: 12px; /* espacio debajo del bloque */
}

input {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

select {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.buscar-btn {
  padding: 6px 12px;
  border-radius: 6px;
  background: #0077b6;
  color: white;
  border: none;
  cursor: pointer;
  margin-left: 4px;
  font-weight: 600;
}

.buscar-btn:hover {
  background: #049670;
}

.buscar-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.buscar-btn:not(:disabled):hover {
  background: #005f8a;
}

.limpiar-btn {
  padding: 6px 12px;
  border-radius: 6px;
  background: #f4a261;
  color: #1a1a1a;
  border: none;
  cursor: pointer;
  margin-left: 4px;
  font-weight: 600;
}

.limpiar-btn:hover {
  background: #049670;
}

.limpiar-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.limpiar-btn:not(:disabled):hover {
  background: #e76f51;
}

.registrar-btn {
  padding: 6px 12px;
  border-radius: 6px;
  background: #0077b6;
  color: white;
  border: none;
  cursor: pointer;
  margin-left: 4px;
  font-weight: 600;
}

.registrar-btn:hover {
  background: #005f8a;
}

.update-btn {
  padding: 6px 8px;
  border-radius: 6px;
  background: #f4a261;
  color: #2b2b2b;
  border: none;
  cursor: pointer;
  margin-right: 4px;
}

.update-btn:hover {
  background: #e76f51;
}

.delete-btn {
  padding: 6px 8px;
  border-radius: 6px;
  background: #e63946;
  color: #0a0a0a;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.delete-btn:hover {
  background: #c5303b;
}

.clientes-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.clientes-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  background: white;
}

.clientes-table th {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  background: white;
}

.empty-row {
  text-align: center;
  padding: 18px;
  color: #666;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 20px 30px;
  border-radius: 8px;
  text-align: center;
  min-width: 300px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.25);
}

.modal-buttons {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.btn-yes {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  background: #c92a2a;
  color: white;
}

.btn-yes:hover {
  background: #a12222;
}

.btn-no {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  background: #06d6a0;
  color: #1c1c1c;
}

.btn-no:hover {
  background: #049670;
}
</style>
