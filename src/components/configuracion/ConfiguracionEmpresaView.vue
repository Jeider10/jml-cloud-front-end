<!-- src/components/configuracion/ConfiguracionEmpresaView.vue -->

<template>
  <div class="configuracion-empresa-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="menuOpen = $event" />

    <!-- Contenido principal -->
    <div :class="['main-content', { expanded: menuOpen }]">
      <h1 class="titulo">Datos de la Empresa</h1>

      <!-- Bloque con datos -->
      <div class="datos-empresa">
        <div class="dato-row">
          <label>NIC:</label>
          <input type="text" v-model="empresa.nic" :disabled="!modoEdicion" />
        </div>
        <div class="dato-row">
          <label>Nombre:</label>
          <input type="text" v-model="empresa.nombre" :disabled="!modoEdicion" />
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
        <div class="dato-row" v-if="modoEdicion">
          <label>Logo:</label>
          <input type="file" accept="image/*" @change="onImageChange" />
        </div>
      </div>

      <!-- Logo grande -->
      <div class="logo-container">
        <img :src="empresa.logo || require('@/assets/img/Empresa.png')" alt="Logo Empresa" class="logo-empresa" />
      </div>

      <!-- Botones -->
      <div class="acciones">
        <button v-if="!modoEdicion" type="button" class="actualizar-btn" @click="activarEdicion">
          ✏️ Actualizar
        </button>

        <div v-else class="btn-group">
          <button type="button" class="guardar-btn" :disabled="!tieneTexto" @click="mostrarConfirmacion = true">
            💾 Guardar
          </button>
          <button type="button" class="limpiar-btn" @click="limpiar">
            🧹 Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <div v-if="mostrarConfirmacion" class="modal-overlay">
      <div class="modal">
        <h3>⚠️ Confirmación</h3>
        <p>¿Estás seguro de que deseas actualizar los datos de la empresa?</p>
        <div class="modal-buttons">
          <button class="si-btn" @click="confirmarGuardar">Sí</button>
          <button class="no-btn" @click="mostrarConfirmacion = false">No</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'

export default {
  name: 'ActualizarConfiguracionEmpresaView',
  components: { DashboardSideMenu },
  data() {
    return {
      menuOpen: true, // Siempre arranca expandido y false arranca oculto
      modoEdicion: false,
      mostrarConfirmacion: false,
      empresa: {
        nic: '',
        nombre: '',
        direccion: '',
        telefono: '',
        mensaje: '',
        logo: '' // 🔹 Nuevo campo para la imagen
      }
    }
  },
  computed: {
    tieneTexto() {
      return Object.values(this.empresa).some(v => v && v.toString().trim() !== '')
    }
  },
  mounted() {
    const data = JSON.parse(localStorage.getItem('empresa'))
    if (data) this.empresa = data
  },
  methods: {
    activarEdicion() {
      this.modoEdicion = true
    },
    confirmarGuardar() {
      localStorage.setItem('empresa', JSON.stringify(this.empresa))
      this.mostrarConfirmacion = false
      this.modoEdicion = false
    },
    limpiar() {
      this.empresa = { nic: '', nombre: '', direccion: '', telefono: '', mensaje: '', logo: '' }
      this.modoEdicion = false
    },
    onImageChange(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = e => {
          this.empresa.logo = e.target.result // guarda en base64
        }
        reader.readAsDataURL(file)
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
  background-color: #6fffd4;
  transition: left 0.5s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
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

.datos-empresa {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0,0,0,0.15);
  margin-bottom: 30px;
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.dato-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dato-row label {
  width: 100px;
  font-weight: bold;
  text-align: left;
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

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}
.logo-empresa {
  width: 600px;
  height: auto;
}

.acciones {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.btn-group {
  display: flex;
  gap: 15px;
}

.actualizar-btn,
.guardar-btn,
.limpiar-btn {
  padding: 12px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
}

.actualizar-btn {
  background: #0077b6;
  color: white;
}
.actualizar-btn:hover {
  background: #005f8a;
}

.guardar-btn {
  background: #28a745;
  color: white;
}
.guardar-btn:disabled {
  background: #94d3a2;
  cursor: not-allowed;
}

.limpiar-btn {
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
.si-btn:hover { background: #218838; }
.no-btn:hover { background: #c0392b; }
</style>
