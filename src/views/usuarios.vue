<template>
  <div class="container mx-auto px-4 py-6" id="contenedorUsuarios">
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      

      <!-- User Table -->
      <q-table
      style="width: 1000px;"
      flat 
      bordered 
        :rows="users"
        :columns="columns"
        row-key="_id"
        class="w-full"
        separator="cell"
        :loading="loading"
        
      >
      <template v-slot:top>
        <div class="contenedorCabeza"><div class="text-h6">Listado de Usuarios</div><div class="p-4 bg-gray-50 flex justify-between items-center border-b" id="btnCrearUsuario"></div>
        
        <q-btn 
          color="primary" 
          label="Usuario" 
          @click="openUserModal" 
          class="btn-primary"
          icon="add"
          

        />
      </div>
      </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="text-center" id="opcionesUsuarios">
            <div class="flex justify-center space-x-2">
              <q-btn 
                icon="edit" 
                flat 
                dense 
                color="primary" 
                @click="editUser(props.row)"
                class="q-mr-xs"
              />
              <q-btn 
                icon="delete" 
                flat 
                dense 
                color="negative" 
                @click="deleteUser(props.row._id)"
                class="q-mr-xs"
              />
            </div>
          </q-td>
        </template>
      </q-table>
    </div>

     <q-dialog v-model="showModal" full-width maximized>
    <q-card class="full-width full-height">
      <q-card-section class="bg-blue-grey-1 q-pa-md">
        <div class="text-h5 text-weight-bold text-blue-grey-8">
          {{ isEditing ? 'Editar' : 'Crear' }} Usuario para Facturación
            <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <q-form @submit.prevent="submitUser">
          <div class="row q-col-gutter-md">
            <!-- Información Personal -->
            <div class="col-12 col-md-6">
              <q-card flat bordered class="full-height">
                <q-card-section>
                  <div class="text-subtitle1 text-weight-medium q-mb-md">Información Personal</div>
                  
                  <div class="row q-col-gutter-md">
                    <!-- Tipo de Documento y Número -->
                    <div class="col-12 col-md-6">
                      <q-select
                        v-model="user.identificationDocumentId"
                        :options="identificationDocuments"
                        option-value="id"
                        option-label="name"
                        label="Tipo de Documento"
                        outlined
                        emit-value
                        map-options
                        required
                        :rules="[val => !!val || 'Seleccione un tipo de documento']"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input 
                        v-model="user.identification" 
                        label="Número de Identificación" 
                        outlined 
                        required 
                        :rules="[val => !!val || 'Número de identificación requerido']"
                      />
                    </div>

                    <!-- Nombre Completo -->
                    <div class="col-12">
                      <q-input 
                        v-model="user.names" 
                        label="Nombre Completo" 
                        outlined 
                        required
                        :rules="[val => !!val || 'Nombre completo requerido']"
                      />
                    </div>

                    <!-- Contacto -->
                    <div class="col-12 col-md-6">
                      <q-input 
                        v-model="user.email" 
                        type="email" 
                        label="Correo Electrónico" 
                        outlined 
                        required
                        :rules="[val => !!val || 'Correo electrónico requerido']"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input 
                        v-model="user.phone" 
                        label="Teléfono" 
                        outlined 
                        required
                        :rules="[val => !!val || 'Teléfono requerido']"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Información de Facturación -->
            <div class="col-12 col-md-6">
              <q-card flat bordered class="full-height">
                <q-card-section>
                  <div class="text-subtitle1 text-weight-medium q-mb-md">Información de Facturación</div>
                  
                  <div class="row q-col-gutter-md">
                    <!-- Dirección Completa -->
                    <div class="col-12">
                      <q-input 
                        v-model="user.address" 
                        label="Dirección Completa" 
                        outlined 
                        required
                        :rules="[val => !!val || 'Dirección requerida']"
                      />
                    </div>

                    <!-- Municipio y Departamento -->
                    <div class="col-12 col-md-6">
                      <q-select
                        v-model="user.municipalityId"
                        :options="municipalities"
                        option-value="id"
                        option-label="name"
                        label="Municipio"
                        outlined
                        use-input
                        input-debounce="300"
                        @filter="filterMunicipalities"
                        emit-value
                        map-options
                        :loading="municipalities.length === 0"
                        required
                        :rules="[val => !!val || 'Municipio requerido']"
                      >
                        <template v-slot:no-option>
                          <q-item>
                            <q-item-section class="text-grey">
                              No se encontraron resultados
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </div>
                 

                    <!-- Información Tributaria -->
                    <div class="col-12 col-md-6">
                      <q-select
                        v-model="user.tributeId"
                        :options="tributes"
                        option-value="id"
                        option-label="name"
                        label="Régimen Tributario"
                        outlined
                        required
                        :rules="[val => !!val || 'Régimen tributario requerido']"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <q-input 
                        v-model="user.taxIdentificationNumber" 
                        label="NIT" 
                        outlined 
                        required
                        :rules="[val => !!val || 'NIT requerido']"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="bg-grey-2 q-pa-md">
        <q-btn 
          flat 
          label="Cancelar" 
          color="negative" 
          v-close-popup 
          @click="closeModal"
          class="mr-2"
        />
        <q-btn 
          color="primary" 
          :label="isEditing ? 'Actualizar' : 'Guardar'" 
          type="submit"
          @click="submitUser"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { postData, getData } from '../plugins/axios.js';
