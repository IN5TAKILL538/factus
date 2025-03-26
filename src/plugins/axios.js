import axios from 'axios';

const apiCliente= axios.create({
  baseURL: 'https://backfactus.onrender.com',
  //baseURL: 'http://localhost:3200',
  headers: {
    'Content-Type': 'application/json',
  },
});


apiCliente.interceptors.request.use(
  config => {
    

    const token = sessionStorage.getItem('authToken');
    if (token) {
      

      config.headers.Authorization =`Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error("Error en el interceptor de solicitud:", error);
    return Promise.reject(error);
  }
);

// Interceptor de respuesta
apiCliente.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.error("Error en la respuesta:", error);
    // Puedes manejar errores aquí
    return Promise.reject(error);
  }
);
export async function getData(url) {
  try {
    const response = await apiCliente.get(url);
    return response.data;
  } catch (error) {
    console.error("Error en la peticion get:", error);
    throw error;
  }
}

export async function postData(url, data) {
  try {
    const response = await apiCliente.post(url, data);
    return response.data;
  } catch (error) {
    console.error("Error en la peticion post:", error);
    throw error;
  }
}

export async function putData(url, data) {
  try {
    const response = await apiCliente.put(url, data);
    return response.data;
  } catch (error) {
    console.error("Error en la peticion put:", error);
    throw error;
  }
}


export default apiCliente;