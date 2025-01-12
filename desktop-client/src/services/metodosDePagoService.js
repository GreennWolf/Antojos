import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/metodos-pago`;

// Crear instancia de axios
const api = axios.create({
   baseURL: API_BASE_URL
});

// Interceptor para añadir el token
api.interceptors.request.use(
   (config) => {
       const token = localStorage.getItem('token');
       if (token) {
           config.headers.Authorization = `Bearer ${token}`;
       }
       return config;
   },
   (error) => {
       return Promise.reject(error);
   }
);

// Función para crear un nuevo método de pago
export const createMetodoPago = async (metodoPagoData) => {
   try {
       const response = await api.post('/', metodoPagoData);
       return response.data;
   } catch (error) {
       console.error('Error al crear método de pago:', error);
       throw error;
   }
};

// Función para obtener todos los métodos de pago
export const getMetodosPago = async () => {
   try {
       const response = await api.get('/');
       return response.data;
   } catch (error) {
       console.error('Error al obtener métodos de pago:', error);
       throw error;
   }
};

// Función para obtener un método de pago por ID
export const getMetodoPagoById = async (id) => {
   try {
       const response = await api.get(`/${id}`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Método de pago no encontrado');
       }
       console.error('Error al obtener método de pago:', error);
       throw error;
   }
};

// Función para actualizar un método de pago
export const updateMetodoPago = async (id, metodoPagoData) => {
   try {
       const response = await api.put(`/${id}`, metodoPagoData);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Método de pago no encontrado');
       }
       console.error('Error al actualizar método de pago:', error);
       throw error;
   }
};

// Función para eliminar un método de pago
export const deleteMetodoPago = async (id) => {
   try {
       const response = await api.delete(`/${id}`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Método de pago no encontrado');
       }
       console.error('Error al eliminar método de pago:', error);
       throw error;
   }
};

// Función para activar/desactivar un método de pago
export const toggleMetodoPagoActive = async (id) => {
   try {
       const response = await api.patch(`/${id}/toggle`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Método de pago no encontrado');
       }
       console.error('Error al cambiar estado del método de pago:', error);
       throw error;
   }
};

// Interceptor para manejar errores de token
api.interceptors.response.use(
   (response) => response,
   (error) => {
       if (error.response?.status === 401) {
           localStorage.removeItem('token');
           localStorage.removeItem('user');
           localStorage.removeItem('permisos');
           window.location.href = '/';
       }
       return Promise.reject(error);
   }
);