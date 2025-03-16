<template>
   <div class="containerLogin">
      <div class="image">
         <h3>Iniciar Sesion</h3>
      </div>
      <form @submit.prevent="login" id="forma1">



         <!--boton email-->
         <input v-model="username" placeholder="Email address" class="input" name="text" type="email" />

         <!--boton password-->
         <input v-model="password" class="input" type="password" placeholder="password">

         <!--  <button class="button" @click="iniciarSesion">
               
           Iniciar Sesion
           </button> -->
         <div class="q-pa-md">
            
            <span v-if="!loading"><q-btn color="teal" type="submit" label="Iniciar sesion" /></span>
            <div v-if="loading" class="spinner" label="Iniciar sesion"></div>
         </div>

      </form>
   </div>


</template>
<script setup>
import Swal from "sweetalert2";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/store.js"; // ✅ Importar Pinia
import factus from "../plugins/factus.js";

const username = ref("");
const password = ref("");
const router = useRouter();
const loading = ref(false);
const authStore = useAuthStore(); // ✅ Instancia del store

const login = async () => {
  loading.value = true;
  try {
    const response = await factus.post("/oauth/token", {
      username: username.value,
      password: password.value,
      grant_type: "password",
      client_id: "9e2e16a0-2ea3-48e7-ab85-8a01962a40d3",
      client_secret: "lWt72OqfNQplSulRXJQOCShBkkzdgRn5cihbmZsr",
    });

    console.log("✅ Iniciado sesión con éxito:", response.data);

    // ✅ Guardar token en Pinia y localStorage
    authStore.set_Token_RefreshToken(response.data.access_token, response.data.refresh_token);

    Swal.fire({
      title: "Sesión Iniciada",
      icon: "success",
      timer: 2000,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // ✅ Guardar también en sessionStorage por seguridad
    sessionStorage.setItem("authToken", response.data.access_token);

    // ✅ Redirigir a home
    router.push("/home");
  } catch (error) {
    loading.value = false;
    console.log("❌ Error en inicio de sesión:", error);

    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Credenciales incorrectas",
      timer: 2000,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style>
@import "../styles/login.css";
</style>