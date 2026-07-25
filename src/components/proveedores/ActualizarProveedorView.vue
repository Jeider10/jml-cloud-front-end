<!-- src/components/proveedores/ActualizarProveedorView.vue -->

<template>
  <div class="registro-proveedor-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="handleMenuToggle" />

    <!-- Contenido principal -->
    <div :class="['proveedor-container', { expanded: menuOpen }]">
      <h1 class="titulo">Actualizar Proveedor</h1>

      <!-- 🔔 Mensaje visual -->
      <transition name="fade">
        <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
          {{ mensaje }}
        </div>
      </transition>

      <!-- Formulario proveedor -->
      <div class="form-container">
        <div class="form-row">
          <label for="codigoSucursal">Código Sucursal</label>
          <input v-model="proveedorForm.codigoSucursal" type="text" disabled />

          <label for="nombre">Nombre</label>
          <input v-model="proveedorForm.nombre" type="text" />

          <label for="teléfono">Teléfono</label>
          <input v-model="proveedorForm.telefono" type="text" />

          <label for="dirección">Dirección</label>
          <input v-model="proveedorForm.direccion" type="text" />

          <label for="correo">Correo</label>
          <input v-model="proveedorForm.correo" type="text" />

          <!-- 💾 Botón de actualizar -->
          <button
            type="button"
            class="actualizar-btn"
            @click="actualizarProveedor"
          >
            💾 Actualizar
          </button>

          <!-- ↩️ Botón de volver -->
          <button type="button" class="volver-btn" @click="volverProveedores">
            ↩️ Volver
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from "@/views/dashboard/DashboardSideMenu.vue";
import {
  actualizarProveedor,
  buscarProveedorPorCodigoSucursal,
} from "@/services/apiSuppliersService.js";

export default {
  name: "ActualizarProveedorView",
  components: { DashboardSideMenu },
  props: ["codigoSucursal"],
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
      mensaje: "",
      mensajeTipo: "",
    };
  },

  async mounted() {
    // 🔹 Cargar proveedor específico desde backend por codigoSucursal
    await this.cargarProveedor();
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

        // 🔹 Solo redirige si es un mensaje de éxito
        if (tipo === "success") {
          this.$router.push({ name: "ProveedoresView" });
        }
      }, 3000);
    },

    // 🔹 Método de agregar un proveedor por códigoSucursal
    async cargarProveedor() {
      try {
        const response = await buscarProveedorPorCodigoSucursal(
          this.codigoSucursal,
        );
        if (response.data) {
          this.proveedorForm = { ...response.data }; // ✅ llena el form directamente
          this.mostrarMensaje(
            `✅ Proveedor ${this.proveedorForm.nombre} cargado correctamente.`,
            "info",
          );
        } else {
          this.mostrarMensaje(
            "⚠️ No se encontraron datos del proveedor.",
            "warning",
          );
        }
      } catch (error) {
        this.manejarErrorApiProveedorActualizar(
          error,
          `buscar proveedor con código de sucursal ${this.codigoSucursal}`,
        );
      }
    },

    // 🔹 Método para actualizar proveedor en backend
    async actualizarProveedor() {
      if (
        !this.proveedorForm.codigoSucursal ||
        !this.proveedorForm.nombre ||
        !this.proveedorForm.telefono ||
        !this.proveedorForm.direccion ||
        !this.proveedorForm.correo
      ) {
        this.mostrarMensaje(
          "Código sucursal, nombre, teléfono, dirección y correo son obligatorios.",
          "error",
        );
        return;
      }

      try {
        const response = await actualizarProveedor(this.proveedorForm);
        const actualizado = response.data;

        this.mostrarMensaje(
          `✅ Proveedor ${actualizado.nombre} actualizado correctamente.`,
          "success",
        );
      } catch (error) {
        this.manejarErrorApiProveedorActualizar(
          error,
          `actualizar proveedor ${this.proveedorForm.nombre}`,
        );
      }
    },

    // 🔹 Método para volver a registro de proveedores
    volverProveedores() {
      this.$router.push({ name: "ProveedoresView" });
    },

    // 🔹 Método para manejar errores de API
    manejarErrorApiProveedorActualizar(error, contexto = "") {
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
  margin-top: 1px; /* espacio desde arriba */
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

.mensaje.info {
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

.form-container {
  margin-bottom: 20px;
}

label {
  font-weight: bold;
}

input {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.actualizar-btn {
  padding: 6px 12px;
  border-radius: 6px;
  background: #0077b6;
  color: white;
  border: none;
  cursor: pointer;
  margin-left: 4px;
  font-weight: 600;
}

.actualizar-btn:hover {
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

.form-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
</style>
