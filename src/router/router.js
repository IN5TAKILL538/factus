import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/home.vue';
import LoginView from '../views/login.vue';
import facturas from '../views/facturas.vue';
import clientes from '../views/usuarios.vue';
import productos from '../views/productos.vue';
import { useAuthStore } from '../store/store.js';


const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView
  },
  {
    path: '/home',
    name: 'home',
    component: Home,
    meta: { requiresAuth: true },
    redirect: '/productos',
    children: [
      {
        path: '/facturas',
        name: 'facturas',
        component: facturas,
        meta: { requiresAuth: true }
      },
      {
        path: '/clientes',
        name: 'clientes',
        component: clientes,
        meta: { requiresAuth: true }
      },
      {
        path: '/productos',
        name: 'productos',
        component: productos,
        meta: { requiresAuth: true }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.token) {
    next({ name: 'login' });
  } else {
    next();
  }
});

export default router;