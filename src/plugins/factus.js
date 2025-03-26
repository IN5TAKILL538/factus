import axios from 'axios'
const apiCliente2= axios.create({
    baseURL: 'https://api-sandbox.factus.com.co',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });
  
  
  apiCliente2.interceptors.request.use(
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
  apiCliente2.interceptors.response.use(
    response => {
      return response;
    },
    error => {
      console.error("Error en la respuesta:", error);
      // Puedes manejar errores aquí
      return Promise.reject(error);
    }
  );
  
  
  export default apiCliente2;