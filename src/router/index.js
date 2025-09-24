// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/login/LoginView.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'
import ForgotPasswordView from '@/views/auth/forgotPassword/ForgotPasswordView.vue'
import RegisterUserView from '@/views/auth/registerUser/RegisterUserView.vue'
import NuevaVentaView from '@/components/ventas/NuevaVentaView.vue'
import RegistroClienteView from '@/components/clientes/RegistroClienteView.vue'
import ActualizarClienteView from '@/components/clientes/ActualizarClienteView.vue'
import RegistroProveedorView from '@/components/proveedores/RegistroProveedorView.vue'
import ProveedoresView from '@/components/proveedores/ProveedoresView.vue'
import ActualizarProveedorView from '@/components/proveedores/ActualizarProveedorView.vue'
import RegistroProductosView from '@/components/productos/RegistroProductosView.vue'
import ProductosView from '@/components/productos/ProductosView.vue'
import ActualizarProductosView from '@/components/productos/ActualizarProductosView.vue'
import HistorialVentasView from '@/components/ventas/HistorialVentasView.vue'
import ConfiguracionEmpresaView from '@/components/configuracion/ConfiguracionEmpresaView.vue'
import ConfiguracionUsuariosEmpresaView from '@/components/configuracion/ConfiguracionUsuariosEmpresaView.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPasswordView
  },
  {
    path: '/register-user',
    name: 'RegisterUserView',
    component: RegisterUserView
  },
  {
    path: '/nueva-venta',
    name: 'NuevaVentaView',
    component: NuevaVentaView
  },
  {
    path: '/registro-cliente',
    name: 'RegistroClienteView',
    component: RegistroClienteView
  },
  {
    path: '/actualizar-cliente',
    name: 'ActualizarClienteView',
    component: ActualizarClienteView
  },
  {
    path: '/registro-proveedor',
    name: 'RegistroProveedorView',
    component: RegistroProveedorView
  },
  {
    path: '/proveedores',
    name: 'ProveedoresView',
    component: ProveedoresView
  },
  {
    path: '/actualizar-proveedor',
    name: 'ActualizarProveedorView',
    component: ActualizarProveedorView
  },
  {
    path: '/registro-productos',
    name: 'RegistroProductosView',
    component: RegistroProductosView
  },
  {
    path: '/productos',
    name: 'ProductosView',
    component: ProductosView
  },
  {
    path: '/actualizar-productos/:codigo',
    name: 'ActualizarProductosView',
    component: ActualizarProductosView,
    props: true   // 👈 Esto hace que "codigo" llegue como prop
  },
  {
    path: '/historial-ventas',
    name: 'HistorialVentasView',
    component: HistorialVentasView
  },
  {
    path: '/configuracion-empresa',
    name: 'ConfiguracionEmpresaView',
    component: ConfiguracionEmpresaView
  },
  {
    path: '/registrar-usuario-empresa',
    name: 'ConfiguracionUsuariosEmpresaView',
    component: ConfiguracionUsuariosEmpresaView
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
