<!-- src/components/clientes/ConfiguracionUsuariosEmpresaView.vue -->

<template>
  <div class="configuracion-empresa-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="menuOpen = $event" />

    <!-- Contenido principal -->
    <div :class="['main-content', { expanded: menuOpen }]">
      <h1 class="titulo">Registrar nuevo usuario</h1>

      <!-- Bloque con datos del usuario -->
      <div class="datos-empresa">
        <div class="dato-row">
          <label>Usuario:</label>
          <input type="text" v-model="usuario.nombre" placeholder="Ingrese nombre de usuario" />
        </div>
        <div class="dato-row">
          <label>Contraseña:</label>
          <input type="password" v-model="usuario.password" placeholder="Ingrese contraseña" />
        </div>
        <!-- Código de Rol -->
        <div class="dato-row">
          <label for="rolCode">Código de Rol:</label>
          <input
            type="number"
            id="rolCode"
            v-model.number="usuario.rol"
            min="1"
            step="1"
            placeholder="Ingrese código de rol"
            required
          />
        </div>
        <div class="dato-row">
          <label>Correo electrónico:</label>
          <input type="email" v-model="usuario.email" placeholder="Ingrese correo electrónico" />
        </div>
      </div>

      <!-- Botones -->
      <div class="acciones">
        <button type="button" class="guardar-btn"
                :disabled="!tieneTodos"
                @click="mostrarConfirmacion = true">
          ➕ Registrar
        </button>
        <button type="button" class="limpiar-btn"
                :disabled="!tieneAlgunos"
                @click="limpiar">
          🧹 Limpiar
        </button>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <div v-if="mostrarConfirmacion" class="modal-overlay">
      <div class="modal">
        <h3>⚠️ Confirmación</h3>
        <p>¿Estás seguro de que deseas registrar este usuario?</p>
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
  name: 'ConfiguracionUsuariosEmpresaView',
  components: { DashboardSideMenu },
  data() {
    return {
      menuOpen: true, // Siempre arranca expandido y false arranca oculto
      mostrarConfirmacion: false,
      usuario: {
        nombre: '',
        password: '',
        rol: null,
        email: ''
      }
    }
  },
  computed: {
    // Todos los campos completos -> habilita Registrar
    tieneTodos() {
      return Object.values(this.usuario).every(v => v !== null && v !== '' && String(v).trim() !== '')
    },
    // Algún campo con texto -> habilita Limpiar
    tieneAlgunos() {
      return Object.values(this.usuario).some(v => v !== null && v !== '' && String(v).trim() !== '')
    }
  },
  methods: {
    confirmarGuardar() {
      let usuarios = JSON.parse(localStorage.getItem('usuarios')) || []
      usuarios.push(this.usuario)
      localStorage.setItem('usuarios', JSON.stringify(usuarios))

      this.mostrarConfirmacion = false
      this.limpiar()
    },
    limpiar() {
      this.usuario = { nombre: '', password: '', rol: null, email: '' }
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
  margin-bottom: 20px;
  text-align: center;
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
  width: 150px;
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

.acciones {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.guardar-btn,
.limpiar-btn {
  padding: 12px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
}

/* Botón Registrar */
.guardar-btn {
  background: #28a745;
  color: white;
}
.guardar-btn:disabled {
  background: #94d3a2;
  cursor: not-allowed;
}
.guardar-btn:hover:not(:disabled) {
  background: #218838;
}

/* Botón Limpiar */
.limpiar-btn {
  background: #e74c3c;
  color: white;
}
.limpiar-btn:disabled {
  background: #f5a7a0;
  cursor: not-allowed;
}
.limpiar-btn:hover:not(:disabled) {
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
