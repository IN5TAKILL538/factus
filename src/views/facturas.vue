<template>
  <div class="q-pa-md" id="contenedorFactura">

    
    <q-table 
      style="width: 1000px;"
      flat 
      bordered 
      :rows="filteredInvoices" 
      :columns="columns" 
      row-key="_id"
      :loading="loading"
      
      

    >
      <template v-slot:top>
        <div class="contenedorCabeza"><div class="text-h6">Listado de Facturas</div>     
      <q-btn color="primary" label="Factura" @click="openCreateModal" class="q-ml-sm" icon="add"/>
     
      
        <q-btn  color="primary" label="Actualizar" @click="dataFacturas" class="q-ml-sm" icon="refresh" />
      
    </div>
      </template>
      
      <template v-slot:body-cell-total="props">
        <q-td :props="props">
          {{ formatCurrency(props.value) }}
        </q-td>
      </template>

      <template  v-slot:body-cell-actions="props" >
        <q-td :props="props" id="opcionesFactura">
          <q-btn 
            icon="visibility" 
            flat 
            color="primary" 
            @click="openInvoiceDetailsModal(props.row)"
            class="q-mr-xs"
          />
          <q-btn 
            v-if="props.row.isApi" 
            icon="download" 
            flat 
            color="secondary" 
            @click="downloadInvoicePdf(props.row)"
            class="q-mr-xs"
          />
          <q-btn 
            v-if="props.row.isApi" 
            icon="open_in_new" 
            flat 
            color="accent" 
            @click="openInvoiceInBrowser(props.row)"
            class="q-mr-xs"
          />
        </q-td>
      </template>
    </q-table>
    
    <!-- Modal de Detalles de Factura (Modificado) -->
    <q-dialog v-model="showInvoiceDetailsModal" persistent maximized>
      <q-card class="column">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Detalles de Factura</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        
        <q-card-section v-if="selectedInvoice" class="col q-pt-none scroll">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-card>
                <q-card-section>
                  <div class="text-h6">Información de Factura</div>
                  <div class="q-my-sm">
                    <strong>Número:</strong> {{ selectedInvoice.number || selectedInvoice.referenceCode }}
                  </div>
                  <div class="q-my-sm">
                    <strong>Total:</strong> {{ formatCurrency(selectedInvoice.total || calculateLocalInvoiceTotal()) }}
                  </div>
                  <div class="q-my-sm">
                    <strong>Fecha:</strong> {{ formatDate(selectedInvoice.created_at) }}
                  </div>
                  <div v-if="selectedInvoice.cufe" class="q-my-sm">
                    <strong>CUFE:</strong> {{ selectedInvoice.cufe }}
                  </div>
                  <div class="q-my-sm">
                    <strong>Estado:</strong> {{ selectedInvoice.status || 'Pendiente' }}
                  </div>
                  <div v-if="selectedInvoice.url" class="q-my-sm">
                    <strong>URL Pública:</strong> 
                    <a :href="selectedInvoice.url" target="_blank">{{ selectedInvoice.url }}</a>
                  </div>
                  <div class="q-my-sm" v-if="selectedInvoice.setpNumber">
                    <strong>Número SETP:</strong> {{ selectedInvoice.setpNumber }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
            
            <div class="col-12 col-md-6">
              <q-card>
                <q-card-section>
                  <div class="text-h6">Información del Cliente</div>
                  <div class="q-my-sm">
                    <strong>Nombre:</strong> {{ selectedInvoice.names || selectedInvoice.customer?.names }}
                  </div>
                  <div class="q-my-sm">
                    <strong>Identificación:</strong> {{ selectedInvoice.identification || selectedInvoice.customer?.identification }}
                  </div>
                  <div class="q-my-sm">
                    <strong>Correo:</strong> {{ selectedInvoice.email || selectedInvoice.customer?.email }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <q-card class="q-mt-md">
            <q-card-section>
              <div class="text-h6">Productos / Servicios</div>
              <q-table 
                :rows="selectedInvoice.items"
                :columns="itemColumns"
                row-key="product"
                flat
                dense
              />
            </q-card-section>
          </q-card>

          <div v-if="selectedInvoice.qr" class="q-mt-md text-center">
            <q-card>
              <q-card-section>
                <div class="text-h6">Código QR</div>
                <img :src="selectedInvoice.qr" alt="Código QR de Factura" class="q-mt-md" />
              </q-card-section>
            </q-card>
          </div>

          <div v-if="selectedInvoice.qrImage" class="q-mt-md text-center">
            <q-card>
              <q-card-section>
                <div class="text-h6">Imagen QR</div>
                <img :src="selectedInvoice.qrImage" alt="Imagen QR de Factura" class="q-mt-md" />
              </q-card-section>
            </q-card>
          </div>

          <div v-if="selectedInvoice.isApi" class="row q-col-gutter-md q-mt-md">
            <div class="col-12">
              <q-card>
                <q-card-section class="row justify-between items-center">
                  <div class="text-h6">Acciones</div>
                  <div>
                    <q-btn color="secondary" label="Descargar PDF" icon="download" @click="downloadInvoicePdf(selectedInvoice)" />
                    <q-btn color="accent" label="Ver en Navegador" icon="open_in_new" class="q-ml-sm" @click="openInvoiceInBrowser(selectedInvoice)" />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    
    <!-- Modal para Crear/Validar Factura -->
    <q-dialog v-model="showCreateModal" persistent maximized>
      <q-card class="column">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Crear y Validar Factura</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        
        <q-card-section class="col q-pt-none scroll">
          <q-form @submit="createInvoice" class="q-gutter-md">
            <div class="q-py-md">
              <div class="text-subtitle1 q-mb-sm">Información General</div>
              <div class="row q-col-gutter-md">
                <div class="col-md-6 col-sm-12">
                  <q-input
                    v-model="invoice.referenceCode"
                    label="Código de Referencia"
                    outlined
                    :rules="[
                      val => !!val || 'El código de referencia es requerido',
                      val => /^[A-Za-z]/.test(val) || 'Debe iniciar con una letra'
                    ]"
                    hint="Debe iniciar con una letra"
                  />
                </div>
                <div class="col-md-6 col-sm-12">
                  <q-input
                    v-model="invoice.observation"
                    label="Observación"
                    outlined
                  />
                </div>
              </div>
              
              <div class="row q-col-gutter-md q-mt-md">
                <div class="col-md-6 col-sm-12">
                  <q-select
                    v-model="invoice.paymentForm"
                    :options="paymentFormOptions"
                    label="Forma de Pago"
                    outlined
                    emit-value
                    map-options
                    :rules="[val => !!val || 'Por favor seleccione una forma de pago']"
                  />
                </div>
                <div class="col-md-6 col-sm-12">
                  <q-select
                    v-model="invoice.paymentMethodCode"
                    :options="paymentMethodOptions"
                    label="Método de Pago"
                    outlined
                    emit-value
                    map-options
                    :rules="[val => !!val || 'Por favor seleccione un método de pago']"
                  />
                </div>
              </div>
              
              <div class="row q-col-gutter-md q-mt-md">
                <div class="col-md-6 col-sm-12">
                  <q-input
                    v-model="invoice.paymentDueDate"
                    label="Fecha de Vencimiento"
                    outlined
                    type="date"
                    :rules="[val => !!val || 'La fecha de vencimiento es requerida']"
                  />
                </div>
              </div>
              
              <div class="text-subtitle1 q-mt-lg q-mb-sm">Período de Facturación</div>
              <div class="row q-col-gutter-md">
                <div class="col-md-3 col-sm-6">
                  <q-input
                    v-model="invoice.billingPeriod.startDate"
                    label="Fecha Inicio"
                    outlined
                    type="date"
                    :rules="[val => !!val || 'La fecha de inicio es requerida']"
                  />
                </div>
                <div class="col-md-3 col-sm-6">
                  <q-input
                    v-model="invoice.billingPeriod.startTime"
                    label="Hora Inicio"
                    outlined
                    type="time"
                    :rules="[val => !!val || 'La hora de inicio es requerida']"
                  />
                </div>
                <div class="col-md-3 col-sm-6">
                  <q-input
                    v-model="invoice.billingPeriod.endDate"
                    label="Fecha Fin"
                    outlined
                    type="date"
                    :rules="[val => !!val || 'La fecha de fin es requerida']"
                  />
                </div>
                <div class="col-md-3 col-sm-6">
                  <q-input
                    v-model="invoice.billingPeriod.endTime"
                    label="Hora Fin"
                    outlined
                    type="time"
                    :rules="[val => !!val || 'La hora de fin es requerida']"
                  />
                </div>
              </div>
            </div>
            
            <div class="q-py-md">
              <div class="text-subtitle1 q-mb-sm">Información del Cliente</div>
              <q-select
                v-model="invoice.customerId"
                :options="userOptions"
                label="Seleccionar Cliente"
                outlined
                emit-value
                map-options
                :rules="[val => !!val || 'Por favor seleccione un cliente']"
              />
            </div>
            
            <div class="q-py-md">
              <div class="text-subtitle1 q-mb-sm">Productos</div>
              <div v-for="(item, index) in invoice.items" :key="index" class="row q-col-gutter-sm q-mb-md">
                <div class="col-md-6 col-sm-12 col-xs-12">
                  <q-select
                    v-model="item.productId"
                    :options="productOptions"
                    label="Producto"
                    outlined
                    emit-value
                    map-options
                    :rules="[val => !!val || 'Por favor seleccione un producto']"
                  />
                </div>
                <div class="col-md-4 col-sm-8 col-xs-8">
                  <q-input
                    v-model.number="item.quantity"
                    type="number"
                    label="Cantidad"
                    outlined
                    :rules="[
                      val => !!val || 'La cantidad es requerida',
                      val => val > 0 || 'La cantidad debe ser mayor a 0'
                    ]"
                  />
                </div>
                <div class="col-md-2 col-sm-4 col-xs-4 flex items-center">
                  <q-btn 
                    v-if="invoice.items.length > 1"
                    icon="delete" 
                    color="negative" 
                    flat 
                    @click="removeItem(index)" 
                  />
                </div>
              </div>
              
              <div class="q-mt-sm">
                <q-btn 
                  type="button" 
                  color="secondary" 
                  outline
                  icon="add" 
                  label="Agregar Producto" 
                  @click="addItem" 
                />
              </div>
            </div>
            
            <div class="q-gutter-sm">
              <q-btn 
                type="submit" 
                color="primary" 
                label="Guardar Factura Local" 
                :disable="!invoice.customerId || invoice.items.some(item => !item.productId || item.quantity <= 0)" 
              />
              <q-btn 
                type="button" 
                color="deep-orange" 
                label="Validar Factura con Factus" 
                @click="validateInvoice"
                :disable="!invoice.customerId || invoice.items.some(item => !item.productId || item.quantity <= 0)"
              />
            </div>
          </q-form>
          
          <div v-if="facturaimagen" class="q-mt-lg">
            <div class="text-subtitle1 q-mb-sm">Imagen de Factura</div>
            <img :src="facturaimagen" alt="Factura generada" class="full-width" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Componente de notificación personalizado -->
    <div class="custom-notify" v-if="notification.show">
      <q-banner rounded class="bg-secondary text-white" v-if="notification.type === 'loading'">
        <template v-slot:avatar>
          <q-spinner color="white" />
        </template>
        {{ notification.message }}
      </q-banner>
      <q-banner rounded :class="notification.type === 'positive' ? 'bg-positive' : 'bg-negative'" class="text-white">
        <div class="flex justify-between items-center">
          <span>{{ notification.message }}</span>
          <q-btn flat color="white" label="Cerrar" @click="hideNotification" />
        </div>
      </q-banner>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, inject } from "vue";
