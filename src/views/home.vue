
<template>
  <q-layout view="hHh LpR fFf" class="padre">
    <q-header class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" />
          </q-avatar>
          Title
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      show-if-above
      v-model="leftDrawerOpen"
      side="left"
      behavior="desktop"
      class="no-scroll"
    >
      <div class="menuLink">
        <div><h1 class="titletext">APPTURA</h1></div>
        <button class="buttonLink" @click="menuOff()">
          <router-link to="/verfacturas"
            ><span class="textButtonLink">Facturas</span></router-link
          >
        </button>
        <button class="buttonLink" @click="menuOff()">
          <router-link to="/clientes"
            ><span class="textButtonLink">Clientes</span></router-link
          >
        </button>
        <button class="buttonLink" @click="menuOff()">
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
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" />
          </q-avatar>
          <div>Title</div>
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>
  
<script setup>
import { ref } from "vue";

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
});
const menuOff = () => {
  leftDrawerOpen.value = false;
};
</script>
  
  <style scoped>
.menuLink {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f2f2f2;
  padding: 20px;
}
.buttonLink {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  background: #1d8fec;
  padding: 20px;
  margin: 20px;
  width: 80%;
}
.textButtonLink {
  color: #ffffff;
}
.titletext {
  font-size: 40px;
  color: #000;
}
.no-scroll {
  overflow: hidden;
}
</style>