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
          <label for="código">Código</label>
          <input v-model="productoForm.codigo" type="text" />

          <label for="nombre">Nombre</label>
          <input v-model="productoForm.nombre" type="text" />

          <label for="referencia">Referencia</label>
          <input v-model="productoForm.referencia" type="text" />

          <label for="descripción">Descripción</label>
          <input v-model="productoForm.descripcion" type="text" />

          <label for="marca">Marca</label>
          <input v-model="productoForm.marca" type="text" />

          <label for="unidadMedida">U. de Medida</label>
          <input v-model="productoForm.unidadMedida" type="text" />

          <label for="cantidad">Cantidad</label>
          <input v-model="productoForm.cantidad" type="number" />

          <label for="precio">Precio</label>
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
          <button type="button" class="agregar-btn" :disabled="!hayDatos()" @click="agregarProducto">
            ➕ Registrar
          </button>

          <!-- 🧹 Botón de limpiar campos -->
          <button type="button" class="limpiar-campos-btn" :disabled="!hayDatos()" @click="limpiarCampos">
            🧹 Limpiar campos
          </button>

          <!-- ↩️ Botón de volver -->
          <button type="button" class="volver-btn" @click="volverProductos">
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
      menuOpen: localStorage.getItem('menuPinned') === 'true', // Siempre arranca expandido y false arranca oculto
      productoForm: {
        codigo: '',
        nombre: '',
        referencia: '',
        descripcion: '',
        marca: '',
        unidadMedida: '',
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
    // handleMenuToggle(state) {
    // this.menuOpen = state // Se descomenta cuando menuOpen: false
    // },

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

      if (!this.productoForm.referencia) {
        this.mostrarMensaje('Ingrese la referencia del producto.', 'error')
        return
      }

      if (!this.productoForm.descripcion) {
        this.mostrarMensaje('Ingrese la descripción del producto.', 'error')
        return
      }

      if (!this.productoForm.marca) {
        this.mostrarMensaje('Ingrese la marca del producto.', 'error')
        return
      }

      if (!this.productoForm.unidadMedida) {
        this.mostrarMensaje('Ingrese la unidad de medida del producto.', 'error')
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

      // 🔍 Verificar si ya existe un producto con el mismo código en la lista local
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
          ...this.productoForm,
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
        this.manejarErrorApiProductosRegistrar(error, `registrar producto ${this.productoForm.nombre}`)
      }
    },

    // 🔹 Método para saber si hay datos en el formulario
    hayDatos() {
      return this.productoForm.codigo ||
          this.productoForm.nombre ||
          this.productoForm.referencia ||
          this.productoForm.descripcion ||
          this.productoForm.marca ||
          this.productoForm.unidadMedida ||
          this.productoForm.cantidad ||
          this.productoForm.precio ||
          this.productoForm.proveedorName;
    },

    // 🔹 Método para limpiar campos del formulario
    limpiarCampos() {
      this.productoForm = {
        codigo: '',
        nombre: '',
        referencia: '',
        descripcion: '',
        marca: '',
        unidadMedida: '',
        cantidad: 0,
        precio: 0,
        proveedorId: '',
        proveedorName: ''
      }
    },

    // 🔹 Método para volver a registro de productos
    volverProductos() {
      this.$router.push({ name: 'ProductosView' })
    },

    // 🔹 Método para cargar proveedores
    async cargarProveedores() {
      try {
        const response = await listarProveedores()
        this.proveedores = response.data
        this.proveedoresFiltrados = [...this.proveedores]
      } catch (error) {
        this.manejarErrorApiProductosRegistrar(error, 'cargar proveedores')
      }
    },

    // 🔹 Método para manejar errores de API
    manejarErrorApiProductosRegistrar(error, contexto = '') {
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
  margin-bottom: 10px;
  text-align: center;
  /* espacio desde arriba */
  margin-top: 1px;
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

.agregar-btn {
  padding: 6px 12px;
  border-radius: 6px;
  background: #0077b6;
  color: white;
  border: none;
  cursor: pointer;
  margin-left: 4px;
  font-weight: 600;
}

.agregar-btn:hover {
  background: #005f8a;
}

.agregar-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.limpiar-campos-btn {
  padding: 6px 12px;
  border-radius: 6px;
  background: #f4a261;
  color: #1a1a1a;
  border: none;
  cursor: pointer;
  margin-left: 4px;
  font-weight: 600;
}

.limpiar-campos-btn:hover {
  background: #049670;
}

.limpiar-campos-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.limpiar-campos-btn:not(:disabled):hover {
  background: #e76f51;
}

.volver-btn {
  padding: 6px 12px;
  border-radius: 6px;
  background: #0077b6;
  color: white;
  border: none;
  cursor: pointer;
  margin-left: 4px;
  font-weight: 600;
}

.volver-btn:hover {
  background: #005f8a;
}

select {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
