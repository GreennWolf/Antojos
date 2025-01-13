import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/categorias`;

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

// Función para crear una nueva categoría
export const createCategoria = async (categoriaData) => {
   try {
       const response = await api.post('/', categoriaData);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 400) {
           throw new Error(error.response.data.message || 'Error al crear la categoría');
       }
       console.error('Error al crear categoría:', error);
       throw error;
   }
};

// Función para obtener todas las categorías
export const getCategorias = async () => {
   try {
       const response = await api.get('/');
       return response.data;
   } catch (error) {
       console.error('Error al obtener categorías:', error);
       throw error;
   }
};

// Función para obtener una categoría por ID
export const getCategoriaById = async (id) => {
   try {
       const response = await api.get(`/${id}`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Categoría no encontrada');
       }
       console.error('Error al obtener categoría:', error);
       throw error;
   }
};

// Función para actualizar una categoría
export const updateCategoria = async (id, categoriaData) => {
   try {
       const response = await api.put(`/${id}`, categoriaData);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Categoría no encontrada');
       }
       console.error('Error al actualizar categoría:', error);
       throw error;
   }
};

// Función para eliminar una categoría
export const deleteCategoria = async (id) => {
   try {
       const response = await api.delete(`/${id}`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Categoría no encontrada');
       }
       console.error('Error al eliminar categoría:', error);
       throw error;
   }
};

// Función para activar/desactivar una categoría
export const toggleCategoriaActive = async (id) => {
   try {
       const response = await api.patch(`/${id}/toggle`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Categoría no encontrada');
       }
       console.error('Error al cambiar estado de la categoría:', error);
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