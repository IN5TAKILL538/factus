<template>
  <div class="q-pa-md" id="contenedorProductos">


    <!-- Tabla de Productos -->
    <q-table style="width: 1000px;" :rows="products" :columns="columns" row-key="_id" class="q-mt-md" separator="cell"
      :loading="loading">
      <template v-slot:top>
        <div class="contenedorCabeza">
          <div class="text-h6">Listado de Productos</div>
          <div id="btnCrearProductos"><q-btn icon="add" color="primary" label="Producto" @click="openProductModal"
              class="btn-primary" /></div>
        </div>
      </template>
      <!-- Acciones personalizadas -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="opcionesProductos">
          <q-btn icon="edit" flat dense color="primary" @click="editProduct(props.row)" class="q-mr-xs" />
          <q-btn icon="delete" flat dense color="negative" @click="deleteProduct(props.row._id)" class="q-mr-xs" />
        </q-td>
      </template>
    </q-table>

    <!-- Modal para Crear/Editar Producto -->
    <q-dialog v-model="productModal" persistent maximized color="primary">
  <q-card style="min-width: 500px">
    <q-card-section>
      <div class="text-h6">{{ isEditing ? 'Editar' : 'Crear' }} Producto
      
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup /></div>
    </q-card-section>

    <q-card-section>
      <q-form ref="productForm" @submit.prevent="submitProduct" class="q-gutter-md" color="primary">
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-sm">Información Básica</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input v-model="product.codeReference" label="Código de Referencia" outlined required
                  :rules="[val => !!val || 'El código de referencia es requerido']" />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="product.name" label="Nombre" outlined required
                  :rules="[val => !!val || 'El nombre es requerido']" />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-sm">Detalles Financieros</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input v-model.number="product.price" type="number" label="Precio" outlined required
                  :rules="[val => val > 0 || 'El precio debe ser mayor a 0']" />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model.number="product.taxRate" type="number" label="Impuesto (%)" outlined required
                  :rules="[val => val >= 0 || 'El impuesto no puede ser negativo']" />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-sm">Clasificación</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-select 
                  
                  v-model="product.unitMeasureId" 
                  :options="unitMeasureOptions" 
                  label="Unidad de Medida" 
                  required 
                  :rules="[val => !!val || 'Seleccione una unidad de medida']" 
                  @filter="filterUnitMeasures"
                  use-input 
                  input-debounce="300" 
                  option-value="id" 
                  option-label="name" 
                  map-options 
                  outlined
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select 
                  negative
                  v-model="product.standardCodeId" 
                  :options="standardCodeOptions" 
                  label="Código Estándar" 
                  outlined
                  required 
                  :rules="[val => !!val || 'Seleccione un código estándar']" 
                  option-value="value"
                  option-label="label" 
                  map-options 
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card>
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-sm">Información Tributaria</div>
            <q-select 
              
              v-model="product.tributeId" 
              :options="tributeOptions" 
              label="Tributo" 
              outlined 
              required
              :rules="[val => !!val || 'Seleccione un tributo']" 
              @filter="filterTributes" 
              use-input 
              input-debounce="300"
              option-value="id" 
              option-label="name" 
              map-options 
            />
          </q-card-section>
        </q-card>
      </q-form>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Cancelar" color="negative" v-close-popup />
      <q-btn color="primary" :label="isEditing ? 'Actualizar' : 'Guardar'" type="submit" @click="submitProduct" />
    </q-card-actions>
  </q-card>
</q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { postData, getData, putData } from '../plugins/axios.js'
import apiCliente from "../plugins/factus.js"

// Configuración de columnas para la tabla
const columns = [
  {
    name: 'codeReference',
    label: 'Código',
    align: 'center',
    field: 'codeReference'
  },
  {
    name: 'name',
    required: true,
    label: 'Nombre',
    align: 'center',
    field: 'name'
  },
  {
    name: 'price',
    label: 'Precio',
    field: 'price',
    align: 'center',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'center',
  }
]

// Estados y referencias reactivas
const $q = useQuasar()
const products = ref([])
const productModal = ref(false)
const isEditing = ref(false)
const product = ref({
  codeReference: '',
  name: '',
  price: "",
  taxRate: "",
  unitMeasureId: "",
  standardCodeId: "",
  tributeId: ""
})
const productForm = ref(null)
const loading = ref(false);

// Opciones para selects
const unitMeasureOptions = ref([])
const standardCodeOptions = ref([
  { label: 'Código 1', value: 1 },
  { label: 'Código 2', value: 2 },
  { label: 'Código 3', value: 3 },
  { label: 'Código 4', value: 4 },
])
const tributeOptions = ref([])

// Cargar productos al montar el componente
onMounted(async () => {
  try {
    const response = await getData('/api/servicios')
    products.value = response

    // Cargar datos iniciales para los selects
    await loadInitialUnitMeasures()
    await loadInitialTributes()
  } catch (error) {
    showNotification('negative', 'Error al cargar datos iniciales')
    console.error('Error al cargar datos iniciales:', error)
  }
})

// Cargar unidades de medida iniciales
async function loadInitialUnitMeasures() {
  try {
    const response = await apiCliente.get('/v1/measurement-units')
    unitMeasureOptions.value = response.data.data
    console.log(response.data.data)
  } catch (error) {
    console.error('Error al cargar unidades de medida:', error)
  }
}

