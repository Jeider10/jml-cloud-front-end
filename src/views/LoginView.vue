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
  </div>
  <div
  v-if="error" style="color: red">{{ error }}
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
      try {
        const response = await login(this.username, this.password)
        const token = response.data.token

        localStorage.setItem('token', token)
        this.$router.push('/dashboard') // 👈 redirección

      } catch (error) {
        this.errorMessage = '❌ Usuario o contraseña incorrectos'
        console.error('Error en login:', error)
      }
    }
  }
}
</script>

<style scoped>
.login {
  max-width: 400px;
  margin: auto;
  padding-top: 40px;
}
form div {
  margin-bottom: 12px;
}
</style>
