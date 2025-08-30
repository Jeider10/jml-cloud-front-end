// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/login/LoginView.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'
import ForgotPasswordView from '@/views/auth/forgotPassword/ForgotPasswordView.vue'
import RegisterUserView from '@/views/auth/registerUser/RegisterUserView.vue'
import NuevaVentaView from '@/components/ventas/NuevaVentaView.vue'

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
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
