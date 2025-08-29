<!-- src/views/auth/ForgotPasswordView.vue -->

<template>
  <div class="forgot-password-container">
    <div class="forgot-box">
      <h1>Restablecer contraseña</h1>

      <div v-if="step === 1">
        <form @submit.prevent="handleUsername">
          <div class="form-group">
            <label for="username">Usuario:</label>
            <input type="text" id="username" v-model="username" required />
          </div>
          <button type="submit" class="login-button">Siguiente</button>
        </form>
      </div>

      <div v-else-if="step === 2">
        <p>Usuario: <strong>{{ username }}</strong></p>
        <form @submit.prevent="handleUpdatePassword">
          <div class="form-group">
            <label for="newPassword">Nueva contraseña:</label>
            <input type="password" id="newPassword" v-model="newPassword" required />
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirmar contraseña:</label>
            <input type="password" id="confirmPassword" v-model="confirmPassword" required />
          </div>
          <button type="submit" class="login-button">Actualizar contraseña</button>
        </form>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <!-- Botón volver al login -->
      <p class="back-to-login">
        <router-link to="/login">Volver al login</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ForgotPasswordView',
  data() {
    return {
      step: 1,
      username: '',
      newPassword: '',
      confirmPassword: '',
      errorMessage: '',
      successMessage: ''
    }
  },
  methods: {
    async handleUsername() {
      if (!this.username) {
        this.errorMessage = 'Debe ingresar un usuario';
        return;
      }
      this.errorMessage = '';

      try {
        // Validar que el usuario exista
        const response = await axios.post(
          `${process.env.VUE_APP_AUTH_BASE_URL}/user/search-by-user-name`,
          { userName: this.username },
          { headers: { 'Content-Type': 'application/json' } }
        );

        // Si la respuesta trae data, el usuario existe
        if (!response.data) {
          this.errorMessage = 'El usuario no existe';
          return;
        }

        // Usuario existe, avanzar al paso 2
        this.step = 2;

      } catch (err) {
        console.error(err);
        if (err.response && err.response.status === 404) {
          this.errorMessage = 'El usuario no existe';
        } else {
          this.errorMessage = 'Ocurrió un error al buscar el usuario';
        }
      }
    },
    async handleUpdatePassword() {
      this.errorMessage = '';
      this.successMessage = '';

      if (!this.newPassword || !this.confirmPassword) {
        this.errorMessage = 'Ambos campos de contraseña son obligatorios';
        return;
      }
      if (this.newPassword !== this.confirmPassword) {
        this.errorMessage = 'Las contraseñas no coinciden';
        return;
      }

      try {
        const payload = {
          userName: this.username,
          password: this.newPassword
        }
        // Llamada al micro de autenticación para actualizar contraseña
        await axios.put(
          `${process.env.VUE_APP_AUTH_BASE_URL}/user/forgot-password`,
          payload
        )
        this.successMessage = 'Contraseña actualizada correctamente';
        // Opcional: redirigir al login
        setTimeout(() => {
          this.$router.push('/login');
        }, 2000);
      } catch (err) {
        console.error(err)
        this.errorMessage = 'Ocurrió un error al actualizar la contraseña';
      }
    }
  }
}
</script>

<style scoped>
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 20px;
}

.forgot-box {
  background-color: white;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 400px;
}

.forgot-box h1 {
  margin-bottom: 24px;
  font-size: 26px;
  color: #34495e;
}

.form-group {
  margin-bottom: 16px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
}

.form-group input {
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

.success-message {
  margin-top: 20px;
  color: #2ecc71;
  font-weight: bold;
  text-align: center;
}

.back-to-login {
  margin-top: 16px;
  text-align: center;
}
</style>
