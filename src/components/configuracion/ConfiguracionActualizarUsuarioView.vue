<!-- src/components/configuracion/ConfiguracionActualizarUsuarioView.vue -->

<template>
  <div class="registro-proveedor-wrapper">
    <DashboardSideMenu @menu-toggle="menuOpen = $event" />
    <div :class="['proveedor-container', { expanded: menuOpen }]">
      <h1 class="titulo">Actualizar Usuario</h1>

      <transition name="fade">
        <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
          {{ mensaje }}
        </div>
      </transition>

      <div class="form-container">
        <div class="form-row">
          <label>Identificación</label>
          <input v-model="usuarioForm.identificacion" type="text" disabled />

          <label>Nombres</label>
          <input v-model="usuarioForm.nombres" type="text" />

          <label>Apellidos</label>
          <input v-model="usuarioForm.apellidos" type="text" />

          <label>Usuario</label>
          <input v-model="usuarioForm.userName" type="text" />

          <label>Correo</label>
          <input v-model="usuarioForm.email" type="text" />

          <label>Teléfono</label>
          <input v-model="usuarioForm.telefono" type="text" />

          <label>Dirección</label>
          <input v-model="usuarioForm.direccion" type="text" />

          <button type="button" class="agregar-btn" @click="abrirModalConfirmacion">💾 Actualizar</button>
          <button type="button" class="volver-btn" @click="volverConfiguracion">↩️ Volver</button>
        </div>
      </div>
    </div>

    <!-- 🔹 Modal de confirmación de actualización -->
    <div v-if="mostrarConfirmacion" class="modal-overlay">
      <div class="modal">
        <h3>⚠️ Confirmación</h3>
        <p>¿Deseas actualizar el usuario con los datos ingresados?</p>
        <div class="modal-buttons">
          <button class="si-btn" @click="confirmarActualizacion">Sí</button>
          <button class="no-btn" @click="cerrarModal">No</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'
import { buscarUsuarioPorIdentificacion, actualizarUsuario } from '@/services/apiConfigEmpresaUsuariosService'

export default {
  name: 'ConfiguracionActualizarUsuarioView',
  components: { DashboardSideMenu },
  props: ['identificacion'],

  data() {
    return {
      menuOpen: true,
      usuarioForm: {
        identificacion: '',
        nombres: '',
        apellidos: '',
        userName: '',
        email: '',
        telefono: '',
        direccion: ''
      },
      mensaje: '',
      mensajeTipo: '',
      mostrarConfirmacion: false
    }
  },

  async mounted() {
    if (this.identificacion) {
      await this.cargarUsuario()
    } else {
      this.mostrarMensaje('Identificación no válida.', 'error')
    }
  },

  methods: {
    async cargarUsuario() {
      try {
        const response = await buscarUsuarioPorIdentificacion(this.identificacion)
        this.usuarioForm = { ...response.data }
      } catch (error) {
        this.mostrarMensaje('Error al cargar usuario.', 'error')
      }
    },

    // 🔹 Abrir el modal de confirmación antes de actualizar
    abrirModalConfirmacion() {
      this.mostrarConfirmacion = true
    },

    cerrarModal() {
      this.mostrarConfirmacion = false
    },

    // 🔹 Confirmar y ejecutar actualización
    async confirmarActualizacion() {
      this.mostrarConfirmacion = false
      try {
        await actualizarUsuario(this.usuarioForm)
        this.mostrarMensaje('✅ Usuario actualizado correctamente.', 'success')
      } catch (error) {
        this.mostrarMensaje('❌ Error al actualizar usuario.', 'error')
      }
    },

    mostrarMensaje(texto, tipo) {
      this.mensaje = texto
      this.mensajeTipo = tipo
      setTimeout(() => {
        this.mensaje = ''
        if (tipo === 'success') {
          this.$router.push({ path: '/configuracion-empresa-usuario', query: { vista: 'usuarios' } })
        }
      }, 2000)
    },

    volverConfiguracion() {
      this.$router.push({ path: '/configuracion-empresa-usuario', query: { vista: 'usuarios' } })
    }
  }
}
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
  margin-top: 1px;    /* espacio desde arriba */
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
  margin-bottom: 20px;
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

input {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.agregar-btn {
  padding: 8px 12px;
  border-radius: 6px;
  background: #0077b6;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.agregar-btn:hover {
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
