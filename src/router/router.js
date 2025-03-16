import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/home.vue';
import LoginView from '../views/login.vue';
import verfacturas from '../views/verfacturas.vue';
import clientes from '../views/clientes.vue';
import productos from '../views/productos.vue';
import { useAuthStore } from '../store/store.js';

const routes = [
  
  { path: '/', name: 'login', component: LoginView },
  { path: '/home', name: 'home', component: Home,  children:[
  { path: '/verfacturas', name: 'verfacturas', component: verfacturas },
  { path: '/productos', name: 'productos', component: productos },
  { path: '/clientes', name: 'clientes', component: clientes },
  
]}
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