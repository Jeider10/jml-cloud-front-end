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
import ActualizarProveedorView from '@/components/proveedores/ActualizarProveedorView.vue'

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
    path: '/actualizar-proveedor',
    name: 'ActualizarProveedorView',
    component: ActualizarProveedorView
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