import { getData, postData } from "../plugins/axios.js"
import apiClienteFactus from '../plugins/factus.js';
import axios from 'axios';
import { useAuthStore } from '../store/store.js';

// Crear sistema de notificación personalizado
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

// Funciones de carga personalizadas
const showLoading = (message) => {
  showNotification('loading', message || 'Cargando...');
};

const hideLoading = () => {
  hideNotification();
};

const store = useAuthStore();

// Control de visualización de facturas API
const showApiInvoices = ref(true);
// Control para el estado de validación de la factura
const isInvoiceValidated = ref(false);

// Datos de tabla
const columns = ref([
  { name: "number", align: "center", label: "Número", field: row => row.number || row.referenceCode, sortable: true },
  { name: "names", align: "center", label: "Cliente", field: row => row.names || row.customer?.names, sortable: true },
  { name: "total", align: "center", label: "Total", field: "total", sortable: true },
  { name: "type", align: "center", label: "Tipo", field: row => row.isApi ? 'Validada' : 'Local', sortable: true },
  { name: "actions", align: "center", label: "Acciones", field: "actions" }
]);

const itemColumns = ref([
  { name: "name", align: "left", label: "Nombre", field: "name", sortable: true },
  { name: "quantity", align: "center", label: "Cantidad", field: "quantity", sortable: true },
  { name: "price", align: "right", label: "Precio", field: "price", sortable: true }
]);

