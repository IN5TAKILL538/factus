<template>  

<div class="containerTabla"><div class="txtFacturas"><button class="buttonCreateFacturas">Crear Factura</button></div>
  <q-table title="Facturas" :rows="rows" :columns="columns" row-key="name" class="tabla">
   
    


    
    
  </q-table>
</div></template>
  <script>
  import { ref } from 'vue'
  const url = ref("https://api-sandbox.factus.com.co")
  
  let columns = ref([
  {
    name: "id",
    align: "center",
    label: "ID",
    field: "id",
    sortable: true,
  },
  {
    name: "api_client_name",
    align: "center",
    label: "Cliente",
    field: "api_client_name",
    sortable: true,
  },
  {
    name: "number",
    align: "center",
    label: "Codigo de Referencia",
    field: "number",
    sortable: true,

  },
  {
    name: "identification",
    align: "center",
    label: "Identificacion",
    field: "identification",
    sortable: true,

  },
  {
    name: "graphic_representation_name",
    align: "center",
    label: "Nombre",
    field: "graphic_representation_name",
    sortable: true,
  },


  {
    name: "email",
    align: "center",
    label: "Correo Electronico",
    field: "email",
    
  },
  {
    name: "total",
    align: "center",
    label: "Total",
    field: "total",
  },
]);

  const rows = [
    
  ]
  
  
  export default {
    setup () {
      return {
        
        columns,
        rows
      }
    }
  }
  </script>
  <style>
  @import "../styles/verfactura.css";
</style>