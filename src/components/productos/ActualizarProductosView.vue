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
          <label>Código</label>
          <input v-model="productoForm.codigo" type="text" disabled />

          <label>Nombre</label>
          <input v-model="productoForm.nombre" type="text" />

          <label>Descripción</label>
          <input v-model="productoForm.descripcion" type="text" />

          <label>Cantidad</label>
          <input v-model="productoForm.cantidad" type="number" />

          <label>Precio U.</label>
          <input v-model="productoForm.precio" type="number" step="0.01" />

          <label>Proveedor</label>
          <select v-model="productoForm.proveedorId">
            <option disabled :value="null">Seleccione un proveedor</option>
            <option v-for="p in proveedores" :key="p.key" :value="p.key">
              {{ p.nombre || p.name }}
            </option>
          </select>

          <button type="button" class="agregar-btn" @click="actualizarProductoEnServidor">
            💾 Actualizar
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
      menuOpen: false,
      productoForm: {
        codigo: '',
        nombre: '',
        descripcion: '',
        cantidad: 0,
        precio: 0,
        proveedorId: null,   // aquí guardaremos la key normalizada (number o string)
        proveedorName: ''
      },
      mensaje: '',
      mensajeTipo: '',
      proveedores: [] // cada item tendrá al menos { key, nombre, ... }
    }
  },
  async mounted() {
    // 1. Cargar proveedores
    await this.cargarProveedores()

    // 2. Cargar producto desde backend usando el código de la ruta
    await this.cargarProducto()
  },
  methods: {
    handleMenuToggle(state) {
      this.menuOpen = state
    },

    mostrarMensaje(texto, tipo = 'success') {
      this.mensaje = texto
      this.mensajeTipo = tipo
      setTimeout(() => { this.mensaje = '' }, 3000)
    },

    // Normaliza y quita duplicados: usa id si existe, sino nic
    async cargarProveedores() {
      try {
        const response = await listarProveedores()
        const raw = Array.isArray(response.data) ? response.data : []

        // crear lista con key consistente
        const lista = raw.map(p => {
          // elegir la llave que exista (id o nic)
          const rawKey = (p.id !== undefined && p.id !== null) ? p.id
                        : (p.nic !== undefined && p.nic !== null) ? p.nic
                        : null

          // convertir numeric-string a number
          const key = rawKey !== null && !isNaN(Number(rawKey)) ? Number(rawKey) : rawKey

          return {
            ...p,
            key
          }
        })

        // deduplicar por key (si key === null dejar también, pero evitar repetidos)
        const map = new Map()
        for (const p of lista) {
          // si no tiene key (null), usamos nombre+correo como fallback para evitar colapsar todo en una sola entry
          const mapKey = p.key !== null ? p.key : `${p.nombre || ''}::${p.correo || ''}::${p.telefono || ''}`
          if (!map.has(mapKey)) map.set(mapKey, p)
        }

        this.proveedores = Array.from(map.values())
      } catch (error) {
        console.error('❌ Error al cargar proveedores:', error)
        this.mostrarMensaje('Error al cargar proveedores.', 'error')
      }
    },

    // Carga el producto y asigna proveedorId usando varios fallbacks
    async cargarProducto() {
      try {
        const response = await buscarProductoPorCodigo(this.codigo)
        if (response.data) {
          const data = response.data

          // obtener proveedorId desde diferentes formas que el backend podría devolver
          let proveedorKey = null
          if (data.proveedorId !== undefined && data.proveedorId !== null) {
            proveedorKey = data.proveedorId
          } else if (data.proveedor && (data.proveedor.id !== undefined || data.proveedor.nic !== undefined)) {
            proveedorKey = data.proveedor.id !== undefined ? data.proveedor.id : data.proveedor.nic
          } else if (data.proveedor && data.proveedor.key !== undefined) {
            proveedorKey = data.proveedor.key
          }

          // convertir a number si corresponde
          if (proveedorKey !== null && !isNaN(Number(proveedorKey))) proveedorKey = Number(proveedorKey)

          const proveedorName = data.proveedorName || (data.proveedor && (data.proveedor.nombre || data.proveedor.name)) || ''

          this.productoForm = {
            codigo: data.codigo,
            nombre: data.nombre,
            descripcion: data.descripcion,
            cantidad: data.cantidad,
            precio: data.precio,
            proveedorId: proveedorKey,
            proveedorName
          }

          // Si la lista de proveedores ya cargó, nos aseguramos de que exista una entrada coincidente.
          // (si no existe, el select mostrará la opción por defecto; es buena idea verificar si la key existe)
          if (this.proveedores.length > 0 && proveedorKey !== null) {
            const existe = this.proveedores.some(p => p.key === proveedorKey)
            if (!existe) {
              // si no existe en proveedores, podemos insertar temporalmente para que aparezca seleccionado
              this.proveedores.unshift({ key: proveedorKey, nombre: proveedorName })
            }
          }
        }
      } catch (error) {
        console.error('❌ Error al cargar producto:', error)
        this.mostrarMensaje('Error al cargar producto.', 'error')
      }
    },

    async actualizarProductoEnServidor() {
      if (!this.productoForm.codigo || !this.productoForm.nombre || !this.productoForm.descripcion) {
        this.mostrarMensaje('Código, nombre y descripción son obligatorios.', 'error')
        return
      }
      if (this.productoForm.proveedorId === null || this.productoForm.proveedorId === '' || this.productoForm.proveedorId === undefined) {
        this.mostrarMensaje('Seleccione un proveedor.', 'error')
        return
      }

      try {
        // buscar nombre del proveedor seleccionado
        const proveedorSel = this.proveedores.find(p => p.key === this.productoForm.proveedorId)
        this.productoForm.proveedorName = proveedorSel ? (proveedorSel.nombre || proveedorSel.name || '') : this.productoForm.proveedorName

        // preparar payload: backend espera proveedorId + proveedorName (según tu service)
        const payload = {
          codigo: this.productoForm.codigo,
          nombre: this.productoForm.nombre,
          descripcion: this.productoForm.descripcion,
          cantidad: this.productoForm.cantidad,
          precio: this.productoForm.precio,
          proveedorId: this.productoForm.proveedorId,
          proveedorName: this.productoForm.proveedorName
        }

        await actualizarProducto(payload)

        this.mostrarMensaje(`Producto ${this.productoForm.nombre} actualizado correctamente.`, 'success')

        // Volver a la vista principal
        setTimeout(() => {
          this.$router.push({ name: 'RegistroProductosView' })
        }, 1200)
      } catch (error) {
        console.error('❌ Error al actualizar producto:', error)
        this.mostrarMensaje('Error al actualizar producto en el servidor.', 'error')
      }
    }
  }
}
</script>


<style scoped>
.registro-producto-wrapper { display: flex; }

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

.producto-container.expanded { left: 220px; }

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

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.form-container { margin-bottom: 20px; }
.form-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }

label { font-weight: bold; }

input, select { padding: 6px; border: 1px solid #ccc; border-radius: 4px; }

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
</style>
