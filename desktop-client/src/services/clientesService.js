import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/clientes`;

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

// Función para crear un nuevo cliente
export const createCliente = async (clienteData) => {
   try {
       const response = await api.post('/', clienteData);
       return response.data;
   } catch (error) {
       console.error('Error al crear cliente:', error);
       throw error;
   }
};

// Función para obtener todos los clientes
export const getClientes = async () => {
   try {
       const response = await api.get('/');
       return response.data;
   } catch (error) {
       console.error('Error al obtener clientes:', error);
       throw error;
   }
};

// Función para buscar clientes
export const searchClientes = async (searchQuery) => {
   try {
       const response = await api.get('/search', {
           params: { q: searchQuery }
       });
       return response.data;
   } catch (error) {
       console.error('Error al buscar clientes:', error);
       throw error;
   }
};

// Función para obtener un cliente por NIF
export const getClienteByNif = async (nif) => {
   try {
       const response = await api.get(`/nif/${nif}`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Cliente no encontrado');
       }
       console.error('Error al obtener cliente por NIF:', error);
       throw error;
   }
};

// Función para obtener un cliente por ID
export const getClienteById = async (id) => {
   try {
       const response = await api.get(`/${id}`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Cliente no encontrado');
       }
       console.error('Error al obtener cliente:', error);
       throw error;
   }
};

// Función para actualizar un cliente
export const updateCliente = async (id, clienteData) => {
   try {
       const response = await api.put(`/${id}`, clienteData);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Cliente no encontrado');
       }
       console.error('Error al actualizar cliente:', error);
       throw error;
   }
};

// Función para eliminar un cliente
export const deleteCliente = async (id) => {
   try {
       const response = await api.delete(`/${id}`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Cliente no encontrado');
       }
       console.error('Error al eliminar cliente:', error);
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