const rows = ref([]);
const localInvoices = ref([]);
const loading = ref(false);

// Modal de detalles
const showInvoiceDetailsModal = ref(false);
const selectedInvoice = ref(null);

// Filtrar las facturas dependiendo de si se muestran solo locales o también las validadas
const filteredInvoices = computed(() => {
  if (showApiInvoices.value) {
    return [...localInvoices.value, ...rows.value];
  } else {
    return [...localInvoices.value];
  }
});

// Opciones para los selectores
const paymentFormOptions = ref([
  { label: "Contado", value: "1" },
  { label: "Crédito", value: "2" }
]);

const paymentMethodOptions = ref([
  { label: "Efectivo", value: "10" },
  { label: "Tarjeta de Crédito", value: "49" },
  { label: "Tarjeta Débito", value: "48" },
  { label: "Transferencia Bancaria", value: "47" }
]);

// Datos de formulario
const users = ref([]);
const products = ref([]);
const facturaimagen = ref("");
const showCreateModal = ref(false);
const invoice = ref({
  customerId: "",
  referenceCode: "I316979",
  observation: "Factura generada desde la aplicación",
  paymentForm: "1",
  paymentMethodCode: "10",
  paymentDueDate: new Date().toISOString().slice(0, 10),
  billingPeriod: {
    startDate: new Date().toISOString().slice(0, 10),
    startTime: "00:00:00",
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 10),
    endTime: "23:59:59"
  },
  items: [{ productId: "", quantity: 1 }]
});

