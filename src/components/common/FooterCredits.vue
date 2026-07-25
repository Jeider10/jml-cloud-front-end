<template>
  <footer class="footer-credits">
    <p>Copyright &copy; {{ anioActual }} Creative Tim</p>
    <p>
      Desarrollado por Ing. Jeider Montiel |
      <a :href="whatsappLink" target="_blank" rel="noopener">WhatsApp</a> |
      <a :href="facebookLink" target="_blank" rel="noopener">Facebook</a> |
      <a :href="tiktokLink" target="_blank" rel="noopener">TikTok</a>
    </p>
  </footer>
</template>

<script>
export default {
  name: 'FooterCredits',
  data() {
    return {
      anioActual: new Date().getFullYear(),
      // Cambia estos valores por tus datos reales
      telefono: '573212365871',
      mensajeWhatsapp: 'Hola, me interesa obtener mas informacion.',
      facebookLink: 'https://www.facebook.com/jeider.montiel',
      tiktokLink: 'https://www.tiktok.com/@jeider.montiel'
    }
  },
  computed: {
    whatsappLink() {
      return 'https://wa.me/' + this.telefono + '?text=' + encodeURIComponent(this.mensajeWhatsapp)
    }
  }
}
</script>

<style scoped>
.footer-credits {
  text-align: center;
  padding: 10px;
  font-size: 12px;
  color: #666;
  margin-bottom: 0;
}
.footer-credits p {
  margin: 2px 0;
}
.footer-credits a {
  color: #0077b6;
  text-decoration: none;
  font-weight: 600;
}
.footer-credits a:hover {
  text-decoration: underline;
}
</style>
