
<template>
  <q-layout view="hHh LpR fFf" class="padre">
    <q-header class="bg-primary text-white" height-hint="98" >
      <q-toolbar flat class="headerBar">
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer"  />

        <q-toolbar-title >
          <q-avatar>
            <img src="../assets/logo.jpeg" />
          </q-avatar>
          APPTURA
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      show-if-above
      v-model="leftDrawerOpen"
      side="left"
      behavior="desktop"
      class="no-scroll"
      bordered
    >
      <div class="menuLink">
       
        <button class="buttonLink" @click="menuOff()" color="primary" >
          <router-link to="/facturas"
            ><span class="textButtonLink" icon="">Facturas</span></router-link
          >
        </button>
        <button class="buttonLink" @click="menuOff()" color="primary">
          <router-link to="/clientes"
            ><span class="textButtonLink">Clientes</span></router-link
          >
        </button>
        <button class="buttonLink" @click="menuOff()" color="primary">
          <router-link to="/productos"
            ><span class="textButtonLink">Productos</span></router-link
          >
        </button>
      </div>

      <!-- drawer content -->
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-grey-8 text-white">
  
    </q-footer>
  </q-layout>
</template>
  
<script setup>

import { ref } from "vue";
import { useRouter } from "vue-router"; // <-- Agrega esta línea

const router = useRouter(); // <-- Instancia el router aquí
const leftDrawerOpen = ref(true);
const rightDrawerOpen = ref(true);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const toggleRightDrawer = () => {
  rightDrawerOpen.value = !rightDrawerOpen.value;
};

import { onMounted } from "vue";
import { useAuthStore } from "../store/store.js";

const store = useAuthStore();

onMounted(() => {
  console.log("Token guardado en store:", store.token);
  console.log("Token guardado en localStorage:", localStorage.getItem("token"));
  if (router.currentRoute.value.path === "/") {
    router.push("/verfacturas");
  }
});
const menuOff = () => {
  leftDrawerOpen.value = false;
};
</script>
  
  <style scoped>
@import "../styles/home.css";
</style>