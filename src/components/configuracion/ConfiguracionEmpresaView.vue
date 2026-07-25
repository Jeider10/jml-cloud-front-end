<!-- src/components/configuracion/ConfiguracionEmpresaView.vue -->

<template>
  <div class="configuracion-empresa-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="menuOpen = $event" />

    <!-- Contenido principal -->
    <div :class="['main-content', { expanded: menuOpen }]">
      <!-- 🔹 Loader centrado solo cuando está cargando -->
      <div v-if="loading" class="loading-state">
        <p>Cargando información de la empresa...</p>
        <div class="spinner"></div>
      </div>

      <!-- 🔹 Datos de la empresa (solo se muestran cuando ya cargó) -->
      <div v-else class="content-area">
        <h1 class="titulo">Datos de la Empresa</h1>

        <!-- 🔔 Mensaje visual -->
        <transition name="fade">
          <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
            {{ mensaje }}
          </div>
        </transition>

        <!-- 🔹 Contenedor fila: cuadro datos + botones al lado -->
        <div class="fila-contenedor">
          <!-- Bloque con datos -->
          <div class="datos-empresa">
            <div class="dato-row">
              <label for="nit">NIT</label>
              <input type="text" v-model="empresa.nit" :disabled="modoActualizar || !modoEdicion" />
            </div>

            <div class="dato-row">
              <label for="nombre">Nombre</label>
              <input type="text" v-model="empresa.nombreEmpresa" :disabled="!modoEdicion" />
            </div>

            <div class="dato-row">
              <label for="dirección">Dirección</label>
              <input type="text" v-model="empresa.direccion" :disabled="!modoEdicion" />
            </div>

            <div class="dato-row">
              <label for="teléfono">Teléfono</label>
              <input type="text" v-model="empresa.telefono" :disabled="!modoEdicion" />
            </div>

            <div class="dato-row">
              <label for="mensaje">Mensaje</label>
              <input type="text" v-model="empresa.mensaje" :disabled="!modoEdicion" />
            </div>

            <div class="dato-row">
              <label for="rutaLogo">Ruta Logo</label>
              <input type="text" v-model="empresa.logo" disabled />
            </div>

            <div class="dato-row" v-if="modoEdicion">
              <label for="logo">Logo</label>
              <input type="file" accept="image/*" @change="onImageChange" />
            </div>
          </div>

          <!-- 🔹 Acciones -->
          <div class="acciones-lateral">
            <!-- Si no hay empresa, mostrar botón Registrar -->
            <!-- ✏️ Botón de Registrar -->
            <button v-if="modoRegistrar && !modoEdicion"
                    type="button"
                    class="registrar-btn"
                    @click="activarEdicion">
              🆕 Registrar
            </button>

            <!-- Si hay empresa, mostrar botón Actualizar -->
            <!-- ✏️ Botón de Actualizar -->
            <button v-if="modoActualizar && !modoEdicion"
                    type="button"
                    class="actualizar-btn"
                    @click="activarEdicion">
              ✏️ Actualizar
            </button>

            <!-- Modo edición: mostrar guardar/limpiar/volver -->
            <!-- 💾 Botón de Guardar -->
            <div v-if="modoEdicion" class="btn-group">
              <button type="button"
                      class="guardar-btn"
                      :disabled="!tieneTexto"
                      @click="mostrarConfirmacionGuardar = true">
                💾 Guardar
              </button>

              <!-- 🧹 Botón de Limpiar -->
              <button type="button"
                      class="limpiar-btn"
                      @click="limpiar">
                🧹 Limpiar
              </button>

              <!-- 🔙 Botón de Volver -->
              <button type="button"
                      class="volver-btn"
                      @click="cancelarEdicion">
                🔙 Volver
              </button>

              <!-- 🗑️ Botón de Eliminar -->
              <button type="button"
                      v-if="modoActualizar"
                      class="eliminar-btn"
                      @click="mostrarConfirmacionEliminar = true">
                🗑️ Eliminar
              </button>
            </div>
          </div>
        </div>

        <!-- Logo grande -->
        <div class="logo-container">
          <img
              :src="getLogoUrl(empresa.logo)"
              alt="Logo Empresa"
              class="logo-empresa"
              @error="onLogoError"
          />
        </div>

        <!-- Modal de confirmación -->
        <div v-if="mostrarConfirmacionGuardar" class="modal-overlay">
          <div class="modal">
            <h3>⚠️ Confirmación</h3>
            <p>¿Deseas guardar los datos de la empresa?</p>
            <div class="modal-buttons">
              <button class="si-btn" @click="confirmarGuardar">Sí</button>
              <button class="no-btn" @click="mostrarConfirmacionGuardar = false">No</button>
            </div>
          </div>
        </div>

        <!-- Modal de confirmación para eliminar -->
        <div v-if="mostrarConfirmacionEliminar" class="modal-overlay">
          <div class="modal">
            <h3>⚠️ Confirmación</h3>
            <p>¿Seguro que deseas eliminar esta empresa?</p>
            <div class="modal-buttons">
              <button class="si-btn" @click="confirmarEliminar">Sí</button>
              <button class="no-btn" @click="mostrarConfirmacionEliminar = false">No</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <FooterCredits />
    </div>
  </div>
