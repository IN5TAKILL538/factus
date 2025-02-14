import { createRouter, createWebHashHistory } from "vue-router";
import home from "../views/home.vue"
import loginview from '../views/login.vue'
import verfacturas from "../views/verfacturas.vue"
import { useAuthStore } from "../store/store";  

const routes =[
    {path: "/" , name: 'login', component : loginview},
    {path:"/home", component : home, children:[
    {path:"/verfacturas", component:verfacturas},
    //{path:"/crearfacturas", component:crearfacturas},
]}
]





const router = createRouter({
    history:createWebHashHistory(),
    routes
}); 

export default router;