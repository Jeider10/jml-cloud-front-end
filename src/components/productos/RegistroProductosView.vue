<!-- src/components/productos/RegistroProductosView.vue -->

<template>
  <div class="registro-producto-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="handleMenuToggle" />

    <!-- Contenido principal -->
    <div :class="['producto-container', { expanded: menuOpen }]">
      <h1 class="titulo">Registro Producto</h1>

      <!-- 🔔 Mensaje visual -->
      <transition name="fade">
        <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
          {{ mensaje }}
        </div>
      </transition>

      <!-- Formulario producto -->
      <div class="form-container">
        <div class="form-row">
          <label>Código:</label>
          <input v-model="productoForm.codigo" type="text" />

          <label>Nombre:</label>
          <input v-model="productoForm.nombre" type="text" />

          <label>Descripción:</label>
          <input v-model="productoForm.descripcion" type="text" />

          <label>Cantidad:</label>
          <input v-model="productoForm.cantidad" type="number" />

          <label>Precio:</label>
          <input v-model="productoForm.precio" type="number" step="0.01" />

          <label for="proveedor">Proveedor</label>
          <select v-model="productoForm.proveedorName" id="proveedor">
            <!-- 🔹 Opción por defecto -->
            <option disabled value="">Seleccione un proveedor</option>

            <!-- 🔹 Opciones de proveedores -->
            <option v-for="prov in proveedores" :key="prov.codigoSucursal" :value="prov.nombre">
              {{ prov.nombre }}
            </option>
          </select>

          <!-- ➕ Botón de registrar -->
          <button type="button"
                  class="agregar-btn"
                  :disabled="!hayDatos()"
                  @click="agregarProducto">
                  ➕ Registrar
          </button>

          <!-- 🧹 Botón de limpiar campos -->
          <button type="button"
                  class="limpiar-campos-btn"
                  :disabled="!hayDatos()"
                  @click="limpiarCampos">
                  🧹 Limpiar campos
          </button>

          <!-- ↩️ Botón de volver -->
          <button type="button"
                  class="volver-btn"
                  @click="volverProductos">
                  ↩️ Volver
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'
import { listarProveedores, buscarProveedorPorNombre } from '@/services/apiSuppliersService.js'
import { crearProducto } from '@/services/apiProductsService.js'

