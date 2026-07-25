<!-- src/components/proveedores/ProveedoresView.vue -->

<template>
  <div class="registro-proveedor-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="handleMenuToggle" />

    <!-- Contenido principal -->
    <div :class="['proveedor-container', { expanded: menuOpen }]">
      <h1 class="titulo">Proveedores</h1>

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
              ⚠️ ¿Está seguro de eliminar al proveedor
              {{ modalEliminar.proveedor.nombre }}?
            </p>
            <div class="modal-buttons">
              <button
                class="btn-yes"
                @click="eliminarProveedor(modalEliminar.idx)"
              >
                Sí
              </button>
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
            <option value="codigoSucursal">Código Sucursal</option>
            <option value="nombre">Nombre</option>
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
            @click="filtrarProveedores"
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
          <button type="button" class="registrar-btn" @click="agregarProveedor">
            ➕ Registrar Proveedor
          </button>
        </div>
      </div>

      <!-- Tabla proveedores -->
      <table class="proveedores-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>CÓDIGO SUCURSAL</th>
            <th>NOMBRE</th>
            <th>TELÉFONO</th>
            <th>DIRECCIÓN</th>
            <th>CORREO</th>
            <th>FECHA CREACIÓN</th>
            <th>FECHA ACTUALIZACIÓN</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, idx) in proveedoresFiltrados" :key="idx">
            <td>{{ idx + 1 }}</td>
            <td>{{ p.codigoSucursal }}</td>
            <td>{{ p.nombre }}</td>
            <td>{{ p.telefono }}</td>
            <td>{{ p.direccion }}</td>
            <td>{{ p.correo }}</td>
            <td>{{ p.fechaCreacion }}</td>
            <!-- ⏰ Fecha de registro -->
            <td>{{ p.fechaActualizacion }}</td>
            <!-- ⏰ Fecha actualización, inicialmente vacía -->
            <td>
              <!-- ✏️ Botón de editar -->
              <button
                class="update-btn"
                title="Editar"
                @click="abrirActualizarProveedor(p)"
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
          <tr v-if="proveedoresFiltrados.length === 0">
            <td colspan="9" class="empty-row">
              No hay proveedores registrados.
            </td>
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
  listarProveedores,
  buscarProveedorPorCodigoSucursal,
  buscarProveedorPorNombre,
  buscarProveedorPorFechaCreacion,
  eliminarProveedorPorCodigoSucursal,
} from "@/services/apiSuppliersService.js";

