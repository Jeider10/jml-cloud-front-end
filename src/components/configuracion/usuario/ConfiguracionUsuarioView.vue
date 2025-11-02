<!-- src/components/configuracion/usuario/ConfiguracionUsuarioView.vue -->

<template>
  <div class="configuracion-empresa-wrapper">
    <DashboardSideMenu @menu-toggle="menuOpen = $event" />
    <div :class="['main-content', { expanded: menuOpen }]">
      <h1 class="titulo">Configuración de Usuario</h1>

      <!-- 🔔 Mensaje visual -->
      <transition name="fade">
        <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
          {{ mensaje }}
        </div>
      </transition>

      <!-- 🧾 Contenedor general de datos + botón -->
      <div class="datos-container">
        <!-- 📄 Cuadro blanco con datos -->
        <div class="card">
          <div class="campo">
            <label>Identificación:</label>
            <input type="text" v-model="usuario.identificacion" readonly />
          </div>

          <div class="campo">
            <label>Nombre de Usuario:</label>
            <input
              type="text"
              :value="`${usuario.nombres} ${usuario.apellidos}`.trim() || usuario.userName"
              readonly
            />
          </div>

          <div class="campo">
            <label>Email:</label>
            <input type="text" v-model="usuario.email" readonly />
          </div>

          <div class="campo">
            <label>Teléfono:</label>
            <input type="text" v-model="usuario.telefono" readonly />
          </div>

          <div class="campo">
            <label>Dirección:</label>
            <input type="text" v-model="usuario.direccion" readonly />
          </div>

          <div class="campo">
            <label>Fecha de Creación:</label>
            <input type="text" v-model="usuario.fechaCreacion" readonly />
          </div>

          <div class="campo">
            <label>Última Actualización:</label>
            <input type="text" v-model="usuario.fechaActualizacion" readonly />
          </div>
        </div>

        <!-- 📘 Botón de actualización -->
        <div class="boton-container">
          <button class="btn-actualizar" @click="abrirConfirmacionActualizar">
            ✏️ Actualizar
          </button>
        </div>
      </div>

      <!-- Modal de confirmación para actualización -->
      <div v-if="mostrarConfirmacionActualizar" class="modal-overlay">
        <div class="modal">
          <h3>⚠️ Confirmación</h3>
          <p>¿Deseas actualizar los datos de tu usuario?</p>
          <div class="modal-buttons">
            <button class="si-btn" @click="confirmarActualizar">Sí</button>
            <button class="no-btn" @click="cerrarModalActualizar">No</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'
import { obtenerUsuarioActual, buscarUsuarioPorUserName } from '@/services/apiConfigEmpresaUsuariosService'

export default {
  name: 'ConfiguracionUsuarioView',
  components: { DashboardSideMenu },
  data() {
    return {
      menuOpen: true,
      usuario: {
        identificacion: '',
        userName: '',
        email: '',
        telefono: '',
        direccion: '',
        fechaCreacion: '',
        fechaActualizacion: ''
      },
      mostrarConfirmacionActualizar: false,
      mensaje: '',
      mensajeTipo: 'success'
    }
  },

  async mounted() {
    try {
      const token = localStorage.getItem('sessionToken')
      if (!token) {
        this.mostrarMensaje('⚠️ No hay sesión activa. Inicia sesión nuevamente.', 'warning')
        this.$router.push('/login')
        return
      }

      const response = await obtenerUsuarioActual(token)
      console.log('🔹 obtenerUsuarioActual →', response)

      const data = response?.data || {}
      const userName = data?.options?.login
      console.log('🔸 userName obtenido:', userName)

      if (userName) {
        const { data: datosUsuario } = await buscarUsuarioPorUserName(userName)
        console.log('🔹 buscarUsuarioPorUserName →', datosUsuario)

        // ⚠️ Si el backend devuelve un array, toma el primer elemento
        const usuarioData = Array.isArray(datosUsuario) ? datosUsuario[0] : datosUsuario

        if (usuarioData) {
          // Mapear los campos al modelo del frontend
          this.usuario = {
            identificacion: usuarioData.identificacion || '',
            userName: usuarioData.userName || '',
            nombres: usuarioData.nombres || '',
            apellidos: usuarioData.apellidos || '',
            email: usuarioData.email || '',
            telefono: usuarioData.telefono || '',
            direccion: usuarioData.direccion || '',
            fechaCreacion: usuarioData.fechaCreacion || '',
            fechaActualizacion: usuarioData.fechaActualizacion || ''
          }

          this.mostrarMensaje('✅ Usuario autenticado cargado correctamente.', 'success')
        } else {
          this.mostrarMensaje(`⚠️ No se encontraron datos para el usuario: ${userName}`, 'warning')
        }
      } else {
        this.mostrarMensaje('⚠️ No se encontró información del usuario autenticado.', 'warning')
      }
    } catch (error) {
      console.error('❌ Error al cargar usuario:', error)
      this.mostrarMensaje(
        error.response?.data?.message || `❌ Error al cargar datos del usuario: ${error.message}`,
        'error'
      )
    }
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

    abrirConfirmacionActualizar() {
      this.mostrarConfirmacionActualizar = true
    },

    cerrarModalActualizar() {
      this.mostrarConfirmacionActualizar = false
    },

    confirmarActualizar() {
      this.$router.push({
        name: 'ConfiguracionActualizarUsuarioView',
        params: { identificacion: this.usuario.identificacion }
      })
      this.cerrarModalActualizar()
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

.datos-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 25px;
  margin-top: 20px;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 10px;
  width: 500px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
}

.campo {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

label {
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

input {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: #f5f5f5;
  color: #555;
}

.boton-container {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  margin-top: 5px;
}

.btn-actualizar {
  background-color: #007bff;
  color: white;
  padding: 12px 18px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-actualizar:hover {
  background-color: #0056b3;
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

</style>