export default {
  name: 'RegistroProductosView',
  components: { DashboardSideMenu },
  data() {
    return {
      menuOpen: false,
      productoForm: {
        codigo: '',
        nombre: '',
        descripcion: '',
        cantidad: 0,
        precio: 0,
        proveedorId: '',
        proveedorName: ''
      },
      productos: [],
      productosFiltrados: [],
      proveedores: [],
      proveedoresFiltrados: [],
      mensaje: '',
      mensajeTipo: '',
      busqueda: '',
      tipoBusqueda: '',
      modalEliminar: {
        visible: false,
        idx: null,
        producto: {}
      }
    }
  },

  mounted() {
    // 🔹 Cargar todos los proveedores desde backend al iniciar para poder obtener los proveedores al registrar un producto
    this.cargarProveedores()
  },

  methods: {
    handleMenuToggle(state) {
      this.menuOpen = state
    },

    // 🔹 Método de mostrar mensaje
    mostrarMensaje(texto, tipo = 'success') {
      this.mensaje = texto
      this.mensajeTipo = tipo
      setTimeout(() => {
        this.mensaje = ''

        // 🔹 Solo redirige si es un mensaje de éxito
        if (tipo === 'success') {
          this.$router.push({ name: 'ProductosView' })
        }
      }, 3000)
    },

    // 🔹 Método de agregar producto
    async agregarProducto() {
      if (!this.productoForm.codigo) {
        this.mostrarMensaje('Ingrese el código del producto.', 'error')
        return
      }

      if (!this.productoForm.nombre) {
        this.mostrarMensaje('Ingrese el nombre del producto.', 'error')
        return
      }

      if (!this.productoForm.descripcion) {
        this.mostrarMensaje('Ingrese la descripción del producto.', 'error')
        return
      }

      if (!this.productoForm.cantidad) {
        this.mostrarMensaje('Ingrese la cantidad del producto.', 'error')
        return
      }

      if (!this.productoForm.precio) {
        this.mostrarMensaje('Ingrese el precio del producto.', 'error')
        return
      }

      if (!this.productoForm.proveedorName) {
        this.mostrarMensaje('Seleccione el proveedor del producto.', 'error')
        return
      }

      // 🔹 Validar duplicado local
      const existente = this.productos.find(p => p.codigo === this.productoForm.codigo)
      if (existente) {
        this.mostrarMensaje(`⚠️ Ya existe un producto: ${existente.nombre} con el código ${existente.codigo}.`, 'error')
        return
      }

      try {
        // 🔎 Buscar proveedor por nombre en el micro de proveedores
        const responseProveedor = await buscarProveedorPorNombre(this.productoForm.proveedorName)
        const proveedoresEncontrados = responseProveedor.data

        if (!proveedoresEncontrados || proveedoresEncontrados.length === 0) {
          this.mostrarMensaje(`⚠️ No se encontró proveedor con nombre ${this.productoForm.proveedorName}.`, 'error')
          return
        }

        // ✅ Tomar el proveedor correcto (si hay varios con mismo nombre puedes ajustar para que usuario elija)
        const proveedorSeleccionado = proveedoresEncontrados[0]

        const payload = {
          // ...this.productoForm,
          codigo: this.productoForm.codigo,
          nombre: this.productoForm.nombre,
          descripcion: this.productoForm.descripcion,
          cantidad: this.productoForm.cantidad,
          precio: this.productoForm.precio,
          proveedorId: proveedorSeleccionado.codigoSucursal,     // <-- código real del proveedor
          proveedorName: proveedorSeleccionado.nombre            // <-- nombre del proveedor
        }

        // Llamada al backend
        const response = await crearProducto(payload)
        const nuevoProducto = response.data

        // Agregamos el producto retornado por el backend a la lista local
        this.productos.push(nuevoProducto)
        this.productosFiltrados = [...this.productos]

        this.mostrarMensaje(`✅ Producto ${nuevoProducto.nombre} registrado correctamente.`, 'success')

        // limpiar formulario
        this.limpiarCampos();
      } catch (error) {
        console.error('❌ Error al crear producto:', error)

        // Captura específica de duplicado
        if (error.response && error.response.status === 409) {
          this.mostrarMensaje(`⚠️ Ya existe un producto con el código ${this.productoForm.codigo}.`, 'error')
        } else if (error.response && error.response.data) {
          const mensajeBackend = error.response.data?.message || JSON.stringify(error.response.data)
          this.mostrarMensaje(`Error del servidor: ${mensajeBackend}`, 'error')
        } else {
          this.mostrarMensaje(`Error inesperado: ${error.message}`, 'error')
        }
      }
    },

    // 🔹 Método para saber si hay datos en el formulario
    hayDatos() {
      return this.productoForm.codigo ||
             this.productoForm.nombre ||
             this.productoForm.descripcion ||
             this.productoForm.cantidad ||
             this.productoForm.precio ||
             this.productoForm.proveedorName;
    },

    // 🔹 Método para limpiar campos del formulario
    limpiarCampos() {
      this.productoForm = {
        codigo: '',
        nombre: '',
        descripcion: '',
        cantidad: 0,
        precio: 0,
        proveedorId: '',
        proveedorName: ''
      }
    },

    // 🔹 Método para cargar proveedores
    async cargarProveedores() {
      try {
        const response = await listarProveedores()
        this.proveedores = response.data
        this.proveedoresFiltrados = [...this.proveedores]
      } catch (error) {
        console.error('❌ Error al cargar proveedores:', error)
        if (error.response && error.response.data) {
          this.mostrarMensaje(`Error: ${error.response.data}`, 'error')
        } else {
          this.mostrarMensaje('Error al conectarse con el servidor de proveedores.', 'error')
        }
      }
    },

    // 🔹 Método para volver a registro de productos
    volverProductos() {
      this.$router.push({ name: 'ProductosView' })
    }
  }
}
</script>


<style scoped>
.registro-producto-wrapper {
  display: flex;
}

.producto-container {
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

.producto-container.expanded {
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
  margin-bottom: 0px;
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

select {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.agregar-btn {
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  padding: 8px 12px;        /* De aqui al final del boton era otro */
  background: #0077b6;
  color: white;
}

.limpiar-campos-btn {
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  padding: 8px 12px;        /* De aqui al final del boton era otro */
  background: #f4a261;
  color: white;
}

.agregar-btn:hover {
  background: #005f8a;
}

.agregar-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.limpiar-campos-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
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
</style>
