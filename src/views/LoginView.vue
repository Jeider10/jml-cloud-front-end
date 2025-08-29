<!-- src/views/LoginView.vue -->

<template>
  <div class="login-container">
    <div class="login-box">
      <h1>Iniciar sesión</h1>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Usuario:</label>
          <input type="text" id="username" v-model="username" required />
        </div>
        <div class="form-group">
          <label for="password">Contraseña:</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <button type="submit" class="login-button">Entrar</button>
      </form>

      <!-- 🔴 Mensaje de error -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- 🔹 Enlaces adicionales -->
      <div class="login-links">
        <p>
          <router-link to="/forgot-password">¿Olvidaste tu contraseña?</router-link>
        </p>
        <p>
          <router-link to="/register-user">Registrar nuevo usuario</router-link>
        </p>
      </div>

      <!-- 🔹 Botón salir -->
      <div class="exit-button-container">
        <button class="exit-button" @click="handleExit">Salir</button>
      </div>
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
        const { authorization } = response.data

        // Guarda datos temporalmente (o usa Vuex)
        localStorage.setItem('sessionToken', authorization)
        localStorage.setItem('authUsername', this.username)

        // Redirige directo al dashboard
        this.$router.push('/dashboard')
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
    },
    handleExit() {
      // Aquí decides qué quieres que haga:
      // ejemplo cerrar pestaña o ir a otra ruta
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
/* Ajuste general */
* {
  box-sizing: border-box;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 20px;
  animation: fadeIn 0.6s ease-in;
  overflow: auto; /* Solo aparece scroll si es necesario */
}

.login-box {
  background-color: white;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 400px;
  transition: all 0.3s ease-in-out;
  position: relative; /* 👈 necesario para ubicar el botón abajo */
}

.login-box h1 {
  margin-bottom: 24px;
  font-size: 26px;
  color: #34495e;
}

.login-form .form-group {
  margin-bottom: 16px;
  text-align: left;
}

.login-form label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
  color: #2c3e50;
}

.login-form input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 16px;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease-in-out;
}

.login-button:hover {
  background-color: #2980b9;
}

.error-message {
  margin-top: 20px;
  color: #e74c3c;
  font-weight: bold;
  text-align: center;
}

.login-links {
  margin-top: 16px;
  text-align: center;
}

.login-links p {
  margin: 6px 0;
}

.login-links a {
  color: #3498db;
  text-decoration: none;
  font-weight: bold;
}

.login-links a:hover {
  text-decoration: underline;
}

/* 🔹 Botón salir en esquina inferior derecha */
.exit-button-container {
  position: absolute;
  bottom: 8px;
  right: 8px;
}

.exit-button {
  padding: 6px 12px;
  background-color: #ffffff; /* blanco */
  color: #3498db; /* Azul marino oscuro */
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.3s ease-in-out;
}

.exit-button:hover {
  background-color: #ffffff; /* blanco */
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
  }

  .login-box h1 {
    font-size: 22px;
  }

  .login-button {
    font-size: 14px;
  }
}
</style>
