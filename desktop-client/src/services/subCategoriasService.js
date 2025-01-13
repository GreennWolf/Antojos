import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/subcategorias`;

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

// Función para crear una nueva subcategoría
export const createSubCategoria = async (subCategoriaData) => {
   try {
       const response = await api.post('/', subCategoriaData);
       return response.data;
   } catch (error) {
       console.error('Error al crear subcategoría:', error);
       throw error;
   }
};

// Función para obtener todas las subcategorías
export const getSubCategorias = async () => {
   try {
       const response = await api.get('/');
       return response.data;
   } catch (error) {
       console.error('Error al obtener subcategorías:', error);
       throw error;
   }
};

// Función para obtener una subcategoría por ID
export const getSubCategoriaById = async (id) => {
   try {
       const response = await api.get(`/${id}`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Subcategoría no encontrada');
       }
       console.error('Error al obtener subcategoría:', error);
       throw error;
   }
};

// Función para actualizar una subcategoría
export const updateSubCategoria = async (id, subCategoriaData) => {
   try {
       const response = await api.put(`/${id}`, subCategoriaData);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Subcategoría no encontrada');
       }
       console.error('Error al actualizar subcategoría:', error);
       throw error;
   }
};

// Función para eliminar una subcategoría
export const deleteSubCategoria = async (id) => {
   try {
       const response = await api.delete(`/${id}`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Subcategoría no encontrada');
       }
       console.error('Error al eliminar subcategoría:', error);
       throw error;
   }
};

// Función para activar/desactivar una subcategoría
export const toggleSubCategoriaActive = async (id) => {
   try {
       const response = await api.patch(`/${id}/toggle`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Subcategoría no encontrada');
       }
       console.error('Error al cambiar estado de la subcategoría:', error);
       throw error;
   }
};

// Función para agregar un ingrediente a una subcategoría
export const addIngredienteToSubCategoria = async (id, ingredienteId) => {
   try {
       const response = await api.post(`/${id}/ingredientes`, {
           ingredienteId
       });
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Subcategoría no encontrada');
       }
       console.error('Error al agregar ingrediente a la subcategoría:', error);
       throw error;
   }
};

// Función para remover un ingrediente de una subcategoría
export const removeIngredienteFromSubCategoria = async (id, ingredienteId) => {
   try {
       const response = await api.delete(`/${id}/ingredientes`, {
           data: { ingredienteId }
       });
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Subcategoría no encontrada');
       }
       console.error('Error al remover ingrediente de la subcategoría:', error);
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