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
     
      <q-btn color="primary" @click="toggleApiInvoices"><i class="fas fa-exchange-alt"></i> <!-- Icono de "exchange" --></q-btn>
      
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
    





    <q-dialog
  v-model="showInvoiceDetailsModal"
  persistent
  maximized
  class="invoice-details-dialog"
>
  <q-card class="full-height column no-wrap">
    <!-- Elegant Header -->
    <q-toolbar class="bg-primary text-white shadow-2">
      <q-toolbar-title class="text-h5 text-weight-bold">
        <q-icon name="receipt_long" class="q-mr-md" size="md" />
        Detalles de Factura
      </q-toolbar-title>
      <q-btn 
        icon="close" 
        flat 
        round 
        dense 
        color="white" 
        v-close-popup 
        class="hover-accent" 
      />
    </q-toolbar>

    <!-- Scrollable Content -->
    <q-card-section v-if="selectedInvoice" class="col scroll q-pa-lg">
      <!-- Company Header -->
      <div class="row items-center q-mb-xl">
        <div class="col-12 text-center">
          <!-- Logo Section -->
          <div class="flex flex-center q-mb-md">
            <q-avatar size="120px" class="shadow-3">
              <img 
                :src="
                  invoiceDetails?.company?.url_logo || 
                  selectedInvoice.logoUrl || 
                  '/default-logo.png'
                "
                :alt="
                  invoiceDetails?.company?.name || 
                  selectedInvoice.companyName || 
                  'Company Logo'
                "
                class="fit-contain"
              />
            </q-avatar>
          </div>

          <!-- Company Details -->
          <div>
            <div class="text-h4 text-primary text-weight-bold">
              {{ 
                invoiceDetails?.company?.company || 
                selectedInvoice.companyName || 
                'FACTUS S.A.S.' 
              }}
            </div>
            <div class="text-subtitle1 text-grey-8">
              NIT: {{ 
                invoiceDetails?.company?.nit || 
                selectedInvoice.companyNit || 
                '' 
              }}-{{ 
                invoiceDetails?.company?.dv || 
                selectedInvoice.companyDv || 
                '' 
              }}
            </div>
            <div class="text-caption text-grey-7">
              {{ 
                invoiceDetails?.company?.direction || 
                selectedInvoice.companyAddress || 
                '' 
              }} - {{ 
                invoiceDetails?.company?.municipality || 
                selectedInvoice.companyMunicipality || 
                '' 
              }}
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="row q-col-gutter-lg">
        <!-- Left Column -->
        <div class="col-12 col-md-6">
          <!-- Invoice Information Card -->
          <q-card flat bordered class="q-mb-md shadow-1">
            <q-card-section>
              <div class="text-h6 text-primary q-mb-sm flex items-center">
                <q-icon name="info" class="q-mr-sm" />
                Información de Factura
              </div>
              <q-list dense>
                <q-item>
                  <q-item-section>Número de Factura:</q-item-section>
                  <q-item-section side class="text-weight-bold">
                    {{ 
                      selectedInvoice.number || 
                      selectedInvoice.setpNumber || 
                      selectedInvoice.referenceCode || 
                      'Sin número' 
                    }}
                    <span 
                      v-if="selectedInvoice.setpNumber" 
                      class="text-caption text-grey-7 q-ml-sm"
                    >
                      (Ref: {{ selectedInvoice.setpNumber }} )
                    </span>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>Valor Total:</q-item-section>
                  <q-item-section side class="text-h6 text-primary">
                    {{ 
                      formatCurrency(
                        invoiceDetails?.bill?.total || 
                        selectedInvoice.total || 
                        calculateLocalInvoiceTotal()
                      ) 
                    }}
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>Fecha de Emisión:</q-item-section>
                  <q-item-section side>
                    {{ 
                      formatDate(invoiceDetails?.bill?.created_at || selectedInvoice.created_at) 
                    }}
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>Estado:</q-item-section>
                  <q-item-section side>
                    <q-badge 
                      :color="
                        (invoiceDetails?.bill?.status === 1 || selectedInvoice.status === 'Validada') 
                        ? 'green' 
                        : 'orange'
                      "
                      class="text-weight-bold"
                    >
                      {{ 
                        invoiceDetails?.bill?.status === 1 
                        ? 'Validada' 
                        : selectedInvoice.status || 'Pendiente' 
                      }}
                    </q-badge>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <!-- Customer Information Card -->
          <q-card flat bordered class="shadow-1">
            <q-card-section>
              <div class="text-h6 text-primary q-mb-sm flex items-center">
                <q-icon name="person" class="q-mr-sm" />
                Información del Cliente
              </div>
              <q-list dense>
                <q-item>
                  <q-item-section>Nombre:</q-item-section>
                  <q-item-section side>
                    {{ 
                      invoiceDetails?.customer?.graphic_representation_name || 
                      selectedInvoice.names || 
                      selectedInvoice.customerName || 
                      'No disponible' 
                    }}
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>Identificación:</q-item-section>
                  <q-item-section side>
                    {{ 
                      invoiceDetails?.customer?.identification || 
                      selectedInvoice.identification || 
                      selectedInvoice.customerIdentification || 
                      'No disponible' 
                    }}
                    <span v-if="invoiceDetails?.customer?.dv">
                      -{{ invoiceDetails.customer.dv }}
                    </span>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>Correo:</q-item-section>
                  <q-item-section side>
                    {{ 
                      invoiceDetails?.customer?.email || 
                      selectedInvoice.email || 
                      selectedInvoice.customerEmail || 
                      'No disponible' 
                    }}
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>Dirección:</q-item-section>
                  <q-item-section side>
                    {{ 
                      invoiceDetails?.customer?.address || 
                      selectedInvoice.customerAddress || 
                      'No disponible' 
                    }}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>

        <!-- Right Column -->
        <div class="col-12 col-md-6">
          <!-- Payment Details Card -->
          <q-card flat bordered class="q-mb-md shadow-1">
            <q-card-section>
              <div class="text-h6 text-primary q-mb-sm flex items-center">
                <q-icon name="payments" class="q-mr-sm" />
                Detalles de Pago
              </div>
              <q-list dense>
                <q-item>
                  <q-item-section>Forma de Pago:</q-item-section>
                  <q-item-section side>
                    {{ 
                      invoiceDetails?.bill?.payment_form?.name || 
                      selectedInvoice.paymentForm || 
                      'No especificado' 
                    }}
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>Método de Pago:</q-item-section>
                  <q-item-section side>
                    {{ 
                      invoiceDetails?.bill?.payment_method?.name || 
                      selectedInvoice.paymentMethod || 
                      'No especificado' 
                    }}
                  </q-item-section>
                </q-item>
                <q-item v-if="invoiceDetails?.bill?.payment_due_date || selectedInvoice.paymentDueDate">
                  <q-item-section>Fecha de Vencimiento:</q-item-section>
                  <q-item-section side>
                    {{ 
                      formatDate(
                        invoiceDetails?.bill?.payment_due_date || 
                        selectedInvoice.paymentDueDate
                      ) 
                    }}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <!-- Value Summary Card -->
          <q-card flat bordered class="shadow-1">
            <q-card-section>
              <div class="text-h6 text-primary q-mb-sm flex items-center">
                <q-icon name="calculate" class="q-mr-sm" />
                Resumen de Valores
              </div>
              <q-list dense>
                <q-item>
                  <q-item-section>Valor Bruto:</q-item-section>
                  <q-item-section side>
                    {{ 
                      formatCurrency(
                        invoiceDetails?.bill?.gross_value || 
                        selectedInvoice.grossValue || 
                        calculateLocalInvoiceTotal()
                      ) 
                    }}
                  </q-item-section>
                </q-item>
                <q-item v-if="Number(invoiceDetails?.bill?.discount || selectedInvoice.discount) > 0">
                  <q-item-section>Descuentos:</q-item-section>
                  <q-item-section side class="text-negative">
                    -{{ 
                      formatCurrency(
                        invoiceDetails?.bill?.discount || 
                        selectedInvoice.discount
                      ) 
                    }}
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>Base Gravable:</q-item-section>
                  <q-item-section side>
                    {{ 
                      formatCurrency(
                        invoiceDetails?.bill?.taxable_amount || 
                        selectedInvoice.taxableAmount || 
                        calculateLocalInvoiceTotal()
                      ) 
                    }}
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>Impuestos:</q-item-section>
                  <q-item-section side>
                    {{ 
                      formatCurrency(
                        invoiceDetails?.bill?.tax_amount || 
                        selectedInvoice.taxAmount || 
                        0
                      ) 
                    }}
                  </q-item-section>
                </q-item>
                <q-item class="bg-blue-1">
                  <q-item-section class="text-h6 text-primary">
                    TOTAL:
                  </q-item-section>
                  <q-item-section side class="text-h6 text-primary">
                    {{ 
                      formatCurrency(
                        invoiceDetails?.bill?.total || 
                        selectedInvoice.total || 
                        calculateLocalInvoiceTotal()
                      ) 
                    }}
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- QR Code Section -->
      <div
        class="row justify-center q-mt-md"
        v-if="(selectedInvoice.isApi && (invoiceDetails?.bill?.qr_image || invoiceDetails?.bill?.qr)) || selectedInvoice.qrImage || selectedInvoice.qr"
      >
        <div class="col-12 col-sm-6 col-md-4">
          <q-card flat bordered class="text-center">
            <q-card-section>
              <div class="text-h6 text-primary">
                <q-icon name="qr_code" class="q-mr-sm" />
                Código QR
              </div>

              <q-separator class="q-my-sm" />

              <div class="flex flex-center q-pa-md">
                <img
                  :src="
                    invoiceDetails?.bill?.qr_image ||
                    invoiceDetails?.bill?.qr ||
                    selectedInvoice.qrImage ||
                    selectedInvoice.qr
                  "
                  alt="Código QR de Factura"
                  class="q-mt-sm qr-image"
                />
              </div>
              <div class="text-caption q-mt-sm text-grey-7">
                Escanee para verificar la factura
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card-section>
    <!-- Dialog Actions -->
    <q-card-actions align="right" class="bg-grey-2 q-pa-md">
      <q-btn 
        flat 
        label="Cerrar" 
        color="grey-7" 
        v-close-popup 
        no-caps
      />
      <q-btn 
        color="primary" 
        label="Descargar PDF" 
        icon="download"
        @click="downloadInvoicePdf(selectedInvoice)"
        no-caps
      />
      <q-btn 
        v-if="invoiceDetails?.bill?.public_url || selectedInvoice.url"
        color="secondary" 
        label="Ver en Línea" 
        icon="open_in_new"
        :href="invoiceDetails?.bill?.public_url || selectedInvoice.url"
        target="_blank"
        no-caps
      />
    </q-card-actions>
  </q-card>