// Opciones para los selectores
const userOptions = computed(() => {
  return users.value.map(user => ({
    label: `${user.names || user.company} (${user.identification})`,
    value: user._id
  }));
});

const productOptions = computed(() => {
  return products.value.map(product => ({
    label: `${product.name} - $${formatCurrency(product.price)}`,
    value: product._id
  }));
});

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    const apiInvoices = ref([]); // Siempre debe iniciar como array
const localInvoices = ref([]); // Igual
    users.value = await getData("/api/usuarios");
    products.value = await getData("/api/servicios");
    
    // Cargar facturas existentes
    await dataFacturas();
  } catch (error) {
    console.error("Error al cargar datos iniciales:", error);
    showNotification('negative', 'Error al cargar datos iniciales');
  }
});

// Métodos para manejo de tabla
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value || 0);
};

const formatDate = (dateString) => {
  return dateString ? new Date(dateString).toLocaleDateString('es-CO') : 'N/A';
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

// Método combinado para cargar facturas
const dataFacturas = async () => {
  loading.value = true;
  try {
  
    
    // Cargar facturas de API
    await loadApiInvoices();
  } catch (error) {
    console.error("Error al cargar facturas:", error);
    showNotification('negative', 'Error al cargar facturas');
  } finally {
    loading.value = false;
  }
};

const calculateLocalInvoiceTotal = () => {
  if (selectedInvoice.value && selectedInvoice.value.isLocal) {
    return selectedInvoice.value.items.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0);
  }
  return 0;
};