import apiCliente from "../plugins/factus"
// Quasar notification
const $q = useQuasar();

// Columns for q-table
const loading = ref(false);
const columns = [
  { 
    name: 'identification', 
    required: true, 
    label: 'Identificación', 
    align: 'left', 
    field: 'identification' 
  },
  { 
    name: 'names', 
    required: true, 
    label: 'Nombre', 
    align: 'left', 
    field: 'names' 
  },
  { 
    name: 'email', 
    label: 'Correo', 
    field: 'email' 
  },
  { 
    name: 'phone', 
    label: 'Teléfono', 
    field: 'phone' 
  },
  { 
    name: 'address', 
    label: 'Dirección', 
    field: 'address' 
  },
  { 
    name: 'actions', 
    label: 'Acciones', 
    field: 'actions' 
  }
];

// Identification documents options
const identificationDocuments = ref([
  { id: "1", name: "Cédula de ciudadanía" },
  { id: "2", name: "Cédula de extranjería" },
  { id: "3", name: "Pasaporte" },
  { id: "4", name: "Tarjeta de identidad" },
  { id: "5", name: "NIT" },
  { id: "6", name: "Registro civil" },
  { id: "7", name: "NUIP" },
  { id: "8", name: "Documento de identificación extranjero" },
  { id: "9", name: "Carné diplomático" },
  { id: "10", name: "Permiso especial de permanencia" },
  { id: "11", name: "Salvoconducto" }
]);

// Municipalities data
const municipalities = ref([]);
const tributes = ref([]);
const municipalitiesFilter = ref('');

// User state
const user = ref({
  identification: '',
  dv: '',
  names: '',
  email: '',
  phone: '',
  address: "",
  municipalityId: "", 
  identificationDocumentId: "",
  tributeId: "21",
  legalOrganizationId: "2"
});

// Component state
const users = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const currentUserId = ref(null);

// Fetch all users on component mount
onMounted(async () => {
  await fetchUsers();
  await loadInitialMunicipalities();
  await loadInitialTributes()
});

// Función loadInitialMunicipalities (corregida)
async function loadInitialMunicipalities() {
  try {
    const response = await apiCliente.get('/v1/municipalities');
    // Comprueba si la respuesta tiene la estructura esperada
    console.log("Respuesta municipios:", response.data);
    
    // Asegúrate de acceder correctamente a los datos
    const rawData = response.data.data || [];
    
    // Mapeo correcto de propiedades
    municipalities.value = rawData.map(mun => ({
      id: mun.id,
      name: mun.name
    }));
    
    console.log("Municipios cargados:", municipalities.value);
  } catch (error) {
    console.error("Error cargando municipios:", error);
    showNotification('negative', 'Error cargando municipios');
  }
}

