// src/views/LoginView.vue
<template>
  <div class="loginView">
    <h1>Iniciar sesión</h1>
    <form @submit.prevent="handleLogin">
      <div>
        <label for="username">Usuario:</label>
        <input type="text" id="username" v-model="username" required />
      </div>
      <div>
        <label for="password">Contraseña:</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit">Entrar</button>
    </form>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import { login } from '@/services/authService'

export default {
  name: 'LoginView',
  data() {
    return {
      username: '',
      password: '',
      errorMessage: ''
    }
  },
  methods: {
    async handleLogin() {
      this.errorMessage = ''
      try {
        const response = await login(this.username, this.password)
        const { authorization, options } = response.data

        // Guarda datos temporalmente (o usa Vuex)
        localStorage.setItem('sessionToken', authorization)
        localStorage.setItem('authUsername', this.username)
        localStorage.setItem('authOptions', JSON.stringify(options))

        // Redirige a pantalla de selección
        this.$router.push('/role-selection')
      } catch (error) {
        console.error('❌ Error en login:', error)

        if (!error.response) {
          // 🔴 No hay respuesta del servidor (API caída, timeout, CORS, etc.)
          this.errorMessage = 'No se puede conectar con el servicio de autenticación. Por favor contacte al administrador del sistema.'
        } else if (error.response.status === 401) {
          // ❌ Credenciales inválidas
          this.errorMessage = 'Usuario o contraseña incorrectos.'
        } else {
          // ⚠️ Otro error inesperado
          this.errorMessage = 'Ocurrió un error inesperado. Intente nuevamente.'
        }
      }
    }
  }
}
</script>

<style scoped>
.loginView {
  max-width: 400px;
  margin: auto;
  padding-top: 40px;
}
form div {
  margin-bottom: 12px;
}
.error-message {
  margin-top: 20px;
  color: red;
}
</style>
