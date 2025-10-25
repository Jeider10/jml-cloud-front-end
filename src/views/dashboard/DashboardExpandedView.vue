<!-- src/views/dashboard/DashboardExpandedView.vue -->

<template>
  <div class="dashboard-container">
    <!-- 🔹 Loader mientras carga -->
    <div v-if="loading" class="loading-state">
      <p>Cargando información de la empresa...</p>
      <div class="spinner"></div>
    </div>

    <!-- 🔹 Contenido principal -->
    <div v-else class="dashboard-content fade-in">
      <h1 class="welcome-text animate-rainbow-text">¡Bienvenido!</h1>

      <h2 class="subtitle-text">
        Por favor, selecciona una opción del menú a la izquierda.
      </h2>

      <!-- Mensaje dinámico -->
      <p class="description-text">
        {{ mensajeEmpresa }}
      </p>

      <!-- Imagen dinámica -->
      <img
        :src="logoEmpresa"
        alt="Logo Empresa"
        class="logo-empresa"
      />
    </div>

    <!-- Footer -->
    <footer class="page-footer">
      <p>Copyright © 2025 Creative Tim</p>
      <p>
        Desarrollado por Ing. Jeider Montiel | Whatsapp | Facebook | TikTok
      </p>
    </footer>
  </div>
</template>


<script>
import { obtenerPrimeraEmpresa } from '@/services/apiConfigEmpresaService'

export default {
  name: "dashboard-page",
  data() {
    return {
      mensajeEmpresa: '',
      logoEmpresa: null,
      loading: true
    }
  },
  async mounted() {
    // 🔹 Cargar datos reales del backend al iniciar
    await this.cargarDatosEmpresa()
    this.loading = false

    // 🔹 Escuchar evento global emitido desde ConfiguracionEmpresaView
    this._empresaUpdatedHandler = (e) => {
      const payload = e?.detail ?? {}
      console.log('📢 Empresa actualizada recibida en Dashboard:', payload)

      if (payload.mensaje !== undefined) {
        this.mensajeEmpresa = payload.mensaje || this.mensajeEmpresa
      }
      // actualizar logo (si viene)
      if (payload.logo !== undefined) {
        this.logoEmpresa = this.getLogoUrl(payload.logo)
      }
    }

    window.addEventListener('empresaUpdated', this._empresaUpdatedHandler)
  },

  beforeUnmount() {
    // Limpiar listener al desmontar para evitar fugas de memoria
    window.removeEventListener('empresaUpdated', this._empresaUpdatedHandler)
  },

  methods: {
    async cargarDatosEmpresa() {
      try {
        const response = await obtenerPrimeraEmpresa()
        if (response?.data?.length > 0) {
          const empresa = response.data[0]
          this.mensajeEmpresa = empresa.mensaje || 'Bienvenido a nuestro sistema.'
          this.logoEmpresa = this.getLogoUrl(empresa.logo)
        } else {
          this.setDefaultValues()
        }
      } catch (error) {
        console.error('❌ Error al cargar datos de empresa:', error)
        this.setDefaultValues('Error al cargar los datos de la empresa.')
      }
    },

    setDefaultValues(mensaje = 'Bienvenido a nuestro sistema. Aquí trabajamos con compromiso, responsabilidad y dedicación para brindar el mejor servicio a nuestros usuarios.') {
      this.mensajeEmpresa = mensaje
      this.logoEmpresa = require('@/assets/img/Empresa.png')
    },

    getLogoUrl(path) {
      if (!path) return require('@/assets/img/Empresa.png')
      if (path.startsWith('http') || path.startsWith('data:')) return path
      return `${process.env.VUE_APP_AUTH_BASE_URL}${path}`
    }
  }
}
</script>


<style scoped>
.dashboard-container {
  min-height: 100vh; /* que ocupe mínimo el alto de la ventana */
  width: 100%;
  margin-left: 0px; /* Deja espacio fijo para el menú */
  overflow: auto; /* 🔹 Cambié de hidden a auto para permitir scroll e impresión */
  background: linear-gradient(135deg, #74ebd5, #9face6);
  animation: gradientShift 10s ease infinite;
  position: relative; /* IMPORTANTE para posicionar hijos con absolute */
  transition: all 0.3s ease; /* animación suave */

  /* Nuevo: flexbox para empujar footer */
  display: flex;
  flex-direction: column;
  align-items: center; /* centra horizontalmente todo */
}

/* Loader */
.loading-state {
  text-align: center;
  padding-top: 100px;
  font-size: 1.2em;
  color: #333;
}

.spinner {
  margin: 20px auto;
  width: 60px;
  height: 60px;
  border: 6px solid rgba(0, 0, 0, 0.1);
  border-top-color: #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Contenido con fade */
.fade-in {
  animation: fadeIn 0.6s ease-in-out;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  align-items: center; /* Centra horizontalmente todo el contenido */
  width: 100%;
}

/* Texto */
.welcome-text {
  text-align: center;
  font-size: 4rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  margin-top: -5px; /* ajusta según necesites espacio */
}

/* Subtítulo */
.subtitle-text {
  margin-top: -30px; /* espacio dinámico debajo del título */
  font-size: 1.5rem;
  font-weight: 500;
  color: #333;
  text-align: center;
}

/* Descripción */
.description-text {
  margin-top: -5px; /* espacio debajo del subtítulo */
  width: 60%;
  font-size: 1.2rem;
  color: #222;
  text-align: center;
  line-height: 1.8;
  background-color: rgba(255, 255, 255, 0.6);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 2px 2px 8px rgba(0,0,0,0.2);
}

/* Logo */
.logo-empresa {
  display: block;
  margin: 20px auto 20px auto; /* ahora el espacio depende del contenido de arriba */
  max-width: 400px;
  width: 80%;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Footer */
.page-footer {
  margin-top: auto; /* empuja el footer hacia abajo */
  text-align: center;
  font-size: 0.9rem;
  color: #333;
  opacity: 0.8;
}

/* Animación arcoíris */
@keyframes rainbow-text {
  0% { color: red; }
  16% { color: orange; }
  32% { color: yellow; }
  48% { color: green; }
  64% { color: blue; }
  80% { color: indigo; }
  100% { color: violet; }
}

.animate-rainbow-text {
  animation: rainbow-text 4s infinite linear;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 🔹 Ajustes para impresión */
@media print {
  .dashboard-container {
    height: auto !important;
    overflow: visible !important;
    background: white !important;
  }

  .welcome-text {
    font-size: 2rem !important;
    text-shadow: none !important;
    margin-top: 20px !important;
  }

  .subtitle-text,
  .description-text,
  .logo-empresa,
  .page-footer {
    position: static !important;
    transform: none !important;
    margin: 10px auto !important;
    width: 100% !important;
    box-shadow: none !important;
    background: none !important;
  }
}
</style>
