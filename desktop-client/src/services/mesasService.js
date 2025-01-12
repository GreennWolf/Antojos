import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/mesas`;

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

// Función para crear una nueva mesa
export const createMesa = async (mesaData) => {
   try {
       const response = await api.post('/', mesaData);
       return response.data;
   } catch (error) {
       console.error('Error al crear mesa:', error);
       throw error;
   }
};

// Función para obtener todas las mesas
export const getMesas = async () => {
   try {
       const response = await api.get('/');
       return response.data;
   } catch (error) {
       console.error('Error al obtener mesas:', error);
       throw error;
   }
};

// Función para obtener mesas por salón
export const getMesasBySalon = async (salonId) => {
   try {
       const response = await api.get(`/salon/${salonId}`);
       return response.data;
   } catch (error) {
       console.error('Error al obtener mesas del salón:', error);
       throw error;
   }
};

// Función para obtener una mesa por ID
export const getMesaById = async (id) => {
   try {
       const response = await api.get(`/${id}`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Mesa no encontrada');
       }
       console.error('Error al obtener mesa:', error);
       throw error;
   }
};

// Función para actualizar una mesa
export const updateMesa = async (id, mesaData) => {
   try {
       const response = await api.put(`/${id}`, mesaData);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Mesa no encontrada');
       }
       console.error('Error al actualizar mesa:', error);
       throw error;
   }
};

// Función para eliminar una mesa
export const deleteMesa = async (id) => {
   try {
       const response = await api.delete(`/${id}`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Mesa no encontrada');
       }
       console.error('Error al eliminar mesa:', error);
       throw error;
   }
};

// Función para activar/desactivar una mesa
export const toggleMesaActive = async (id) => {
   try {
       const response = await api.patch(`/${id}/toggle`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Mesa no encontrada');
       }
       console.error('Error al cambiar estado de la mesa:', error);
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