</q-dialog>









    
    <!-- Modal para Crear/Validar Factura -->
    <q-dialog secondary v-model="showCreateModal" persistent maximized color="primary">
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
              <div class="contenedorbtns">
              <div class="q-mt-sm" id="btnAgregarproductos">
                <q-btn 
                  type="button" 
                  color="secondary" 
                  outline
                  icon="add" 
                  label="Producto" 
                  @click="addItem" 
                />
              </div>
            
            
            <div class="q-gutter-sm">
              
              <q-btn 
                type="button" 
                color="deep-orange" 
                label="Crear Factura" 
                @click="validateInvoice"
                :disable="!invoice.customerId || invoice.items.some(item => !item.productId || item.quantity <= 0)"
              />
            </div>
            </div>
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

    let allInvoices = [];
    let page = 1;
    let totalPages = 10;

    while (page <= totalPages) {
      const response = await axios.get(
        `https://api-sandbox.factus.com.co/v1/bills`, 
        {
          params: {
            page: page,
            per_page: 100, // Aumenta el número de facturas por página
            filter: {
              identification: '',
              names: '',
              number: '',
              prefix: '',
              reference_code: '',
              status: ''
            }
          },
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
    
      if (response.data && response.data.data && response.data.data.data) {
        allInvoices = [...allInvoices, ...response.data.data.data.map(invoice => ({
          ...invoice,
          isApi: true
        }))];

        // Actualiza el número total de páginas
        totalPages = response.data.data.last_page || 1;
        page++;
      } else {
        break;
      }
    }

    rows.value = allInvoices;
    console.log("Todas las facturas de API cargadas:", rows.value);
    return rows.value;
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
    console.log("base 64 ", invoice);
    
    try {
      const token = store.token || localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      // Mostrar indicador de carga
      showLoading('Descargando factura...');

      // Solicitar PDF en formato Base64
      const response = await axios.get(
        `https://api-sandbox.factus.com.co/v1/bills/download-pdf/${invoice.number}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );console.log("base 64 ", response);

      // Suponemos que la respuesta viene en formato Base64
      const base64Pdf = response.data.base64; // Cambia esto según la estructura de la respuesta

      if (!base64Pdf) {
        throw new Error('No se encontró el PDF en la respuesta');
      }

      // Convertir Base64 a Blob
      const byteCharacters = atob(base64Pdf);  // Decodificar Base64
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const pdfBlob = new Blob(byteArrays, { type: 'application/pdf' });

      // Crear objeto URL y descargar
      const url = window.URL.createObjectURL(pdfBlob);
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







const invoiceDetails = ref(null);


const openInvoiceDetailsModal = async (invoiceData) => {
  selectedInvoice.value = invoiceData;
  invoiceDetails.value = null;
  showInvoiceDetailsModal.value = true;
  console.log("Full Invoice Data:", JSON.stringify(invoiceData, null, 2));
  try {
    showLoading("Cargando detalles de factura...");
    const token = store.token || localStorage.getItem("token");
   
  
    const billNumber = 
      invoiceData.factusData?.number || 
      invoiceData.setpNumber || 
      invoiceData.referenceCode || 
      invoiceData.number;
   
    if (!billNumber) {
      throw new Error("No se encontró un número de factura válido");
    }
   
    console.log("Intentando cargar factura con número:", billNumber,
                "Tipo de factura:", invoiceData.isApi ? "API" : "Local");
 
    if (!invoiceData.isApi) {
      invoiceDetails.value = {
        company: {
          name: "FACTUS S.A.S.",
          nit: "901724254",
        },
        customer: {
          identification: invoiceData.customer?.identification || 'N/A',
          names: invoiceData.customer?.names || 'Cliente',
          email: invoiceData.customer?.email,
          phone: invoiceData.customer?.phone,
          address: invoiceData.customer?.address
        },
        bill: {
          number: billNumber,
          setpNumber: invoiceData.factusData?.number,
          referenceCode: invoiceData.referenceCode,
          total: invoiceData.items.reduce((total, item) => 
            total + (item.product.price * item.quantity), 0),
          cufe: invoiceData.factusData?.cufe,
          public_url: invoiceData.factusData?.public_url,
          qr: invoiceData.factusData?.qr,
          status: invoiceData.isValidated ? 'Validada' : 'Pendiente'
        },
        items: invoiceData.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          total: item.product.price * item.quantity
        })) 
      };
     
      showNotification(
        "warning",
        `Mostrando detalles de factura local con código: ${billNumber}`
      );
      return;
    }
   
    
    try {
      const response = await axios.get(
        `https://api-sandbox.factus.com.co/v1/bills/show/${billNumber}`, 
        { headers: { Authorization: `Bearer ${token} `} }
      );
     
      if (response.data && response.data.status === "OK") {
        invoiceDetails.value = {
          ...response.data.data,
          local_invoice_id: invoiceData._id,
          local_created_at: invoiceData.createdAt
        };
       
        console.log("Detalles de factura API cargados:", invoiceDetails.value);
      } else {
        throw new Error("No se pudieron cargar los detalles de la factura");
      }
    } catch (apiError) {
      console.error("Error al cargar desde API:", apiError);
      throw apiError;
    }
  } catch (error) {
    console.error("Error general al cargar detalles de factura:", error);
   
    showNotification(
      "negative",
      `Error al cargar detalles: ${error.message}` || "Error desconocido"
    );
  } finally {
    hideLoading();
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
.colum{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.text-subtitle1{
text-align: center;
}
.contenedorbtns{
  display: flex;

  align-items: center;
  flex-direction: column;
}
#btnAgregarproductos{
  margin: 20px;
}

</style>