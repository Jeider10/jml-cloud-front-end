<!-- src/components/proveedores/ActualizarProductoView.vue -->

<template>
  <div class="registro-producto-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="handleMenuToggle" />

    <!-- Contenido principal -->
    <div :class="['producto-container', { expanded: menuOpen }]">
      <h1 class="titulo">Actualizar Producto</h1>

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
          <input v-model="productoForm.codigo" type="text" disabled />

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

          <label for="precioU">Precio U.</label>
          <input v-model="productoForm.precio" type="number" step="0.01" />

          <label for="proveedor">Proveedor</label>
          <div class="form-group">
            <select v-model="productoForm.proveedorId" @change="actualizarProveedorName" class="form-control">
              <option disabled value="">Seleccione un proveedor</option>
              <option v-for="p in proveedores" :key="p.codigoSucursal" :value="p.codigoSucursal">
                {{ p.nombre }}
              </option>
            </select>
          </div>

          <!-- 💾 Botón de actualizar -->
          <button type="button" class="actualizar-btn" @click="actualizarProductoEnServidor">
            💾 Actualizar
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
import { listarProveedores } from '@/services/apiSuppliersService.js'
import { actualizarProducto, buscarProductoPorCodigo } from '@/services/apiProductsService.js'

export default {
  name: 'ActualizarProductoView',
  components: { DashboardSideMenu },
  props: ['codigo'],
  data() {
    return {
      menuOpen: true, // Siempre arranca expandido y false arranca oculto
      productoForm: {
        codigo: '',
        nombre: '',
        referencia: '',
        descripcion: '',
        marca: '',
        unidadMedida: '',
        cantidad: 0,
        precio: 0,
        proveedorId: null,
        proveedorName: ''
      },
      mensaje: '',
      mensajeTipo: '',
      proveedores: []
    }
  },

  async mounted() {
    // 🔹 Cargar todos los proveedores desde backend
    await this.cargarProveedores()

    // 🔹 Cargar producto desde backend
    await this.cargarProducto()
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

    // 🔹 Método para cargar producto y normalizar proveedorId
    async cargarProducto() {
      try {
        const response = await buscarProductoPorCodigo(this.codigo)

        if (response.data) {
          this.productoForm = {
            ...response.data,
            proveedorId: response.data.proveedorId ? String(response.data.proveedorId) : '',
            proveedorName: response.data.proveedorName || ''
          }
          this.mostrarMensaje(`✅ Producto ${this.productoForm.nombre} cargado correctamente.`, 'info')
        } else {
          this.mostrarMensaje('⚠️ No se encontraron datos del producto.', 'warning')
        }

        // 🔹 Verificar si el proveedor está en la lista
        const existe = this.proveedores.find(p => String(p.codigoSucursal) === this.productoForm.proveedorId)
        if (!existe && this.productoForm.proveedorId) {
          this.proveedores.push({
            codigoSucursal: this.productoForm.proveedorId,
            nombre: this.productoForm.proveedorName || 'Proveedor seleccionado'
          })
        }
      } catch (error) {
        this.manejarErrorApiProductosActualizar(error, `buscar producto con código ${this.codigo}`)
      }
    },

    // 🔹 Método para actualizar producto en backend
    async actualizarProductoEnServidor() {
      if (
        !this.productoForm.codigo ||
        !this.productoForm.nombre ||
        !this.productoForm.descripcion
      ) {
        this.mostrarMensaje('Código, nombre y descripción son obligatorios.', 'error')
        return
      }

      if (
        !this.productoForm.proveedorId
      ) {
        this.mostrarMensaje('Seleccione un proveedor.', 'error')
        return
      }

      try {
        // buscar nombre del proveedor seleccionado a partir del ID
        const proveedorSel = this.proveedores.find(p => p.codigoSucursal === this.productoForm.proveedorId)
        this.productoForm.proveedorName = proveedorSel ? proveedorSel.nombre : this.productoForm.proveedorName

        const response = await actualizarProducto(this.productoForm)
        const actualizado = response.data

        this.mostrarMensaje(`✅ Producto ${actualizado.nombre} actualizado correctamente.`, 'success')

      } catch (error) {
        this.manejarErrorApiProductosActualizar(error, `actualizar producto ${this.productoForm.nombre}`)
      }
    },

    // 🔹 Método para volver a todos los productos
    volverProductos() {
      this.$router.push({ name: 'ProductosView' })
    },

    // Metodo para actualizar el nombre del proveedor al cambiar el select
    actualizarProveedorName() {
      const seleccionado = this.proveedores.find(p => p.codigoSucursal === this.productoForm.proveedorId)
      this.productoForm.proveedorName = seleccionado ? seleccionado.nombre : ''
    },

    // 🔹 Método para cargar lista de proveedores
    async cargarProveedores() {
      try {
        const response = await listarProveedores()
        this.proveedores = response.data.map(p => ({
          codigoSucursal: String(p.codigoSucursal),
          nombre: p.nombre
        }))
      } catch (error) {
        this.manejarErrorApiProductosActualizar(error, 'listar proveedores')
      }
    },

    // 🔹 Método para manejar errores de API
    manejarErrorApiProductosActualizar(error, contexto = '') {
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

.form-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

select {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