// Cargar tributos iniciales
async function loadInitialTributes() {
  try {
    const response = await apiCliente.get('/v1/tributes/products')
    if (response && response.data && response.data.data) {
      tributeOptions.value = response.data.data.map(tribute => ({
        id: tribute.id,
        name: tribute.name,
        value: tribute.id,
        label: tribute.name
      }))
    } else {
      console.error('Formato de respuesta inesperado para tributos:', response)
    }
  } catch (error) {
    console.error('Error al cargar tributos:', error)
  }
}

// Filtrar unidades de medida
async function filterUnitMeasures(val, update) {
  if (val === '') {
    update(() => {
      loadInitialUnitMeasures()
    })
    return
  }

  update(async () => {
    try {
      const response = await apiCliente.get(`/v1/measurement-units?name=${val}`)
      if (response && response.data && response.data.data) {
        unitMeasureOptions.value = response.data.data.map(unit => ({
          id: unit.id,
          name: unit.name,
          value: unit.id,
          label: unit.name
        }))
      }
    } catch (error) {
      console.error('Error al filtrar unidades de medida:', error)
    }
  })
}

// Filtrar tributos
async function filterTributes(val, update) {
  if (val === '') {
    update(() => {
      loadInitialTributes()
    })
    return
  }

  update(async () => {
    try {
      const response = await apiCliente.get(`/v1/tributes/products?name=${val}`)
      if (response && response.data && response.data.data) {
        tributeOptions.value = response.data.data.map(tribute => ({
          id: tribute.id,
          name: tribute.name,
          value: tribute.id,
          label: tribute.name
        }))
      }
    } catch (error) {
      console.error('Error al filtrar tributos:', error)
    }
  })
}

// Abrir modal para crear producto
function openProductModal() {
  product.value = {
    codeReference: '',
    name: '',
    price: null,
    taxRate: null,
    unitMeasureId: null,
    standardCodeId: null,
    tributeId: null
  }
  isEditing.value = false
  productModal.value = true
}

// Editar producto existente
function editProduct(selectedProduct) {
  // Clonar el producto para evitar modificaciones directas
  product.value = { ...selectedProduct }
  isEditing.value = true
  productModal.value = true
}

// Eliminar producto
async function deleteProduct(id) {
  try {
    await apiCliente.delete(`/api/servicios/${id}`)

    // Eliminar de la lista local
    products.value = products.value.filter(p => p._id !== id)

    showNotification('positive', 'Producto eliminado correctamente')
  } catch (error) {
    showNotification('negative', error.response?.data?.message || 'Error al eliminar producto')
    console.error('Error al eliminar producto:', error)
  }
}

// Enviar producto (crear o actualizar)
async function submitProduct() {
  try {
    // Validar formulario antes de enviar
    if (productForm.value) {
      const isValid = await productForm.value.validate()
      if (!isValid) {
        return
      }
    }

    // Validación adicional para el código de referencia
    if (!product.value.codeReference) {
      showNotification('negative', 'El código de referencia es obligatorio')
      return
    }

    // Crear una copia del producto con el formato correcto de IDs
    const productToSubmit = {
      ...product.value,
      unitMeasureId: typeof product.value.unitMeasureId === 'object' ?
        product.value.unitMeasureId.id :
        product.value.unitMeasureId,
      standardCodeId: typeof product.value.standardCodeId === 'object' ?
        product.value.standardCodeId.value :
        product.value.standardCodeId,
      tributeId: typeof product.value.tributeId === 'object' ?
        product.value.tributeId.id :
        product.value.tributeId
    }

    if (isEditing.value) {
      // Actualizar producto existente
      const updatedProduct = await putData(`/api/servicios/${product.value._id}`, productToSubmit)

      // Actualizar en la lista de productos
      const index = products.value.findIndex(p => p._id === updatedProduct._id)
      if (index !== -1) {
        products.value[index] = updatedProduct
      }

      showNotification('positive', 'Producto actualizado correctamente')
    } else {
      // Crear nuevo producto
      const newProduct = await postData('/api/servicios', productToSubmit)
      products.value.push(newProduct)

      showNotification('positive', 'Producto creado correctamente')
    }
    productModal.value = false
  } catch (error) {
    showNotification('negative', error.response?.data?.message || 'Error al guardar producto')
    console.error('Error al guardar producto:', error)
  }
}

const notification = ref({
  show: false,
  type: 'positive', // positive, negative, loading
  message: ''
})

// Funciones de notificación personalizadas
const showNotification = (type, message) => {
  notification.value = {
    show: true,
    type,
    message
  }

  // Auto-ocultar para notificaciones no de carga
  if (type !== 'loading') {
    setTimeout(() => {
      hideNotification()
    }, 3000)
  }
}

const hideNotification = () => {
  notification.value.show = false
}
</script>

<style scoped>
#contenedorProductos {
  margin-top: 100px;
  width: 100%;
}

#btnCrearProductos {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;

}

.btn-primary {
  justify-content: center;
}

.text-h6 {
  text-align: center;
}

#opcionesUsuarios {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

div.q-page-container {
  width: 100%;
}

.q-mr-xs {
  width: 50px;
}

.contenedorCabeza {
  display: flex;
  justify-content: space-around;
  align-content: center;
  width: 100%;
}

.opcionesProductos {
  display: flex;
  justify-content: center;
}

.contenedorProductos {
  display: flex;
  justify-content: center;
}
.text-h6{
  display: flex;
  flex-direction: row;
 
}
.text-subtitle1{
text-align: center;
}

</style>
