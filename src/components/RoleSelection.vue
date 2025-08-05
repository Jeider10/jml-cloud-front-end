<!-- src/components/RoleSelection.vue -->

<template>
  <div class="roleSelection">
    <h2>Seleccione su contexto</h2>
    <form @submit.prevent="confirmarSeleccion">
      <div class="form-group">
        <label for="subsidiary">Filial:</label>
        <select id="subsidiary" v-model="subsidiaryCode">
          <option v-for="s in subsidiaries" :key="s.subsidiaryCode" :value="s.subsidiaryCode">
            {{ s.subsidiaryName }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="branch">Oficina:</label>
        <select id="branch" v-model="branchCode">
          <option v-for="b in branches" :key="b.branchCode" :value="b.branchCode">
            {{ b.branchName }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="role">Rol:</label>
        <select id="role" v-model="rolCode">
          <option v-for="r in roles" :key="r.rolCode" :value="r.rolCode">
            {{ r.rolName }}
          </option>
        </select>
      </div>

      <button type="submit" class="submit-button">Confirmar</button>
    </form>
  </div>
</template>

<script>
import { confirmarSeleccion } from '@/services/authService'

export default {
  name: 'RoleSelectionView',
  data() {
    return {
      subsidiaries: [],
      branches: [],
      roles: [],
      subsidiaryCode: null,
      branchCode: null,
      rolCode: null
    }
  },
  mounted() {
    const options = JSON.parse(localStorage.getItem('authOptions'))
    this.subsidiaries = options.subsidiaries || []
    this.branches = options.branches || []
    this.roles = options.roles || []
  },
  methods: {
    async confirmarSeleccion() {
      const token = localStorage.getItem('sessionToken')
      const username = localStorage.getItem('authUsername')

      const body = {
        sessionToken: token,
        authentication: {
          authenticationUserLogin: username
        },
        subsidiaryCodeSelection: {
          subsidiaryCodeDto: this.subsidiaryCode,
          subsidiaryNameDto: this.subsidiaries.find(s => s.subsidiaryCode === this.subsidiaryCode)?.subsidiaryName
        },
        branchCodeSelection: {
          branchCodeDto: this.branchCode,
          branchNameDto: this.branches.find(b => b.branchCode === this.branchCode)?.branchName
        },
        rolCodeSelection: {
          rolCodeDto: this.rolCode,
          rolNameDto: this.roles.find(r => r.rolCode === this.rolCode)?.rolName
        }
      }

      try {
        await confirmarSeleccion(body)
        localStorage.setItem('token', token)
        this.$router.push('/dashboard')
      } catch (err) {
        alert('❌ Error al confirmar: ' + err.message)
      }
    }
  }
}
</script>

<style scoped>
.roleSelection {
  max-width: 400px;
  margin: 40px auto;
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #555;
}

select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.submit-button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #0056b3;
}

</style>