// Abrir modal de detalles de factura
const openInvoiceDetailsModal = (invoice) => {
  selectedInvoice.value = {
    ...invoice,
    qr: invoice.qr || null,
    cufe: invoice.cufe || null,
    numero: invoice.numero || invoice.number || invoice.referenceCode,
    url: invoice.url || null
  };
  showInvoiceDetailsModal.value = true;
};

// Método para alternar visualización de facturas de API
const toggleApiInvoices = () => {
  showApiInvoices.value = !showApiInvoices.value;
};

// Métodos para ver y descargar facturas
const openInvoiceInBrowser = (invoice) => {
  if (invoice && invoice.number) {
    const token = store.token || localStorage.getItem('token');
    if (!token) {
      showNotification('negative', 'No se encontró token de autenticación');
      return;
    }

    // Abrir en nueva pestaña
    window.open(`https://api-sandbox.factus.com.co/v1/bills/show/${invoice.number}`, '_blank');
  } else {
    showNotification('negative', 'No se pudo abrir la factura. Número de factura no disponible.');
  }
};

const downloadInvoicePdf = async (invoice) => {
  if (invoice && invoice.number) {
    try {
      const token = store.token || localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      // Mostrar indicador de carga
      showLoading('Descargando factura...');

      // Solicitar PDF
      const response = await axios.get(
        `https://api-sandbox.factus.com.co/v1/bills/download-pdf/${invoice.number}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          },
          responseType: 'blob'
        }
      );

      // Crear objeto URL y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Factura-${invoice.number}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification('positive', 'Factura descargada correctamente');
    } catch (error) {
      console.error("Error al descargar factura:", error);
      showNotification('negative', 'Error al descargar factura');
    } finally {
      hideLoading();
    }
  } else {
    showNotification('negative', 'No se pudo descargar la factura. Número de factura no disponible.');
  }
};

// Métodos para manejo del formulario
const openCreateModal = () => {
  const refCode = "F" + Math.floor(Math.random() * 10000);
  
  const today = new Date().toISOString().slice(0, 10);
  const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 10);
  
  invoice.value = {
    customerId: "",
    referenceCode: refCode,
    observation: "Factura generada desde la aplicación",
    paymentForm: "1",
    paymentMethodCode: "10",
    paymentDueDate: nextMonth,
    billingPeriod: {
      startDate: today,
      startTime: "00:00:00",
      endDate: nextMonth,
      endTime: "23:59:59"
    },
    items: [{ productId: "", quantity: 1 }]
  };
  
  facturaimagen.value = "";
  isInvoiceValidated.value = false;
  showCreateModal.value = true;
};

const addItem = () => {
  invoice.value.items.push({ productId: "", quantity: 1 });
};

const removeItem = (index) => {
  invoice.value.items.splice(index, 1);
};

// Crear factura local
const createInvoice = async () => {
  try {
    if (!invoice.value.customerId || invoice.value.items.some(item => !item.productId || item.quantity <= 0)) {
      showNotification('negative', 'Complete todos los campos requeridos');
      return;
    }

    const selectedUser   = users.value.find(user => user._id === invoice.value.customerId);
    if (!selectedUser  ) {
      showNotification('negative', 'Cliente no encontrado');
      return;
    }

    let validatedData = {};
    try {
      const lastValidated = JSON.parse(sessionStorage.getItem("ultimaFacturaValidada"));
      if (lastValidated) {
        validatedData = lastValidated;
      }
    } catch (e) {
      console.error("Error parsing last validated invoice:", e);
    }

    const invoiceData = {
      numberingRangeId: 1,
      referenceCode: invoice.value.referenceCode,
      observation: invoice.value.observation,
      paymentForm: invoice.value.paymentForm,
      paymentDueDate: invoice.value.paymentDueDate,
      paymentMethodCode: invoice.value.paymentMethodCode,
      billingPeriod: {
        startDate: invoice.value.billingPeriod.startDate,
        startTime: invoice.value.billingPeriod.startTime,
        endDate: invoice.value.billingPeriod.endDate,
        endTime: invoice.value.billingPeriod.endTime
      },
      customer: selectedUser  ._id,
      items: invoice.value.items.map(item => {
        const selectedProduct = products.value.find(p => p._id === item.productId);
        return {
          product: item.productId,
          name: selectedProduct?.name,
          price: selectedProduct?.price,
          quantity: item.quantity,
          discountRate: 0,
          withholdingTaxes: []
        };
      }),
      cufe: validatedData.cufe || null,
      numero: validatedData.numero || null,
      url: validatedData.url || null,
      qr: validatedData.qr || null,
      isValidated: !!validatedData.cufe
    };

    console.log("Enviando a API local:", JSON.stringify(invoiceData, null, 2));
    const response = await postData("/api/facturas/local", invoiceData);
    
    showNotification('positive', 'Factura guardada con éxito');
    
    await dataFacturas();
    showCreateModal.value = false;
    
  } catch (error) {
    console.error("Error al crear factura local:", error.response?.data || error.message);
    showNotification('negative', 'Error al crear factura local');
  }
};

const validateInvoice = async () => {
  try {
    const authToken = store.token;
    
    if (!authToken) {
      showNotification('negative', 'No hay token de autenticación. Por favor inicie sesión nuevamente.');
      return;
    }

    const selectedUser   = users.value.find(user => user._id === invoice.value.customerId);
    if (!selectedUser  ) {
      showNotification('negative', 'Por favor seleccione un cliente válido.');
      return;
    }

    if (invoice.value.items.length === 0 || invoice.value.items.some(item => !item.productId || item.quantity <= 0)) {
      showNotification('negative', 'Por favor seleccione al menos un producto con cantidad válida.');
      return;
    }

    const factusInvoice = {
      reference_code: invoice.value.referenceCode,
      observation: invoice.value.observation,
      payment_form: invoice.value.paymentForm,
      payment_due_date: invoice.value.paymentDueDate,
      payment_method_code: invoice.value.paymentMethodCode,
      billing_period: {
        start_date: invoice.value.billingPeriod.startDate,
        start_time: invoice.value.billingPeriod.startTime,
        end_date: invoice.value.billingPeriod.endDate,
        end_time: invoice.value.billingPeriod.endTime
      },
      customer: {
        identification: selectedUser  .identification || "",
        dv: selectedUser  .dv || "",
        company: selectedUser  .company || "",
        trade_name: selectedUser  .tradeName || selectedUser  .names || selectedUser  .company,
        names: selectedUser  .names || selectedUser  .company,
        address: selectedUser  .address || "",
        email: selectedUser  .email || "",
        phone: selectedUser  .phone || "",
        legal_organization_id: selectedUser  .legalOrganizationId || "2",
        tribute_id: selectedUser  .tributeId || "21",
        identification_document_id: selectedUser  .identificationDocumentId || "3",
        municipality_id: selectedUser  .municipalityId || "980"
      },
      items: invoice.value.items.map(item => {
        const selectedProduct = products.value.find(p => p._id === item.productId);
        if (!selectedProduct) {
          throw new Error(`Producto no encontrado: ${item.productId}`);
        }

        return {
          code_reference: selectedProduct.codeReference || "12345",
          name: selectedProduct.name,
          quantity: parseInt(item.quantity) || 1,
          discount_rate: 0,
          price: parseFloat(selectedProduct.price) || 50000,
          tax_rate: selectedProduct.taxRate ? parseFloat(selectedProduct.taxRate).toFixed(2) : "19.00",
          unit_measure_id: selectedProduct.unitMeasureId || 70,
          standard_code_id: selectedProduct.standardCodeId || 1,
          is_excluded: selectedProduct.isExcluded ? 1 : 0,
          tribute_id: selectedProduct.tributeId || 1,
          withholding_taxes: []
        };
      })
    };

    console.log("Enviando factura a Factus:", JSON.stringify(factusInvoice, null, 2));

    showLoading('Validando factura con Factus...');

    const response = await apiClienteFactus.post("/v1/bills/validate", factusInvoice, {
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      timeout: 30000
    });

    if (response.data.data?.bill?.errors && response.data.data.bill.errors.length > 0) {
      const errorMsg = response.data.data.bill.errors.join('\n');
      showNotification('negative', `Factura validada con advertencias:\n${errorMsg}`);
    } else {
      showNotification('positive', 'Factura validada con éxito en Factus');
    }
    
    console.log("Respuesta Factus:", response.data);
    facturaimagen.value = response.data;
    
    const facturaValidada = {
      cufe: response.data.data?.bill?.cufe,
      numero: response.data.data?.bill?.number,
      url: response.data.data?.bill?.public_url,
      qr: response.data.data?.bill?.qr
    };
    
    sessionStorage.setItem("ultimaFacturaValidada", JSON.stringify(facturaValidada));
        // Actualizar la tabla de facturas
        await dataFacturas();
    
  } catch (error) {
    console.error("Error completo:", error);

    if (error.response) {
      console.error("Datos de error:", error.response.data);
      console.error("Estado:", error.response.status);
      console.error("Cabeceras:", error.response.headers);

      if (error.response.data?.data?.errors) {
        let errorMessage = "Errores de validación en Factus:\n";
        const errors = error.response.data.data.errors;
        for (const field in errors) {
          errorMessage += `- ${field}: ${errors[field].join(', ')}\n`;
        }
        showNotification('negative', errorMessage);
      } else if (error.response.data?.message) {
        showNotification('negative', `Error en Factus: ${error.response.data.message}`);
      } else {
        showNotification('negative', `Error ${error.response.status}: Respuesta inesperada del servidor`);
      }
    } else if (error.request) {
      console.error("No se recibió respuesta:", error.request);
      showNotification('negative', 'No se recibió respuesta del servidor de Factus. Verifique su conexión a internet.');
    } else {
      console.error("Error de configuración:", error.message);
      showNotification('negative', `Error al preparar la solicitud: ${error.message}`);
    }
  }
};
</script>

<style scoped>
.custom-notify {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  width: 300px;
}

.q-banner {
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.bg-positive {
  background-color: #4caf50; /* Verde */
}

.bg-negative {
  background-color: #f44336; /* Rojo */
}

.bg-secondary {
  background-color: #2196f3; /* Azul */
}
#contenedorFactura{
  margin-top: 100px;
  width: 100%;
}
div.q-page-container{
  width: 100%;

}
#opcionesFactura{
  display: flex;
  flex-direction: row;
  justify-content: center;

}
.q-mr-xs{
  width: 50px;
}
#btnCrearFactura{
  display: flex;
  align-items: center;
  justify-content: space-evenly;
}
.q-ml-sm{
  width: 200px;
}
.text-h6{
  
  text-align: center;
  
}

.contenedorCabeza{
  display: flex;
  justify-content: space-around;
  align-content: center;
  width: 100%;

}

</style>