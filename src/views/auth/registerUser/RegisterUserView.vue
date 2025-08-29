<!-- src/views/auth/RegisterUserView.vue -->

<template>
  <div class="register-container">
    <div class="register-box">
      <h1>Registrar nuevo usuario</h1>

      <form @submit.prevent="handleRegister">
        <!-- Usuario -->
        <div class="form-group">
          <label for="username">Usuario:</label>
          <input
            type="text"
            id="username"
            v-model="user.userName"
            placeholder="Ingrese nombre de usuario"
            required
          />
        </div>

        <!-- Contraseña -->
        <div class="form-group">
          <label for="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            v-model="user.password"
            placeholder="Ingrese contraseña"
            required
          />
        </div>

        <!-- Código de Rol -->
        <div class="form-group">
          <label for="rolCode">Código de Rol:</label>
          <input
            type="number"
            id="rolCode"
            v-model.number="user.rolCode"
            min="1"
            step="1"
            placeholder="Ingrese código de rol"
            required
          />
        </div>

        <!-- Correo Electrónico -->
        <div class="form-group">
          <label for="email">Correo electrónico:</label>
          <input
            type="email"
            id="email"
            v-model="user.email"
            placeholder="Ingrese correo electrónico"
          />
        </div>

        <button type="submit" class="register-button">Registrar</button>
      </form>

      <!-- Mensajes -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <p class="back-to-login">
        <router-link to="/login">Volver al login</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { registerUser } from '@/services/authService'

export default {
  name: "RegisterUserView",
  data() {
    return {
      user: {
        userName: "",
        password: "",
        rolCode: null,
        email: ""
      },
      errorMessage: "",
      successMessage: ""
    };
  },
  methods: {
    async handleRegister() {
      this.errorMessage = "";
      this.successMessage = "";

      try {
        const response = await registerUser(this.user)
        console.log("✅ Usuario registrado:", response.data)
        this.successMessage = "✅ Usuario registrado correctamente"

        // limpiar formulario
        this.user = {
          userName: "",
          password: "",
          rolCode: null,
          email: ""
        }
      } catch (err) {
        console.error("❌ Error al registrar usuario:", err);
        if (err.response && err.response.status === 409) {
          this.errorMessage = "⚠️ El usuario ya existe con ese rol";
        } else {
          this.errorMessage = "❌ Ocurrió un error al registrar el usuario";
        }
      }
    }
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 20px;
}

.register-box {
  background-color: white;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 400px;
}

.register-box h1 {
  margin-bottom: 24px;
  font-size: 26px;
  color: #34495e;
  text-align: center;
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

.register-button {
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

.register-button:hover {
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