</template>


<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'
import FooterCredits from '@/components/common/FooterCredits.vue'
import { obtenerPrimeraEmpresa, registrarEmpresa, actualizarEmpresa, eliminarEmpresa } from '@/services/apiConfigEmpresaService'

export default {
  name: 'ConfiguracionEmpresaView',
  components: { DashboardSideMenu, FooterCredits },

  data() {
    return {
      menuOpen: localStorage.getItem('menuPinned') === 'true', // Siempre arranca expandido y false arranca oculto
      modoRegistrar: false,
      modoActualizar: false,
      modoEdicion: false,
      mostrarConfirmacionGuardar: false,
      mostrarConfirmacionEliminar: false,
      empresa: {
        nit: '',
        nombreEmpresa: '',
        direccion: '',
        telefono: '',
        mensaje: '',
        logo: ''
      },
      archivoLogo: null,
      mensaje: '',
      mensajeTipo: '',
      loading: true
    }
  },

  computed: {
    tieneTexto() {
      return Object.values(this.empresa).some(v => v && v.toString().trim() !== '')
    }
  },

  async mounted() {
    this.loading = true
    await this.cargarEmpresa()
    this.loading = false
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

    // 🔹 Método para cargar la empresa registrada.
    async cargarEmpresa() {
      try {
        console.log('🔍 Solicitando empresa registrada (desde la base de datos)...')
        const response = await obtenerPrimeraEmpresa()
        console.log('🔍 Respuesta de la base de datos:', response)

        // Validar si la respuesta viene vacía o no contiene elementos
        if (!response || !response.data || response.data.length === 0) {
          console.warn('⚠️ No hay empresa registrada.')

          this.modoRegistrar = true
          this.modoActualizar = false
          this.empresa = {
            nit: '',
            nombreEmpresa: '',
            direccion: '',
            telefono: '',
            mensaje: '',
            logo: ''
          }
          return
        }

        // ✅ Tomar la empresa y asignarla al modelo
        const empresaData = response.data[0]

        // Asignar datos al modelo de Vue
        this.empresa = {
          nit: empresaData.nit ?? '',
          nombreEmpresa: empresaData.nombreEmpresa ?? '',
          direccion: empresaData.direccion ?? '',
          telefono: empresaData.telefono ?? '',
          mensaje: empresaData.mensaje ?? '',
          logo: empresaData.logo ?? ''
        }

        console.log('✅ Empresa cargada correctamente desde base:', empresaData)

        // Ajustar modos
        this.modoRegistrar = false
        this.modoActualizar = true

      } catch (error) {
        this.manejarErrorConfigEmpresa(error, `Cargar empresa`)
        this.modoRegistrar = true
        this.modoActualizar = false
      }
    },

    async confirmarGuardar() {
      try {
        if (this.modoRegistrar) {
          console.log('🆕 Registrando empresa:', this.empresa)
          await registrarEmpresa(this.empresa, this.archivoLogo)
          // alert('✅ Empresa registrada correctamente.')
          this.mostrarMensaje(`✅ Empresa registrada correctamente.`, 'success')
        } else {
          console.log('✏️ Actualizando empresa:', this.empresa)
          await actualizarEmpresa(this.empresa, this.archivoLogo)
          // alert('✅ Empresa actualizada correctamente.')
          this.mostrarMensaje(`✅ Empresa actualizada correctamente.`, 'success')
        }

        this.mostrarConfirmacionGuardar = false
        this.modoEdicion = false
        this.archivoLogo = null

        // 🔄 Recargar datos actualizados desde backend
        await this.cargarEmpresa()

        // 📢 Nuevo: emitir evento global con la empresa actualizada
        globalThis.dispatchEvent(new CustomEvent('empresaUpdated', { detail: this.empresa }))

        this.modoRegistrar = false
        this.modoActualizar = true

      } catch (error) {
        this.manejarErrorConfigEmpresa(error, `Guardar empresa`)
        this.mostrarConfirmacionGuardar = false
      }
    },

    async confirmarEliminar() {
      try {
        console.log('🗑️ Eliminando empresa con NIT:', this.empresa.nit)
        await eliminarEmpresa(this.empresa.nit)
        this.mostrarMensaje('✅ Empresa eliminada correctamente.', 'success')

        // Reset de datos y estados
        this.mostrarConfirmacionEliminar = false
        this.modoActualizar = false
        this.modoRegistrar = true
        this.modoEdicion = false
        this.limpiar()

        // Actualizar vista y emitir evento global
        globalThis.dispatchEvent(new CustomEvent('empresaUpdated', { detail: null }))
      } catch (error) {
        this.manejarErrorConfigEmpresa(error, `Eliminar empresa`)
        this.mostrarConfirmacionEliminar = false
      }
    },

    activarEdicion() {
      this.modoEdicion = true
    },

    limpiar() {
      this.empresa = {
        nit: '',
        nombreEmpresa: '',
        direccion: '',
        telefono: '',
        mensaje: '',
        logo: ''
      }
      this.archivoLogo = null
    },

    cancelarEdicion() {
      this.modoEdicion = false
      this.cargarEmpresa()
    },

    onImageChange(event) {
      const file = event.target.files[0]
      if (file) {
        // 🔹 Tamaño máximo permitido (10 MB, igual que en backend)
        const MAX_SIZE_BYTES = 10 * 1024 * 1024

        if (file.size > MAX_SIZE_BYTES) {
          const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
          const maxMB = (MAX_SIZE_BYTES / (1024 * 1024)).toFixed(2)
          this.mostrarMensaje(`❌ La imagen supera el tamaño permitido (${sizeMB} MB > ${maxMB} MB)`, 'error')

          // Limpiar archivo seleccionado para evitar envío
          this.archivoLogo = null
          this.empresa.logo = ''

          return
        }

        this.archivoLogo = file
        const reader = new FileReader()
        reader.onload = e => {
          // Mostrar vista previa del logo nuevo (base64)
          this.empresa.logo = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },

    // 🔧 Ajuste importante: limpieza de espacios/comillas + soporte total S3
    getLogoUrl(path) {
      if (!path) {
        // Si no hay logo, muestra imagen por defecto
        return require('@/assets/img/Empresa.png')
      }

      // 🔹 Limpiar comillas o espacios
      const cleanPath = path.toString().trim().replaceAll(/(^"|"$)/g, '')

      // 🔹 Si es una URL completa (S3 u otra), úsala directamente
      if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
        return cleanPath
      }

      // 🔹 Si ya viene con formato data:image/... (Base64 con prefijo)
      if (cleanPath.startsWith('data:image')) {
        return cleanPath
      }

      // 🔹 Si es Base64 puro (sin prefijo), agregamos el tipo MIME más común (png)
      if (/^[A-Za-z0-9+/=]+$/.test(cleanPath)) {
        return `data:image/png;base64,${cleanPath}`
      }

      // 🔹 Si es una ruta relativa (casos antiguos o locales)
      return `${process.env.VUE_APP_AUTH_BASE_URL}${cleanPath}`
    },

    onLogoError(event) {
      // Si falla la carga, mostrar imagen por defecto
      event.target.src = require('@/assets/img/Empresa.png')
    },

    // 🔹 Método para manejar errores de API
    manejarErrorConfigEmpresa(error, contexto = '') {
      console.error(`❌ Error en ${contexto || 'operación'}:`, error)

      // 🔴 Caso 1: Error con respuesta del servidor
      if (error.response) {
        const status = error.response.status

        switch (status) {
          case 400:
            this.mostrarMensaje('⚠️ Solicitud incorrecta. Revisa los parámetros enviados.', 'warning')
            break
          case 401:
            this.mostrarMensaje('🚫 No autorizado. Inicia sesión nuevamente.', 'error')
            break
          case 403:
            this.mostrarMensaje('🔒 Acceso denegado. No tienes permisos para esta acción.', 'error')
            break
          case 404:
            this.mostrarMensaje('⚠️ Recurso no encontrado en el servidor.', 'warning')
            break
          case 409:
            this.mostrarMensaje('⚠️ Conflicto con el recurso. Puede estar siendo utilizado.', 'warning')
            break
          case 500:
            this.mostrarMensaje('💥 Error interno en el servidor. Inténtalo más tarde.', 'error')
            break
          default:
            this.mostrarMensaje(`⚠️ ${error.response?.data?.message || 'Error desconocido en el servidor.'}`, 'error')
        }

        // 🌐 Caso 2: No hay conexión o CORS bloqueado
      } else if (error.request) {
        this.mostrarMensaje('🌐 No se pudo conectar con el servidor. Verifica tu conexión.', 'error')

        // ⚙️ Caso 3: Error inesperado en frontend
      } else {
        this.mostrarMensaje(`⚠️ Error inesperado: ${error.message}`, 'error')
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
  padding: 20px 20px 0 20px; /* sin padding abajo para que el footer quede pegado al borde */
  background-color: #6fffd4;
  overflow-y: auto;       /* scroll solo si el contenido lo necesita */
  transition: left 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;  /* centra horizontalmente los hijos */
  box-sizing: border-box; /* ✅ asegura que el padding no rompa el ancho */
}

.main-content.expanded {
  left: 220px;
}

.titulo {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
  margin-top: -10px;    /* espacio desde arriba */
}

.mensaje {
  padding: 12px 18px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-weight: bold;
  text-align: center;
  box-shadow: 0px 4px 8px rgba(0,0,0,0.15);
  position: sticky;
  top: 10px;
  z-index: 1000;
  width: 90%;
  max-width: 600px;
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

.registrar-btn {
  padding: 12px 20px;
  border-radius: 6px;
  background: #218838;
  color: white;
  border: none;
  cursor: pointer;
  margin-left: 4px;
  font-weight: 600;
  font-size: 1rem;
}

.registrar-btn:disabled {
  background: #94d3a2;
  cursor: not-allowed;
}

.registrar-btn:hover {
  background: #51b568;
}

.actualizar-btn {
  padding: 12px 20px;
  border-radius: 6px;
  background: #0077b6;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;
  margin-right: 4px;
  font-size: 1rem;
}

.actualizar-btn:hover {
  background: #005f8a;
}

.guardar-btn {
  padding: 12px 20px;
  border-radius: 6px;
  background: #1e7e34;
  color: #fff;
  border: none;
  cursor: pointer;
  font-weight: 600;
  margin-right: 4px;
  font-size: 1rem;
}

.guardar-btn:hover {
  background: #2ecc71;
}

.guardar-btn:disabled {
  background: #94d3a2;
  cursor: not-allowed;
}

.guardar-btn:not(:disabled):hover {
  background: #155d27;
}

.limpiar-btn {
  padding: 12px 20px;
  border-radius: 6px;
  background: #e74c3c;
  color: #1a1a1a;
  border: none;
  cursor: pointer;
  font-weight: 600;
  margin-right: 4px;
  font-size: 1rem;
}

.limpiar-btn:hover {
  background: #c0392b;
}

.modal-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: space-around;
}

.si-btn {
  padding: 10px 18px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  background: #c92a2a;
  color: white;
}

.si-btn:hover {
  background: #218838;
}

.no-btn {
  padding: 10px 18px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  background: #06d6a0;
  color: #1c1c1c;
}

.no-btn:hover {
  background: #c0392b;
}

.volver-btn {
  padding: 12px 20px;
  border-radius: 6px;
  background: #6c757d;
  color: white;
  border: none;
  cursor: pointer;
  margin-left: 4px;
  font-weight: 600;
  font-size: 1rem;
}

.volver-btn:hover {
  background: #5a6268;
}

.eliminar-btn {
  padding: 12px 20px;
  border-radius: 6px;
  background: #e63946;
  color: #0a0a0a;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
}

.eliminar-btn:hover {
  background-color: #c1121f;
}

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Loader */
.loading-state {
  text-align: center;
  padding-top: 100px;
  font-size: 1.2em;
  color: #333;
}

.spinner {
  margin: 20px auto;
  width: 60px;
  height: 60px;
  border: 6px solid rgba(0, 0, 0, 0.1);
  border-top-color: #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 🔹 Contenedor fila: cuadro + botones */
.fila-contenedor {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 30px;
  width: 100%;
  max-width: 900px;
}

.datos-empresa {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0,0,0,0.15);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.dato-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dato-row input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #f9f9f9;
  color: #333;
}

.dato-row input:disabled {
  background-color: #eee;
  color: #666;
}

/* 🔹 Botones afuera */
.acciones-lateral {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 15px;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.logo-empresa {
  width: 400px;
  height: auto;
}

/* Estilos del modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0,0,0,0.25);
  width: 400px;
  text-align: center;
}

.modal h3 {
  margin-bottom: 10px;
}

/* Footer */
.page-footer {
  margin-top: auto; /* empuja el footer hacia abajo */
  text-align: center;
  font-size: 0.9rem;
  color: #333;
  opacity: 0.8;
}

.content-area {
  flex: 1; /* ocupa el espacio disponible, empuja el footer al fondo */
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
