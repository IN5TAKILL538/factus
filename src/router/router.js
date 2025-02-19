import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/home.vue';
import LoginView from '../views/login.vue';
import { useAuthStore } from '../store/store.js';

const routes = [
  { path: '/home', name: 'home', component: Home,  },
  { path: '/', name: 'login', component: LoginView },
  
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