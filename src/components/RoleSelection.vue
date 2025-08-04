// src/components/RoleSelection.vue
<template>
  <div class="roleSelection">
    <h2>Seleccione su contexto</h2>
    <form @submit.prevent="confirmarSeleccion">
      <div>
        <label>Filial:</label>
        <select v-model="subsidiaryCode">
          <option v-for="s in subsidiaries" :key="s.subsidiaryCode" :value="s.subsidiaryCode">
            {{ s.subsidiaryName }}
          </option>
        </select>
      </div>

      <div>
        <label>Oficina:</label>
        <select v-model="branchCode">
          <option v-for="b in branches" :key="b.branchCode" :value="b.branchCode">
            {{ b.branchName }}
          </option>
        </select>
      </div>

      <div>
        <label>Rol:</label>
        <select v-model="rolCode">
          <option v-for="r in roles" :key="r.rolCode" :value="r.rolCode">
            {{ r.rolName }}
          </option>
        </select>
      </div>

      <button type="submit">Confirmar</button>
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
.role-selection {
  margin-top: 20px;
}
.role-selection div {
  margin-bottom: 10px;
}
</style>
