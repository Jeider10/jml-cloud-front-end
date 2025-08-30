<!-- src/components/clientes/RegistroClienteView.vue -->

<template>
  <div class="registro-cliente-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="handleMenuToggle" />

    <!-- Contenido principal -->
    <div :class="['cliente-container', { expanded: menuOpen }]">
      <h1 class="titulo">Registro Cliente</h1>

      <!-- 🔔 Mensaje visual -->
      <transition name="fade">
        <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
          {{ mensaje }}
        </div>
      </transition>

      <!-- Formulario cliente -->
      <div class="form-container">
        <div class="form-row">
          <label>DNI/RUC</label>
          <input v-model="clienteForm.dni" type="text" />

          <label>Nombre</label>
          <input v-model="clienteForm.nombre" type="text" />

          <label>Apellido</label>
          <input v-model="clienteForm.apellido" type="text" />

          <label>Teléfono</label>
          <input v-model="clienteForm.telefono" type="text" />

          <label>Dirección</label>
          <input v-model="clienteForm.direccion" type="text" />

          <button type="button" class="agregar-btn" @click="agregarCliente">
            ➕ Registrar
          </button>
        </div>

        <!-- 🔍 Filtro de búsqueda -->
        <div class="form-row" style="flex-direction: column; align-items: flex-start; gap: 4px;">
          <!-- Texto descriptivo -->
          <span style="font-weight: bold; margin-bottom: 4px;">Buscar por DNI/RUC, Nombre o Apellido:</span>

          <!-- Input y botones -->
          <div style="display: flex; gap: 4px;">
            <input v-model="busqueda" type="text" placeholder="Ingrese término de búsqueda" />
            <button type="button" class="buscar-btn" @click="filtrarClientes">Buscar</button>
            <button type="button" class="buscar-btn" @click="limpiarBusqueda">Limpiar</button>
          </div>
        </div>
      </div>

      <!-- Tabla de clientes -->
      <table class="clientes-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>DNI/RUC</th>
            <th>NOMBRE</th>
            <th>APELLIDO</th>
            <th>TELÉFONO</th>
            <th>DIRECCIÓN</th>
            <th>FECHA REGISTRO</th> <!-- ⏰ Nueva columna -->
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(c, idx) in clientesFiltrados" :key="idx">
            <td>{{ idx + 1 }}</td>
            <td>{{ c.dni }}</td>
            <td>{{ c.nombre }}</td>
            <td>{{ c.apellido }}</td>
            <td>{{ c.telefono }}</td>
            <td>{{ c.direccion }}</td>
            <td>{{ c.fechaRegistro }}</td> <!-- ⏰ Mostrar fecha -->
            <td>
              <!-- Nuevo botón de actualizar -->
              <button class="update-btn" @click="abrirActualizarCliente(c)">✏️</button>
              <button class="delete-btn" @click="eliminarCliente(idx)">🗑️</button>
            </td>
          </tr>
          <tr v-if="clientesFiltrados.length === 0">
            <td colspan="8" class="empty-row">No hay clientes registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'

