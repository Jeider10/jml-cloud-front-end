<!-- src/components/common/DateRangePicker.vue -->
<!-- Componente de selector de rango de fechas estilo AWS CloudWatch -->

<template>
  <div class="date-range-wrapper">
    <!-- Boton que muestra el rango seleccionado -->
    <button type="button" class="date-range-btn" @click="togglePicker">
      📅 {{ displayRange }}
    </button>

    <!-- Panel desplegable -->
    <div v-if="pickerOpen" class="picker-overlay" @click.self="cancelar">
      <div class="picker-panel">

        <!-- Navegacion de meses -->
        <div class="calendars-header">
          <button type="button" class="nav-btn" @click="prevMonth">&lt;</button>

          <!-- Clic en mes izquierdo abre selector -->
          <span class="month-title clickable" @click="abrirSelectorMes('izquierdo')">
            {{ mesNombre(mesIzquierdo) }} {{ anioIzquierdo }}
          </span>

          <!-- Clic en mes derecho abre selector -->
          <span class="month-title clickable" @click="abrirSelectorMes('derecho')">
            {{ mesNombre(mesDerecho) }} {{ anioDerecho }}
          </span>

          <button type="button" class="nav-btn" @click="nextMonth">&gt;</button>
        </div>

        <!-- 🔹 Selector rápido de mes/año -->
        <div v-if="selectorMesVisible" class="selector-mes-overlay" @click.self="selectorMesVisible = false">
          <div class="selector-mes-panel">
            <!-- Selector de año -->
            <div class="selector-anio-row">
              <button type="button" class="nav-btn" @click="selectorAnio--">&lt;</button>
              <span class="selector-anio-label">{{ selectorAnio }}</span>
              <button type="button" class="nav-btn" @click="selectorAnio++">></button>
            </div>

            <!-- Grid de meses -->
            <div class="selector-meses-grid">
              <button
                  v-for="(nombre, idx) in mesesCortos"
                  :key="idx"
                  type="button"
                  :class="['selector-mes-btn', { activo: idx === selectorMesActivo }]"
                  @click="seleccionarMesRapido(idx)">
                {{ nombre }}
              </button>
            </div>
          </div>
        </div>

        <!-- Dos calendarios lado a lado -->
        <div class="calendars-row">
          <!-- Calendario izquierdo -->
          <div class="calendar">
            <div class="weekdays">
              <span v-for="d in diasSemana" :key="d">{{ d }}</span>
            </div>
            <div class="days-grid">
              <span v-for="(day, i) in diasMesIzquierdo" :key="'l-'+i"
                    :class="dayClass(day, 'left')"
                    @click="day.num ? seleccionarDia(day.date) : null">
                {{ day.num || '' }}
              </span>
            </div>
          </div>

          <!-- Calendario derecho -->
          <div class="calendar">
            <div class="weekdays">
              <span v-for="d in diasSemana" :key="d">{{ d }}</span>
            </div>
            <div class="days-grid">
              <span v-for="(day, i) in diasMesDerecho" :key="'r-'+i"
                    :class="dayClass(day, 'right')"
                    @click="day.num ? seleccionarDia(day.date) : null">
                {{ day.num || '' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Inputs de fecha y hora -->
        <div class="datetime-inputs">
          <div class="dt-group">
            <label>Fecha de inicio</label>
            <input type="text" v-model="inputFechaInicio" placeholder="yyyy/MM/dd" @change="parsearInputInicio" />
          </div>
          <div class="dt-group">
            <label>Hora de inicio</label>
            <input type="text" v-model="inputHoraInicio" placeholder="HH:mm:ss" @change="parsearInputInicio" />
          </div>
          <div class="dt-group">
            <label>Fecha de fin</label>
            <input type="text" v-model="inputFechaFin" placeholder="yyyy/MM/dd" @change="parsearInputFin" />
          </div>
          <div class="dt-group">
            <label>Hora de fin</label>
            <input type="text" v-model="inputHoraFin" placeholder="HH:mm:ss" @change="parsearInputFin" />
          </div>
        </div>

        <p class="hint">Formato fecha: yyyy/MM/dd. Formato hora: HH:mm:ss (24h)</p>

        <!-- Botones -->
        <div class="picker-actions">
          <button type="button" class="btn-cancelar" @click="cancelar">Cancelar</button>
          <button type="button" class="btn-aplicar" @click="aplicar" :disabled="!rangoValido">Aplicar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DateRangePicker',

  props: {
    // Valores iniciales opcionales
    inicioDefault: { type: String, default: '' },
    finDefault: { type: String, default: '' }
  },

  emits: ['aplicar', 'cancelar'],

  data() {
    const hoy = new Date()
    return {
      pickerOpen: false,
      // Mes visible (izquierdo)
      mesIzquierdo: hoy.getMonth(),
      anioIzquierdo: hoy.getFullYear(),
      // Seleccion
      fechaInicioSel: null, // Date object
      fechaFinSel: null,    // Date object
      // Inputs manuales
      inputFechaInicio: '',
      inputHoraInicio: '00:00:00',
      inputFechaFin: '',
      inputHoraFin: '23:59:59',
      // Estado de seleccion (primer clic = inicio, segundo = fin)
      seleccionando: 'inicio',
      diasSemana: ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'],
      // 🔹 Selector rápido de mes/año
      selectorMesVisible: false,
      selectorAnio: new Date().getFullYear(),
      selectorMesActivo: new Date().getMonth(),
      selectorLado: 'izquierdo', // cual calendario se está editando
      mesesCortos: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    }
  },

  computed: {
    mesDerecho() {
      return this.mesIzquierdo === 11 ? 0 : this.mesIzquierdo + 1
    },
    anioDerecho() {
      return this.mesIzquierdo === 11 ? this.anioIzquierdo + 1 : this.anioIzquierdo
    },

    diasMesIzquierdo() {
      return this.generarDiasMes(this.anioIzquierdo, this.mesIzquierdo)
    },
    diasMesDerecho() {
      return this.generarDiasMes(this.anioDerecho, this.mesDerecho)
    },

    rangoValido() {
      return this.fechaInicioSel && this.fechaFinSel && this.fechaInicioSel <= this.fechaFinSel
    },

    displayRange() {
      if (!this.fechaInicioSel || !this.fechaFinSel) return 'Seleccionar rango de fechas'
      const fi = this.formatDateTimeDisplay(this.fechaInicioSel, this.inputHoraInicio)
      const ff = this.formatDateTimeDisplay(this.fechaFinSel, this.inputHoraFin)
      return `${fi}  >  ${ff}`
    }
  },

  methods: {
    togglePicker() {
      this.pickerOpen = !this.pickerOpen
    },

    prevMonth() {
      if (this.mesIzquierdo === 0) {
        this.mesIzquierdo = 11
        this.anioIzquierdo--
      } else {
        this.mesIzquierdo--
      }
    },

    nextMonth() {
      if (this.mesIzquierdo === 11) {
        this.mesIzquierdo = 0
        this.anioIzquierdo++
      } else {
        this.mesIzquierdo++
      }
    },

    mesNombre(mes) {
      const nombres = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
      return nombres[mes]
    },

    generarDiasMes(anio, mes) {
      const primerDia = new Date(anio, mes, 1)
      const ultimoDia = new Date(anio, mes + 1, 0)
      const totalDias = ultimoDia.getDate()

      // Dia de la semana del primer dia (0=dom, 1=lun, ..., 6=sab)
      // Convertir a lunes=0
      let startDay = primerDia.getDay() - 1
      if (startDay < 0) startDay = 6

      const dias = []

      // Espacios vacios antes del primer dia
      for (let i = 0; i < startDay; i++) {
        dias.push({ num: null, date: null })
      }

      // Dias del mes
      for (let d = 1; d <= totalDias; d++) {
        dias.push({ num: d, date: new Date(anio, mes, d) })
      }

      return dias
    },

    seleccionarDia(date) {
      if (!date) return

      if (this.seleccionando === 'inicio') {
        this.fechaInicioSel = date
        this.fechaFinSel = null
        this.inputFechaInicio = this.formatDateInput(date)
        this.inputFechaFin = ''
        this.seleccionando = 'fin'
      } else {
        // Si la fecha fin es anterior a inicio, intercambiar
        if (date < this.fechaInicioSel) {
          this.fechaFinSel = this.fechaInicioSel
          this.fechaInicioSel = date
          this.inputFechaInicio = this.formatDateInput(date)
          this.inputFechaFin = this.formatDateInput(this.fechaFinSel)
        } else {
          this.fechaFinSel = date
          this.inputFechaFin = this.formatDateInput(date)
        }
        this.seleccionando = 'inicio'
      }
    },

    dayClass(day) {
      if (!day.num) return 'day empty'

      const classes = ['day']
      const d = day.date

      if (this.fechaInicioSel && this.isSameDay(d, this.fechaInicioSel)) {
        classes.push('selected-start')
      }
      if (this.fechaFinSel && this.isSameDay(d, this.fechaFinSel)) {
        classes.push('selected-end')
      }
      if (this.fechaInicioSel && this.fechaFinSel && d > this.fechaInicioSel && d < this.fechaFinSel) {
        classes.push('in-range')
      }

      // Hoy
      const hoy = new Date()
      if (this.isSameDay(d, hoy)) {
        classes.push('today')
      }

      return classes.join(' ')
    },

    isSameDay(a, b) {
      return a.getFullYear() === b.getFullYear() &&
          a.getMonth() === b.getMonth() &&
          a.getDate() === b.getDate()
    },

    formatDateInput(date) {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}/${m}/${d}`
    },

    formatDateTimeDisplay(date, hora) {
      return `${this.formatDateInput(date)}T${hora}`
    },

    parsearInputInicio() {
      const parsed = this.parseDateString(this.inputFechaInicio)
      if (parsed) this.fechaInicioSel = parsed
    },

    parsearInputFin() {
      const parsed = this.parseDateString(this.inputFechaFin)
      if (parsed) this.fechaFinSel = parsed
    },

    parseDateString(str) {
      if (!str) return null
      const parts = str.split('/')
      if (parts.length !== 3) return null
      const y = parseInt(parts[0])
      const m = parseInt(parts[1]) - 1
      const d = parseInt(parts[2])
      if (isNaN(y) || isNaN(m) || isNaN(d)) return null
      return new Date(y, m, d)
    },

    aplicar() {
      if (!this.rangoValido) return

      // Formato ISO sin espacios: yyyy-MM-ddTHH:mm:ss (evita problemas con encoding de URL)
      const inicio = this.inputFechaInicio.replace(/\//g, '-') + 'T' + this.inputHoraInicio
      const fin = this.inputFechaFin.replace(/\//g, '-') + 'T' + this.inputHoraFin

      this.$emit('aplicar', { fechaInicio: inicio, fechaFin: fin })
      this.pickerOpen = false
    },

    cancelar() {
      this.pickerOpen = false
      this.$emit('cancelar')
    },

    // 🔹 Abrir selector rápido de mes/año
    abrirSelectorMes(lado) {
      this.selectorLado = lado
      if (lado === 'izquierdo') {
        this.selectorAnio = this.anioIzquierdo
        this.selectorMesActivo = this.mesIzquierdo
      } else {
        this.selectorAnio = this.anioDerecho
        this.selectorMesActivo = this.mesDerecho
      }
      this.selectorMesVisible = true
    },

    // 🔹 Seleccionar un mes desde el grid
    seleccionarMesRapido(mesIdx) {
      // El calendario izquierdo define la navegación
      if (this.selectorLado === 'izquierdo') {
        this.mesIzquierdo = mesIdx
        this.anioIzquierdo = this.selectorAnio
      } else {
        // Si seleccionan en el derecho, el izquierdo es un mes antes
        if (mesIdx === 0) {
          this.mesIzquierdo = 11
          this.anioIzquierdo = this.selectorAnio - 1
        } else {
          this.mesIzquierdo = mesIdx - 1
          this.anioIzquierdo = this.selectorAnio
        }
      }
      this.selectorMesVisible = false
    }
  }
}
</script>

<style scoped>
.date-range-wrapper {
  position: relative;
  display: inline-block;
}

.date-range-btn {
  padding: 6px 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.date-range-btn:hover { background: #f0f0f0; }

.picker-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.picker-panel {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  min-width: 560px;
  position: relative; /* Para posicionar el selector de meses encima */
}

.calendars-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.nav-btn {
  background: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
  font-weight: bold;
}
.nav-btn:hover { background: #eee; }

.month-title {
  font-weight: bold;
  font-size: 14px;
  text-transform: capitalize;
}

.month-title.clickable {
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 6px;
  transition: background 0.15s;
}
.month-title.clickable:hover {
  background: #e0f7fa;
  color: #005f8a;
}

/* 🔹 Selector rápido de mes/año */
.selector-mes-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 10px;
}

.selector-mes-panel {
  background: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  min-width: 280px;
}

.selector-anio-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.selector-anio-label {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.selector-meses-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.selector-mes-btn {
  padding: 10px 6px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
}
.selector-mes-btn:hover {
  background: #e0f7fa;
  border-color: #0077b6;
}
.selector-mes-btn.activo {
  background: #0077b6;
  color: white;
  border-color: #0077b6;
}

.calendars-row {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.calendar {
  width: 250px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 11px;
  font-weight: bold;
  color: #666;
  margin-bottom: 4px;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  gap: 2px;
}

.day {
  padding: 6px 2px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.15s;
}
.day:hover:not(.empty) { background: #e0f7fa; }
.day.empty { cursor: default; }
.day.today { font-weight: bold; color: #0077b6; }
.day.selected-start { background: #0077b6; color: white; border-radius: 4px 0 0 4px; }
.day.selected-end { background: #0077b6; color: white; border-radius: 0 4px 4px 0; }
.day.in-range { background: #b3e5fc; }

.datetime-inputs {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: center;
}

.dt-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dt-group label {
  font-size: 11px;
  font-weight: bold;
  color: #333;
}
.dt-group input {
  padding: 5px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 12px;
  width: 110px;
  text-align: center;
}

.hint {
  font-size: 10px;
  color: #888;
  text-align: center;
  margin-top: 8px;
}

.picker-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.btn-cancelar {
  padding: 6px 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-weight: 600;
}
.btn-cancelar:hover { background: #f5f5f5; }

.btn-aplicar {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  background: #f4a261;
  color: white;
  cursor: pointer;
  font-weight: 600;
}
.btn-aplicar:hover { background: #e76f51; }
.btn-aplicar:disabled { background: #ccc; cursor: not-allowed; }
</style>
