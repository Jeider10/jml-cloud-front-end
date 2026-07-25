// src/router/index.js

import { createRouter, createWebHistory } from "vue-router";
import { sessionData } from "@/services/sessionService";
import LoginView from "@/views/auth/login/LoginView.vue";
import DashboardView from "@/views/dashboard/DashboardView.vue";
import ForgotPasswordView from "@/views/auth/forgotPassword/ForgotPasswordView.vue";
import RegisterUserView from "@/views/auth/registerUser/RegisterUserView.vue";
import NuevaVentaView from "@/components/ventas/NuevaVentaView.vue";
import ClientesView from "@/components/clientes/ClientesView.vue";
import RegistroClienteView from "@/components/clientes/RegistroClienteView.vue";
import ActualizarClienteView from "@/components/clientes/ActualizarClienteView.vue";
import RegistroProveedorView from "@/components/proveedores/RegistroProveedorView.vue";
import ProveedoresView from "@/components/proveedores/ProveedoresView.vue";
import ActualizarProveedorView from "@/components/proveedores/ActualizarProveedorView.vue";
import RegistroProductosView from "@/components/productos/RegistroProductosView.vue";
import ProductosView from "@/components/productos/ProductosView.vue";
import ActualizarProductosView from "@/components/productos/ActualizarProductosView.vue";
import HistorialVentasView from "@/components/ventas/HistorialVentasView.vue";
import ConfiguracionEmpresaView from "@/components/configuracion/ConfiguracionEmpresaView.vue";
import ConfiguracionEmpresaUsuariosView from "@/components/configuracion/usuarios/ConfiguracionEmpresaUsuariosView.vue";
import ConfiguracionEmpresaRegistroRolesView from "@/components/configuracion/roles/ConfiguracionEmpresaRegistroRolesView.vue";
import ConfiguracionEmpresaActualizarRoleView from "@/components/configuracion/roles/ConfiguracionEmpresaActualizarRoleView.vue";
import ConfiguracionEmpresaRegistroUsuariosView from "@/components/configuracion/usuarios/ConfiguracionEmpresaRegistroUsuariosView.vue";
import ConfiguracionEmpresaActualizarUsuarioView from "@/components/configuracion/usuarios/ConfiguracionEmpresaActualizarUsuarioView.vue";
import ConfiguracionUsuarioView from "@/components/configuracion/usuario/ConfiguracionUsuarioView.vue";
import ConfiguracionActualizarUsuarioView from "@/components/configuracion/usuario/ConfiguracionActualizarUsuarioView.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: LoginView,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardView,
    meta: { requiresAuth: true }, // ✅ protegida
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: ForgotPasswordView,
  },
  {
    path: "/register-user",
    name: "RegisterUserView",
    component: RegisterUserView,
  },
  {
    path: "/nueva-venta",
    name: "NuevaVentaView",
    component: NuevaVentaView,
    meta: { requiresAuth: true }, // ✅ protegida
  },
  {
    path: "/clientes",
    name: "ClientesView",
    component: ClientesView,
    meta: { requiresAuth: true }, // ✅ protegida
  },
  {
    path: "/registro-cliente",
    name: "RegistroClienteView",
    component: RegistroClienteView,
    meta: { requiresAuth: true }, // ✅ protegida
  },
  {
    path: "/actualizar-cliente/:identificacion",
    name: "ActualizarClienteView",
    component: ActualizarClienteView,
    props: true, // 👈 Esto hace que "identificacion" llegue como prop
    meta: { requiresAuth: true }, // ✅ protegida
  },
  {
    path: "/registro-proveedor",
    name: "RegistroProveedorView",
    component: RegistroProveedorView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/proveedores",
    name: "ProveedoresView",
    component: ProveedoresView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/actualizar-proveedor/:codigoSucursal",
    name: "ActualizarProveedorView",
    component: ActualizarProveedorView,
    props: true,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/registro-productos",
    name: "RegistroProductosView",
    component: RegistroProductosView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/productos",
    name: "ProductosView",
    component: ProductosView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/actualizar-productos/:codigo",
    name: "ActualizarProductosView",
    component: ActualizarProductosView,
    props: true,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/historial-ventas",
    name: "HistorialVentasView",
    component: HistorialVentasView,
    meta: { requiresAuth: true }, // ✅ protegida
  },
  {
    path: "/configuracion-empresa",
    name: "ConfiguracionEmpresaView",
    component: ConfiguracionEmpresaView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/configuracion-empresa-usuario",
    name: "ConfiguracionEmpresaUsuariosView",
    component: ConfiguracionEmpresaUsuariosView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/registro/roles",
    name: "ConfiguracionEmpresaRegistroRolesView",
    component: ConfiguracionEmpresaRegistroRolesView,
    meta: { requiresAuth: true }, // ✅ protegida
  },
  {
    path: "/actualizar-roles/:roleCode",
    name: "ConfiguracionEmpresaActualizarRoleView",
    component: ConfiguracionEmpresaActualizarRoleView,
    props: true, // 👈 Esto hace que "roleCode" llegue como prop
    meta: { requiresAuth: true }, // ✅ protegida
  },
  {
    path: "/registro/usuarios",
    name: "ConfiguracionEmpresaRegistroUsuariosView",
    component: ConfiguracionEmpresaRegistroUsuariosView,
    meta: { requiresAuth: true }, // ✅ protegida
  },
  {
    path: "/actualizar/usuarios/:identificacion/:userLogin",
    name: "ConfiguracionEmpresaActualizarUsuarioView",
    component: ConfiguracionEmpresaActualizarUsuarioView,
    props: true, // 👈 Esto hace que "identificacion" llegue como prop
    meta: { requiresAuth: true }, // ✅ protegida
  },
  {
    path: "/configuracion-usuario",
    name: "ConfiguracionUsuarioView",
    component: ConfiguracionUsuarioView,
    meta: { requiresAuth: true }, // ✅ protegida
  },
  {
    path: "/actualizar/configuracion-usuario/:identificacion/:userLogin",
    name: "ConfiguracionActualizarUsuarioView",
    component: ConfiguracionActualizarUsuarioView,
    props: true, // 👈 Esto hace que "identificacion" llegue como prop
    meta: { requiresAuth: true }, // ✅ protegida
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/login",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ==============================
// 🔒 Middleware global de autenticación
// ==============================
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!sessionData.accessToken;

  if (to.meta.requiresAuth && !isAuthenticated) {
    console.warn("🚫 Ruta protegida sin sesion activa → redirigiendo a login");
    next("/login");
  } else if (to.meta.requiresAdmin) {
    // Verificar que el usuario sea ADMIN, ADMINISTRADOR o SUPERADMIN
    const roleName = (sessionData.user?.roleName || "").toUpperCase().trim();
    const rolesAdmin = ["ADMIN", "ADMINISTRADOR", "SUPERADMIN"];
    if (!rolesAdmin.includes(roleName)) {
      console.warn("🚫 Ruta solo para ADMIN → redirigiendo a dashboard");
      next("/dashboard");
    } else {
      next();
    }
  } else if (to.path === "/login" && isAuthenticated) {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;
