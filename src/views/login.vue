<template>
   <div class="containerLogin">
      <div class="image">
         <h3>Iniciar Sesion</h3>
        </div>
       <div class="form">
        
           
           
           <!--boton email-->
           <input v-model="email" placeholder="Email address" class="input" name="text" type="email" />
           
           <!--boton password-->
           <input v-model="password" class="input" type="password" placeholder="password">
       
          <!--  <button class="button" @click="iniciarSesion">
               
           Iniciar Sesion
           </button> -->
           <q-btn id="btnLoading" :loading="loading" color="secondary" @click="iniciarSesion()" label="Iniciar sesion"  />
       </div>
   </div>
   
     
   </template>
<script>



</script>
<style scoped>
@import "../styles/login.css";
</style>