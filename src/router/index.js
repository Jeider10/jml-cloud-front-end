// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/login/LoginView.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'
import ForgotPasswordView from '@/views/auth/forgotPassword/ForgotPasswordView.vue'
import RegisterUserView from '@/views/auth/registerUser/RegisterUserView.vue'
import NuevaVentaView from '@/components/ventas/NuevaVentaView.vue'
import ClientesView from '@/components/clientes/ClientesView.vue'
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
import ConfiguracionRegistroRolesView from '@/components/configuracion/ConfiguracionRegistroRolesView.vue'
import ConfiguracionRegistroUsuariosView from '@/components/configuracion/ConfiguracionRegistroUsuariosView.vue'
import ConfiguracionActualizarUsuarioView from '@/components/configuracion/ConfiguracionActualizarUsuarioView.vue'
import ConfiguracionActualizarRoleView from '@/components/configuracion/ConfiguracionActualizarRoleView.vue'

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
    path: '/clientes',
    name: 'ClientesView',
    component: ClientesView
  },
  {
    path: '/registro-cliente',
    name: 'RegistroClienteView',
    component: RegistroClienteView
  },
  {
    path: '/actualizar-cliente/:identificacion',
    name: 'ActualizarClienteView',
    component: ActualizarClienteView,
    props: true   // 👈 Esto hace que "identificacion" llegue como prop
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
    path: '/actualizar-proveedor/:codigoSucursal',
    name: 'ActualizarProveedorView',
    component: ActualizarProveedorView,
    props: true   // 👈 Esto hace que "codigoSucursal" llegue como prop
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
    path: '/configuracion-empresa-usuario',
    name: 'ConfiguracionUsuariosEmpresaView',
    component: ConfiguracionUsuariosEmpresaView
  },
  {
    path: '/registro/roles',
    name: 'ConfiguracionRegistroRolesView',
    component: ConfiguracionRegistroRolesView
  },
  {
    path: '/actualizar-roles/:roleCode',
    name: 'ConfiguracionActualizarRoleView',
    component: ConfiguracionActualizarRoleView,
    props: true   // 👈 Esto hace que "roleCode" llegue como prop
  },
  {
    path: '/registro/usuarios',
    name: 'ConfiguracionRegistroUsuariosView',
    component: ConfiguracionRegistroUsuariosView
  },
  {
    path: '/actualizar/usuarios/:identificacion',
    name: 'ConfiguracionActualizarUsuarioView',
    component: ConfiguracionActualizarUsuarioView,
    props: true   // 👈 Esto hace que "identificacion" llegue como prop
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