export default {
  name: "ProveedoresView",
  components: { DashboardSideMenu, DateRangePicker },
  data() {
    return {
      menuOpen: localStorage.getItem("menuPinned") === "true", // Siempre arranca expandido y false arranca oculto
      proveedorForm: {
        codigoSucursal: "",
        nombre: "",
        telefono: "",
        direccion: "",
        correo: "",
      },
      proveedores: [],
      proveedoresFiltrados: [],
      mensaje: "",
      mensajeTipo: "",
      busqueda: "",
      tipoBusqueda: "",
      fechaRango: { fechaInicio: "", fechaFin: "" },
      modalEliminar: {
        visible: false,
        idx: null,
        proveedor: {},
      },
    };
  },
  mounted() {
    // 🔹 Cargar todos los proveedores desde backend al iniciar
    this.cargarProveedores();
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

    // 🔹 Método de cargar proveedores
    async cargarProveedores() {
      try {
        const response = await listarProveedores();

        // 🟡 Caso 1: No hay proveedores (HTTP 204)
        if (response.status === 204) {
          this.proveedores = [];
          this.proveedoresFiltrados = [];
          this.mostrarMensaje(
            "⚠️ No se encontraron proveedores en el sistema.",
            "warning",
          );
          return;
        }

        // 🟢 Caso 2: Proveedores cargados exitosamente
        this.proveedores = response.data;
        this.proveedoresFiltrados = [...this.proveedores];

        this.mostrarMensaje(
          `✅ ${this.proveedores.length} proveedor${this.proveedores.length === 1 ? "" : "es"} cargado${this.proveedores.length === 1 ? "" : "s"} correctamente.`,
          "success",
        );
      } catch (error) {
        this.manejarErrorApiProveedores(error, "cargar proveedores");
      }
    },

    // 🔹 Método para llamar al componente de agregar proveedor
    async agregarProveedor(proveedor) {
      this.$router.push({
        name: "RegistroProveedorView",
        state: { proveedor },
      });
    },

    // 🔹 Método para llamar al componente de actualizar proveedor
    abrirActualizarProveedor(proveedor) {
      this.$router.push({
        name: "ActualizarProveedorView",
        params: {
          codigoSucursal: proveedor.codigoSucursal,
        },
      });
    },

    // 🔹 Método para eliminar producto
    async eliminarProveedor(idx) {
      const proveedor = this.proveedores[idx];

      try {
        await eliminarProveedorPorCodigoSucursal(proveedor.codigoSucursal);

        // ✅ Eliminamos solo si backend respondió bien
        this.proveedores.splice(idx, 1);
        this.proveedoresFiltrados = [...this.proveedores];

        this.mostrarMensaje(
          `🗑️ Proveedor ${proveedor.nombre} eliminado.`,
          "success",
        );
      } catch (error) {
        this.manejarErrorApiProveedores(
          error,
          `eliminar proveedor ${proveedor.nombre}`,
        );
      } finally {
        // 🧹 Siempre cerramos el modal de confirmación
        this.modalEliminar.visible = false;
      }
    },

    // 🔹 Método para filtrar proveedores según el tipo de búsqueda
    async filtrarProveedores() {
      // Caso especial: busqueda por fecha
      if (this.tipoBusqueda === "fechaCreacion") {
        return this.filtrarProveedoresPorFecha();
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
          case "codigoSucursal":
            response = await buscarProveedorPorCodigoSucursal(termino);
            break;
          case "nombre":
            response = await buscarProveedorPorNombre(termino);
            break;
          default:
            this.mostrarMensaje("⚠️ Tipo de búsqueda no válido.", "error");
            return;
        }

        console.log("📦 Respuesta del backend:", response);

        // ✅ Proveedor(es) no encontrado(s)
        if (response.status === 204) {
          this.proveedoresFiltrados = [];
          this.mostrarMensaje(
            `❌ No se encontraron proveedores con ${this.tipoBusqueda}: ${termino}`,
            "warning",
          );
          return;
        }

        // ✅ Proveedor(es) encontrado(s)
        if (response.data) {
          if (Array.isArray(response.data)) {
            this.proveedoresFiltrados = response.data;
          } else {
            this.proveedoresFiltrados = [response.data];
          }
          this.mostrarMensaje(
            `✅ Proveedor${Array.isArray(response.data) && response.data.length > 1 ? "es" : ""} encontrado${Array.isArray(response.data) && response.data.length > 1 ? "s" : ""} correctamente.`,
            "success",
          );
          return;
        }

        // ⚠️ Caso defensivo (nunca debería entrar aquí)
        this.proveedoresFiltrados = [];
        this.mostrarMensaje(
          `❌ No se encontraron proveedores con ${this.tipoBusqueda}: ${termino}`,
          "warning",
        );
      } catch (error) {
        this.manejarErrorApiProveedores(
          error,
          `filtrar proveedores por ${this.tipoBusqueda}`,
        );
      }
    },

    // 🔹 Método para abrir modal en vez de window.confirm
    confirmarEliminar(idx) {
      this.modalEliminar.idx = idx;
      this.modalEliminar.proveedor = this.proveedores[idx];
      this.modalEliminar.visible = true;
    },

    // 🔹 Método para saber si hay datos en el cuadro de filtro
    hayDatosFiltro() {
      return this.busqueda.trim().length > 0;
    },

    // 🔹 Método para saber si hay datos en el formulario
    hayDatos() {
      return (
        this.proveedorForm.codigoSucursal ||
        this.proveedorForm.nombre ||
        this.proveedorForm.telefono ||
        this.proveedorForm.direccion ||
        this.proveedorForm.correo
      );
    },

    // 🔹 Método de limpiar campos del formulario
    limpiarCampos() {
      this.proveedorForm = {
        codigoSucursal: "",
        nombre: "",
        telefono: "",
        direccion: "",
        correo: "",
      };
    },

    // 🔹 Método para limpiar búsqueda
    limpiarBusqueda() {
      this.busqueda = "";
      this.tipoBusqueda = ""; // 🔹 Resetea la opción del selector
      this.fechaRango = { fechaInicio: "", fechaFin: "" };
      this.cargarProveedores(); // 🔹 Vuelve a cargar todos los proveedores
    },

    // 🔹 Callback del DateRangePicker
    onFechaRangoAplicar(rango) {
      this.fechaRango = rango;
      // Auto-buscar al aplicar el rango
      this.filtrarProveedoresPorFecha();
    },

    // 🔹 Metodo para filtrar proveedores por rango de fecha de creacion
    async filtrarProveedoresPorFecha() {
      try {
        const inicio = this.fechaRango.fechaInicio;
        const fin = this.fechaRango.fechaFin;

        if (!inicio || !fin) {
          this.mostrarMensaje("⚠️ Seleccione un rango de fechas.", "error");
          return;
        }

        const response = await buscarProveedorPorFechaCreacion(inicio, fin);

        if (response.status === 204) {
          this.proveedoresFiltrados = [];
          this.mostrarMensaje(
            "❌ No se encontraron proveedores en el rango de fechas seleccionado.",
            "warning",
          );
          return;
        }

        if (response.data) {
          this.proveedoresFiltrados = Array.isArray(response.data)
            ? response.data
            : [response.data];
          this.mostrarMensaje(
            "✅ " +
              this.proveedoresFiltrados.length +
              " proveedor(es) encontrado(s) en el rango de fechas.",
            "success",
          );
        }
      } catch (error) {
        this.manejarErrorApiProveedores(error, "filtrar proveedores por fecha");
      }
    },

    // 🔹 Método para manejar errores de API
    manejarErrorApiProveedores(error, contexto = "") {
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

.proveedores-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.proveedores-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  background: white;
}

.proveedores-table th {
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
