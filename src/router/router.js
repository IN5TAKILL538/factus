import { createRouter, createWebHashHistory } from "vue-router";
import login from "../views/login.vue"

const routes =[
    {path:"/", component:login},
    //{path:"/login", component:login}
    //{path:"/verfacturas", component:verfacturas}
    //{path:"/crearfacturas", component:crearfacturas}
]

export const router = createRouter({
    history:createWebHashHistory(),
    routes
}); 