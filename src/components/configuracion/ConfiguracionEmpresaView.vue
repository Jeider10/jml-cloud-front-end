<!-- src/components/configuracion/ConfiguracionEmpresaView.vue -->

<template>
  <div class="configuracion-empresa-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="menuOpen = $event" />

    <!-- Contenido principal -->
    <div :class="['main-content', { expanded: menuOpen }]">
      <h1 class="titulo">Datos de la Empresa</h1>

      <!-- 🟢 mensaje de confirmación visual -->
      <div v-if="mensaje" :class="['alerta', mensajeTipo]">
        {{ mensaje }}
      </div>

      <!-- 🔹 Contenedor fila: cuadro datos + botones al lado -->
      <div class="fila-contenedor">
        <!-- Bloque con datos -->
        <div class="datos-empresa">
          <div class="dato-row">
            <label>NIT:</label>
            <input type="text" v-model="empresa.nit" :disabled="modoActualizar || !modoEdicion" />
          </div>
          <div class="dato-row">
            <label>Nombre:</label>
            <input type="text" v-model="empresa.nombreEmpresa" :disabled="!modoEdicion" />
          </div>
          <div class="dato-row">
            <label>Dirección:</label>
            <input type="text" v-model="empresa.direccion" :disabled="!modoEdicion" />
          </div>
          <div class="dato-row">
            <label>Teléfono:</label>
            <input type="text" v-model="empresa.telefono" :disabled="!modoEdicion" />
          </div>
          <div class="dato-row">
            <label>Mensaje:</label>
            <input type="text" v-model="empresa.mensaje" :disabled="!modoEdicion" />
          </div>
          <div class="dato-row">
            <label>Ruta Logo:</label>
            <input type="text" v-model="empresa.logo" disabled />
          </div>
          <div class="dato-row" v-if="modoEdicion">
            <label>Logo:</label>
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
                    @click="mostrarConfirmacion = true">
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
      <div v-if="mostrarConfirmacion" class="modal-overlay">
        <div class="modal">
          <h3>⚠️ Confirmación</h3>
          <p>¿Deseas guardar los datos de la empresa?</p>
          <div class="modal-buttons">
            <button class="si-btn" @click="confirmarGuardar">Sí</button>
            <button class="no-btn" @click="mostrarConfirmacion = false">No</button>
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
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'
import { obtenerPrimeraEmpresa, registrarEmpresa, actualizarEmpresa, eliminarEmpresa } from '@/services/apiConfigEmpresaService'

export default {
  name: 'ConfiguracionEmpresaView',
  components: { DashboardSideMenu },

  data() {
    return {
      menuOpen: true, // Siempre arranca expandido y false arranca oculto
      modoRegistrar: false,
      modoActualizar: false,
      modoEdicion: false,
      mostrarConfirmacion: false,
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
      mensajeTipo: ''
    }
  },

  computed: {
    tieneTexto() {
      return Object.values(this.empresa).some(v => v && v.toString().trim() !== '')
    }
  },

  async mounted() {
    await this.cargarEmpresa()
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

    async cargarEmpresa() {
      try {
        console.log('🔍 Solicitando empresa registrada (si existe)...')
        const response = await obtenerPrimeraEmpresa()

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

        // ✅ Tomar el primer elemento de la lista
        const empresaData = response.data[0]
        console.log('✅ Empresa cargada correctamente:', empresaData)

        // Asignar datos al modelo de Vue
        this.empresa = {
          nit: empresaData.nit ?? '',
          nombreEmpresa: empresaData.nombreEmpresa ?? '',
          direccion: empresaData.direccion ?? '',
          telefono: empresaData.telefono ?? '',
          mensaje: empresaData.mensaje ?? '',
          logo: empresaData.logo ?? ''
        }

        console.log('✅ Empresa cargada correctamente:', this.empresa)

        // Ajustar modos
        this.modoRegistrar = false
        this.modoActualizar = true

      } catch (error) {
        console.error('❌ Error al cargar empresa:', error)
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

        this.mostrarConfirmacion = false
        this.modoEdicion = false
        this.archivoLogo = null

        // 🔄 Recargar datos actualizados desde backend
        await this.cargarEmpresa()

        // 📢 Nuevo: emitir evento global con la empresa actualizada
        window.dispatchEvent(new CustomEvent('empresaUpdated', { detail: this.empresa }))

        this.modoRegistrar = false
        this.modoActualizar = true

      } catch (error) {
        // alert(`❌ Error al guardar: ${error.message}`)
        this.mostrarMensaje(`❌ Error al guardar: ${error.message}`, 'error')
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
        window.dispatchEvent(new CustomEvent('empresaUpdated', { detail: null }))
      } catch (error) {
        console.error('❌ Error al eliminar empresa:', error)
        this.mostrarMensaje(`❌ Error al eliminar: ${error.message}`, 'error')
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
      const cleanPath = path.toString().trim().replace(/(^"|"$)/g, '')

      // 🔹 Si es una URL completa (S3, etc.), la usamos directamente
      if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://') || cleanPath.startsWith('data:')) {
        return cleanPath
      }

      // 🔹 Si es una ruta relativa, la completamos con el backend (solo para antiguos logos)
      return `${process.env.VUE_APP_AUTH_BASE_URL}${cleanPath}`
    },

    onLogoError(event) {
      // Si falla la carga, mostrar imagen por defecto
      event.target.src = require('@/assets/img/Empresa.png')
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
  min-height: 100vh;   /* ocupa siempre toda la altura de la ventana */
  top: 0;
  left: 60px;
  right: 0;
  padding: 20px;
  background-color: #6fffd4;
  transition: left 0.5s ease;

  display: flex;
  flex-direction: column;
  align-items: center;  /* centra horizontalmente los hijos, pero sin recortar el fondo */
  box-sizing: border-box; /* ✅ asegura que el padding no rompa el ancho */
  overflow-y: auto;       /* scroll solo si el contenido lo necesita */
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
  margin-bottom: 30px;
}

.logo-empresa {
  width: 400px;
  height: auto;
}

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.registrar-btn {
  padding: 12px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  background: #28a745;
  color: white;
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
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  background: #0077b6;
  color: white;
}

.actualizar-btn:hover {
  background: #005f8a;
}

.guardar-btn {
  padding: 12px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  background: #28a745;
  color: white;
}

.guardar-btn:disabled {
  background: #94d3a2;
  cursor: not-allowed;
}

.guardar-btn:not(:disabled):hover {
  background: #218838;
}

.limpiar-btn {
  padding: 12px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  background: #e74c3c;
  color: white;
}

.limpiar-btn:hover {
  background: #c0392b;
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

.modal-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: space-around;
}

.si-btn {
  background: #28a745;
  color: white;
  padding: 10px 18px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.no-btn {
  background: #e74c3c;
  color: white;
  padding: 10px 18px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.si-btn:hover {
  background: #218838;
}

.no-btn:hover {
  background: #c0392b;
}

.volver-btn {
  padding: 12px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  background: #6c757d;
  color: white;
}

.volver-btn:hover {
  background: #5a6268;
}

.eliminar-btn {
  padding: 12px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  background: #e63946;
  color: white;
}

.eliminar-btn:hover {
  background-color: #c1121f;
}

.alerta {
  position: sticky;
  top: 10px;
  z-index: 1000;
  margin: 0 auto 15px;
  width: 90%;
  max-width: 600px;
  text-align: center;
  padding: 10px 15px;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

/* Colores según tipo */
.alerta.success {
  background-color: #d4edda;
  color: #155724;
}

.alerta.error {
  background-color: #f8d7da;
  color: #721c24;
}
</style>
