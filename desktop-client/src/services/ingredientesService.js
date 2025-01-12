import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/ingredientes`;

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

// Función para crear un nuevo ingrediente
export const createIngrediente = async (ingredienteData) => {
   try {
       const response = await api.post('/', ingredienteData);
       return response.data;
   } catch (error) {
       console.error('Error al crear ingrediente:', error);
       throw error;
   }
};

// Función para obtener todos los ingredientes
export const getIngredientes = async () => {
   try {
       const response = await api.get('/');
       return response.data;
   } catch (error) {
       console.error('Error al obtener ingredientes:', error);
       throw error;
   }
};

// Función para buscar ingredientes por nombre
export const searchIngredientesByNombre = async (nombre) => {
   try {
       const response = await api.get('/search', {
           params: { nombre }
       });
       return response.data;
   } catch (error) {
       console.error('Error al buscar ingredientes:', error);
       throw error;
   }
};

// Función para obtener ingredientes por categoría
export const getIngredientesByCategoria = async (categoriaId) => {
   try {
       const response = await api.get(`/categoria/${categoriaId}`);
       return response.data;
   } catch (error) {
       console.error('Error al obtener ingredientes por categoría:', error);
       throw error;
   }
};

// Función para obtener un ingrediente por ID
export const getIngredienteById = async (id) => {
   try {
       const response = await api.get(`/${id}`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Ingrediente no encontrado');
       }
       console.error('Error al obtener ingrediente:', error);
       throw error;
   }
};

// Función para actualizar un ingrediente
export const updateIngrediente = async (id, ingredienteData) => {
   try {
       const response = await api.put(`/${id}`, ingredienteData);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Ingrediente no encontrado');
       }
       console.error('Error al actualizar ingrediente:', error);
       throw error;
   }
};

// Función para eliminar un ingrediente
export const deleteIngrediente = async (id) => {
   try {
       const response = await api.delete(`/${id}`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Ingrediente no encontrado');
       }
       console.error('Error al eliminar ingrediente:', error);
       throw error;
   }
};

// Función para activar/desactivar un ingrediente
export const toggleIngredienteActive = async (id) => {
   try {
       const response = await api.patch(`/${id}/toggle`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Ingrediente no encontrado');
       }
       console.error('Error al cambiar estado del ingrediente:', error);
       throw error;
   }
};

// Función para actualizar el stock de un ingrediente
export const updateIngredienteStock = async (id, stockData) => {
   try {
       const response = await api.patch(`/${id}/stock`, stockData);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Ingrediente no encontrado');
       }
       console.error('Error al actualizar stock del ingrediente:', error);
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