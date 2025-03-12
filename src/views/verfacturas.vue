<template>  

<div class="containerTabla"><div class="txtFacturas"><button class="buttonCreateFacturas">Crear Factura</button></div>
  <q-table title="Facturas" :rows="rows" :columns="columns" row-key="name" class="tabla">
   
    


    
    
  </q-table>
</div></template>
  <script setup>
  import { ref, onMounted, computed } from 'vue'
  import { getData, postData } from '../plugins/axios';
  import apiClientFactus from '../plugins/factus.js'
  import axios from 'axios'
  //import { useStore } from '../store/store.js'
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
  const localInvoices = ref([])
  const users = ref([])
  const products = ref([])
  
  onMounted(async () => {
  try {
    users.value = await getData("/api/usuariosr");
    console.log(users.value)
    products.value = await getData("/api/productosr");
    console.log(products.value)
    
    // Cargar facturas existentes
    await dataFacturas();

  } catch (error) {
    console.error("Error al cargar datos iniciales:", error);
    
  }
});

const dataFacturas = async () => {
  
  try {
    // Cargar facturas locales
    await loadLocalInvoices();
    
    // Cargar facturas de API
    await loadApiInvoices();
  } catch (error) {
    console.error("Error al cargar facturas:", error);
    showNotification('negative', 'Error al cargar facturas');
  } finally {
    loading.value = false;
  }
};


const loadLocalInvoices = async () => {
  try {
    const localData = await getData("/api/facturas");
    localInvoices.value = localData.map(invoice => ({
      ...invoice,
      isLocal: true
    }));
    console.log("Facturas locales cargadas:", localInvoices.value);
    return localInvoices.value;
  } catch (error) {
    console.error("Error al cargar facturas locales:", error);
    showNotification('negative', 'Error al cargar facturas locales');
    return [];
  }
};

const loadApiInvoices = async () => {
  loading.value = true;
  try {
    const token = store.token || localStorage.getItem('token');

    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }

    const response = await axios.get(
      "https://api-sandbox.factus.com.co/v1/bills?filter[identification]&filter[names]&filter[number]&filter[prefix]&filter[reference_code]&filter[status]",
      {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    );
    
    if (response.data && response.data.data && response.data.data.data) {
      rows.value = response.data.data.data.map(invoice => ({
        ...invoice,
        isApi: true
      }));
      console.log("Facturas de API cargadas:", rows.value);
      return rows.value;
    }
    
    return [];
  } catch (error) {
    console.error("Error al cargar facturas de API:", error);
    showNotification('negative', 'Error al cargar facturas de API');
    
    return [];
  } finally {
    loading.value = false;
  }
};
 
  </script>
  <style>
  @import "../styles/verfactura.css";
</style>