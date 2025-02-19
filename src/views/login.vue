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
            <div v-if="loading" class="spinner"></div>
         </div>

      </form>
   </div>


</template>
<script setup>

import Swal from 'sweetalert2'

import { ref } from 'vue';

import axios from '../plugins/axios.js';
import { useRouter } from 'vue-router';



const username = ref('');
const password = ref('');
const router = useRouter();
const loading = ref(false);
const login = async () => {
   loading.value = true;
   try {
      const response = await axios.post('/oauth/token', {
         username: username.value,
         password: password.value,
         grant_type: 'password',
         client_id: "9e2e16a0-2ea3-48e7-ab85-8a01962a40d3",
         client_secret: "lWt72OqfNQplSulRXJQOCShBkkzdgRn5cihbmZsr",
      });
      console.log('Iniciado sesión con éxito:', response.data);
      let timerInterval;

      Swal.fire({
         title: "Sesión Iniciada",
         icon: "success",
        
         timer: 2000,
         didOpen: () => {
            Swal.showLoading();
            const timer = Swal.getPopup().querySelector("b");

            if (timer) {  // Asegura que el elemento <b> existe
               timerInterval = setInterval(() => {
                  timer.textContent = `${Swal.getTimerLeft()}`;
               }, 100);
            }
         },
         willClose: () => {
            clearInterval(timerInterval);
         }
      }).then((result) => {
         if (result.dismiss === Swal.DismissReason.timer) {
            console.log("I was closed by the timer");
         }
      });


      sessionStorage.setItem('authToken', response.data.access_token);
      // Redirige al usuario a la página principal
      router.push('/home');
   } catch (error) {

      loading.value = false;
      console.log("error inicio sesion", error)
      let timerInterval;
      Swal.fire({
         icon: "error",
         title: "Oops...",
         text: "Credenciales incorrectas",
         timer: 2000,
         didOpen: () => {
            Swal.showLoading();
            const timer = Swal.getPopup().querySelector("b");

            if (timer) {  // Asegura que el elemento <b> existe
               timerInterval = setInterval(() => {
                  timer.textContent = `${Swal.getTimerLeft()}`;
               }, 100);
            }
         },
         willClose: () => {
            clearInterval(timerInterval);
         }
      }).then((result) => {
         if (result.dismiss === Swal.DismissReason.timer) {
            console.log("I was closed by the timer");
         }
      });

   }
   finally {

      loading.value = false;
   }
};








</script>
<style scoped>
@import "../styles/login.css";
</style>