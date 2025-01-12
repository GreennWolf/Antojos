import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/productos`;

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

// Función para crear un nuevo producto
export const createProducto = async (productoData) => {
   try {
       const response = await api.post('/', productoData);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 400) {
           if (error.response.data.message.includes('subcategoría')) {
               throw new Error('La subcategoría especificada no existe');
           } else if (error.response.data.message.includes('ingrediente')) {
               throw new Error('Uno o más ingredientes no existen');
           }
       }
       console.error('Error al crear producto:', error);
       throw error;
   }
};

// Función para obtener todos los productos
export const getProductos = async () => {
   try {
       const response = await api.get('/');
       return response.data;
   } catch (error) {
       console.error('Error al obtener productos:', error);
       throw error;
   }
};

// Función para buscar productos por nombre
export const searchProductosByNombre = async (nombre) => {
   try {
       const response = await api.get('/search', {
           params: { nombre }
       });
       return response.data;
   } catch (error) {
       console.error('Error al buscar productos:', error);
       throw error;
   }
};

// Función para obtener productos por subcategoría
export const getProductosBySubCategoria = async (subCategoriaId) => {
   try {
       const response = await api.get(`/subcategoria/${subCategoriaId}`);
       return response.data;
   } catch (error) {
       console.error('Error al obtener productos por subcategoría:', error);
       throw error;
   }
};

// Función para obtener un producto por ID
export const getProductoById = async (id) => {
   try {
       const response = await api.get(`/${id}`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Producto no encontrado');
       }
       console.error('Error al obtener producto:', error);
       throw error;
   }
};

// Función para actualizar un producto
export const updateProducto = async (id, productoData) => {
   try {
       const response = await api.put(`/${id}`, productoData);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Producto no encontrado');
       }
       console.error('Error al actualizar producto:', error);
       throw error;
   }
};

// Función para eliminar un producto
export const deleteProducto = async (id) => {
   try {
       const response = await api.delete(`/${id}`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Producto no encontrado');
       }
       console.error('Error al eliminar producto:', error);
       throw error;
   }
};

// Función para activar/desactivar un producto
export const toggleProductoActive = async (id) => {
   try {
       const response = await api.patch(`/${id}/toggle`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Producto no encontrado');
       }
       console.error('Error al cambiar estado del producto:', error);
       throw error;
   }
};

// Función para actualizar el stock de un producto
export const updateProductoStock = async (id, stockData) => {
   try {
       const response = await api.patch(`/${id}/stock`, stockData);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Producto no encontrado');
       }
       console.error('Error al actualizar stock del producto:', error);
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