async function loadInitialTributes() {
  try {
    const response = await apiCliente.get('v1/tributes/products');
    // Comprueba si la respuesta tiene la estructura esperada
    console.log("Respuesta tributos:", response.data);
    
    // Asegúrate de acceder correctamente a los datos
    const rawData2 = response.data.data || [];
    console.log(rawData2,"tributos")
    // Mapeo correcto de propiedades
    tributes.value = rawData2.map(mun => ({
      id: mun.id,
      name: mun.name,
      
    }));
    
    console.log("tributes cargados:", tributes.value);
  } catch (error) {
    console.error("Error cargando tributos:", error);
    showNotification('negative', 'Error cargando Tributos');
  }
}
// Función filterMunicipalities (corregida)
function filterMunicipalities(val, update) {
  if (val === '') {
    // Usa una función inmediata para el update
    update(() => {
      municipalities.value = municipalities.value;
    });
    return;
  }

  update(async () => {
    try {
      const response = await apiCliente.get(`/v1/municipalities?name=${val}`);
      console.log("Respuesta filtro:", response.data);
      
      // Asegúrate de acceder correctamente a los datos
      const rawData = response.data.data || [];
      
      // Actualiza municipalities con los resultados filtrados
      municipalities.value = rawData.map(mun => ({
        id: mun.id,
        name: mun.name
      }));
      
      console.log("Municipios filtrados:", municipalities.value);
    } catch (error) {
      console.error("Error filtrando municipios:", error);
      municipalities.value = [];
    }
  });
}

// Fetch users from API
async function fetchUsers() {
  try {
    loading.value = true;
    const response = await getData('/api/usuarios');
    users.value = response;
  } catch (error) {
    console.error("Error al cargar Usuarios:", error);
    showNotification('negative', 'Error al cargar Usuarios');
  } finally {
    loading.value = false;
  }
}

// Open modal for creating a new user
function openUserModal() {
  resetForm();
  showModal.value = true;
  isEditing.value = false;
}

// Open modal for editing an existing user
function editUser(selectedUser) {
  user.value = { ...selectedUser };
  showModal.value = true;
  isEditing.value = true;
  currentUserId.value = selectedUser._id;
}

// Close modal and reset form
function closeModal() {
  showModal.value = false;
  resetForm();
}

// Reset form to initial state
function resetForm() {
  user.value = {
    identification: '',
    dv: '',
    names: '',
    email: '',
    phone: '',
    address: "",
    municipalityId: "", 
    identificationDocumentId: "",
    tributeId: "21",
    legalOrganizationId: "2"
  };
}

// Submit user (create or update)
async function submitUser() {
  try {
    if (isEditing.value) {
      // Update existing user
      await postData(`/api/usuarios/${currentUserId.value}`, user.value);
      showNotification('positive', 'Usuario actualizado correctamente');
    } else {
      // Create new user
      await postData('/api/usuarios', user.value);
      showNotification('positive', 'Usuario creado correctamente');
    }
    
    // Refresh user list and close modal
    await fetchUsers();
    closeModal();
  } catch (error) {
    showNotification('negative', 'No se pudo guardar el usuario');
  }
}

// Delete user
async function deleteUser(id) {
  try {
    await postData(`/api/usuarios/${id}/delete`, {});
    showNotification('positive', 'Usuario eliminado correctamente');
    await fetchUsers();
  } catch (error) {
    showNotification('negative', 'No se pudo eliminar el usuario');
  }
}

const notification = ref({
  show: false,
  type: 'positive', // positive, negative, loading
  message: ''
});

// Funciones de notificación personalizadas
const showNotification = (type, message) => {
  notification.value = {
    show: true,
    type,
    message
  };
  
  // Auto-ocultar para notificaciones no de carga
  if (type !== 'loading') {
    setTimeout(() => {
      hideNotification();
    }, 3000);
  }
};

const hideNotification = () => {
  notification.value.show = false;
};
</script>

<style scoped>
#contenedorUsuarios{
  margin-top: 100px;
  width: 100%;
}
#btnCrearUsuario{
  display: flex;
  align-items: center;
  justify-content: center;
  
  padding: 10px;
  
}
.btn-primary{
  justify-content: center;
}
.text-h6{
  
  text-align: center;
  
}
#opcionesUsuarios{
  display: flex;
  flex-direction: row;
  justify-content: center;
}
div.q-page-container{
  width: 100%;

}
.q-mr-xs{
  width: 50px;
}
.contenedorCabeza{
  display: flex;
  justify-content: space-around;
  align-content: center;
  width: 100%;

}
.full-height {
  height: 100%;
}
.text-h5{
  display: flex;
  flex-direction: row;
 
}
.text-subtitle1{
text-align: center;
}
</style>