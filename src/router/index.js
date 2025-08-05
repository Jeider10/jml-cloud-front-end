// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import RoleSelection from '@/components/RoleSelection.vue'
import DashboardView from '@/views/DashboardView.vue'

// styles

import "@fortawesome/fontawesome-free/css/all.min.css";
import "@/assets/styles/tailwind.css";

// layouts

import Admin from "@/layouts/Admin.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";

// views for Admin layout

import Dashboard from "@/views/admin/Dashboard.vue";
import AdminSettings from "@/views/admin/AdminSettings.vue";
import AdminTables from "@/views/admin/AdminTables.vue";
import AdminMaps from "@/views/admin/AdminMaps.vue";

// views for Auth layout

import UserLogin from "@/views/auth/UserLogin.vue";
import UserRegister from "@/views/auth/UserRegister.vue";

// views without layouts

import LandingView from "@/views/LandingView.vue";
import ProfileView from "@/views/ProfileView.vue";
import IndexView from "@/views/IndexView.vue";

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
    path: '/role-selection',
    name: 'RoleSelection',
    component: RoleSelection
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView
  },
  {
    path: "/admin",
    redirect: "/admin/dashboard",
    component: Admin,
    children: [
      {
        path: "/admin/dashboard",
        component: Dashboard,
      },
      {
        path: "/admin/settings",
        component: AdminSettings,
      },
      {
        path: "/admin/tables",
        component: AdminTables,
      },
      {
        path: "/admin/maps",
        component: AdminMaps,
      },
    ],
  },
  {
    path: "/auth",
    redirect: "/auth/login",
    component: AuthLayout,
    children: [
      {
        path: "/auth/login",
        component: UserLogin,
      },
      {
        path: "/auth/register",
        component: UserRegister,
      },
    ],
  },
  {
    path: "/landing",
    component: LandingView,
  },
  {
    path: "/profile",
    component: ProfileView,
  },
  {
    path: "/",
    component: IndexView,
  },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