export default {
  name: 'RegistroClienteView',
  components: { DashboardSideMenu },
  data() {
    return {
      menuOpen: false,
      clienteForm: {
        dni: '',
        nombre: '',
        apellido: '',
        telefono: '',
        direccion: ''
      },
      clientes: [],
      clientesFiltrados: [],
      mensaje: '',
      mensajeTipo: '',
      busqueda: ''
    }
  },
  mounted() {
    this.clientes = JSON.parse(localStorage.getItem('clientes')) || []
    this.clientesFiltrados = [...this.clientes]
  },
  methods: {
    handleMenuToggle(state) {
      this.menuOpen = state
    },

    mostrarMensaje(texto, tipo = 'success') {
      this.mensaje = texto
      this.mensajeTipo = tipo
      setTimeout(() => {
        this.mensaje = ''
      }, 3000)
    },

    agregarCliente() {
      if (!this.clienteForm.dni) {
        this.mostrarMensaje('Ingrese el DNI/RUC del cliente.', 'error')
        return
      }
      if (!this.clienteForm.nombre) {
        this.mostrarMensaje('Ingrese el nombre del cliente.', 'error')
        return
      }
      if (!this.clienteForm.apellido) {
        this.mostrarMensaje('Ingrese el apellido del cliente.', 'error')
        return
      }

      // 🔍 Verificar si ya existe un cliente con el mismo DNI
      const existente = this.clientes.find(c => c.dni === this.clienteForm.dni)
      if (existente) {
        this.mostrarMensaje(
          `⚠️ Ya existe un cliente con este DNI/RUC (${existente.dni}): ${existente.nombre} ${existente.apellido}.`,
          'error'
        )
        return
      }

      // Guardar cliente con fecha y hora
      const nuevo = {
        ...this.clienteForm,
        fechaRegistro: new Date().toLocaleString()  // ⏰ aquí agregamos la fecha
      }
      this.clientes.push(nuevo)
      localStorage.setItem('clientes', JSON.stringify(this.clientes)) // 🔄 Guardamos en localStorage
      this.clientesFiltrados = [...this.clientes]

      this.mostrarMensaje(
        `✅ Cliente ${this.clienteForm.nombre} ${this.clienteForm.apellido} registrado correctamente.`,
        'success'
      )

      // limpiar formulario
      this.clienteForm = { dni: '', nombre: '', apellido: '', telefono: '', direccion: '' }
    },

    eliminarCliente(idx) {
      if (idx >= 0 && idx < this.clientes.length) {
        const eliminado = this.clientes[idx]
        this.clientes.splice(idx, 1)
        localStorage.setItem('clientes', JSON.stringify(this.clientes)) // 🔄 Actualizamos localStorage
        this.clientesFiltrados = [...this.clientes]
        this.mostrarMensaje(`🗑️ Cliente ${eliminado.nombre} ${eliminado.apellido} eliminado.`, 'error')
      }
    },

    abrirActualizarCliente(cliente) {
      // Guardamos el cliente seleccionado para actualizar en localStorage
      localStorage.setItem('clienteActualizar', JSON.stringify(cliente))
      // Redirigimos a la vista de actualización
      this.$router.push({ name: 'ActualizarClienteView' }) // ✅ Nombre de component del index
    },

    filtrarClientes() {
      const texto = this.busqueda.toLowerCase()
      this.clientesFiltrados = this.clientes.filter(c =>
        c.dni.toLowerCase().includes(texto) ||
        c.nombre.toLowerCase().includes(texto) ||
        c.apellido.toLowerCase().includes(texto)
      )
    },

    limpiarBusqueda() {
      this.busqueda = ''
      this.clientesFiltrados = [...this.clientes]
    }
  }
}
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
  background-color: #6fffd4; /* ✅ mismo color que NuevaVentaView.vue */
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
  margin-bottom: 20px;
  text-align: center;
}

.mensaje {
  padding: 12px 18px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-weight: bold;
  text-align: center;
  box-shadow: 0px 4px 8px rgba(0,0,0,0.15);
}
.mensaje.success { background: #2ecc71; color: white; }
.mensaje.warning { background: #f1c40f; color: #333; }
.mensaje.error   { background: #e74c3c; color: white; }

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to { opacity: 0; }

.form-container { margin-bottom: 20px; }
.form-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

label { font-weight: bold; }

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
.agregar-btn:hover { background: #005f8a; }

.update-btn {
  padding: 6px 8px;
  border-radius: 6px;
  background: #f4a261;
  color: white;
  border: none;
  cursor: pointer;
  margin-right: 4px;
}
.update-btn:hover { background: #e76f51; }

.clientes-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.clientes-table th,
.clientes-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  background: white;
}

.delete-btn {
  padding: 6px 8px;
  border-radius: 6px;
  background: #e63946;
  color: white;
  border: none;
  cursor: pointer;
}
.delete-btn:hover { background: #b52a33; }

.empty-row { text-align: center; padding: 18px; color: #666; }

.buscar-btn {
  padding: 6px 12px;
  border-radius: 6px;
  background: #06d6a0;
  color: white;
  border: none;
  cursor: pointer;
  margin-left: 4px;
  font-weight: 600;
}
.buscar-btn:hover { background: #049670; }
</style>
