import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/salones`;

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

// Función para crear un nuevo salón
export const createSalon = async (salonData) => {
   try {
       const response = await api.post('/', salonData);
       return response.data;
   } catch (error) {
       console.error('Error al crear salón:', error);
       throw error;
   }
};

// Función para obtener todos los salones
export const getSalones = async () => {
   try {
       const response = await api.get('/');
       return response.data;
   } catch (error) {
       console.error('Error al obtener salones:', error);
       throw error;
   }
};

// Función para obtener un salón por ID
export const getSalonById = async (id) => {
   try {
       const response = await api.get(`/${id}`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Salón no encontrado');
       }
       console.error('Error al obtener salón:', error);
       throw error;
   }
};

// Función para actualizar un salón
export const updateSalon = async (id, salonData) => {
   try {
       const response = await api.put(`/${id}`, salonData);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Salón no encontrado');
       }
       console.error('Error al actualizar salón:', error);
       throw error;
   }
};

// Función para eliminar un salón
export const deleteSalon = async (id) => {
   try {
       const response = await api.delete(`/${id}`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Salón no encontrado');
       }
       console.error('Error al eliminar salón:', error);
       throw error;
   }
};

// Función para activar/desactivar un salón
export const toggleSalonActive = async (id) => {
   try {
       const response = await api.patch(`/${id}/toggle`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Salón no encontrado');
       }
       console.error('Error al cambiar estado del salón:', error);
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