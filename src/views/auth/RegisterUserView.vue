<!-- src/views/auth/RegisterUserView.vue -->

<template>
  <div class="register-view flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
      <h2 class="text-2xl font-bold text-center mb-6 text-gray-800">Registrar Nuevo Usuario</h2>

      <form @submit.prevent="registrarUsuario">
        <!-- Usuario -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
          <input
            v-model="user.userName"
            type="text"
            placeholder="Ingrese nombre de usuario"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
        </div>

        <!-- Contraseña -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            v-model="user.password"
            type="password"
            placeholder="Ingrese contraseña"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
        </div>

        <!-- Código de Rol -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Código de Rol</label>
          <input
            v-model.number="user.rolCode"
            type="number"
            min="1"
            step="1"
            @input="user.rolCode = Math.floor(user.rolCode)"
            placeholder="Ingrese código de rol"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
        </div>

        <!-- Correo Electrónico -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">Correo</label>
          <input
            v-model="user.email"
            type="email"
            placeholder="Ingrese correo electrónico"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <!-- Botón Registrar -->
        <button type="submit" class="login-button">
          Registrar
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import axios from "axios";

// Estado reactivo para el formulario
const user = reactive({
  userName: "",
  password: "",
  rolCode: null,
  email: ""
});

// Función de registro de usuario
const registrarUsuario = async () => {
  try {
    const response = await axios.post(
      `${import.meta.env.VUE_APP_AUTH_BASE_URL}/user/register`,
      user,
      { headers: { 'Content-Type': 'application/json' } }
    );

    alert("✅ Usuario registrado correctamente");
    console.log(response.data);

    // Limpiar campos
    user.userName = "";
    user.password = "";
    user.rolCode = null;
    user.email = "";

  } catch (error) {
    console.error("❌ Error al registrar usuario:", error);

    if (error.response && error.response.status === 409) {
      alert("⚠️ El usuario ya existe con ese rol.");
    } else {
      alert("❌ Error al registrar el usuario.");
    }
  }
};
</script>

<style scoped>
.register-view {
  font-family: 'Inter', sans-serif;
}

input::placeholder {
  color: #a0aec0;
}

button {
  font-weight: 600;
}

.bg-white {
  background-color: #ffffff;
}

.shadow-lg {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.rounded-2xl {
  border-radius: 1rem;
}

/* Estilo uniforme para el botón login/registrar */
.login-button {
  width: 100%;
  background-color: #3b82f6; /* azul */
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #2563eb; /* azul más oscuro */
}
</style>
