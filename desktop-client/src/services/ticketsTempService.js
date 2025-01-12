import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/tickets-temps`;

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

// Función para confirmar un pedido
export const confirmarPedido = async (pedidoData) => {
   try {
       const response = await api.post('/confirmar-pedido', pedidoData);
       return response.data;
   } catch (error) {
       if (error.response && error.response.data) {
           const message = error.response.data.message;
           if (message.includes('Stock insuficiente')) {
               throw new Error(message);
           }
       }
       console.error('Error al confirmar pedido:', error);
       throw error;
   }
};

// Función para eliminar un producto del ticket
export const removeProducto = async (removeData) => {
   try {
       const response = await api.post('/remove-producto', removeData);
       return response.data;
   } catch (error) {
       if (error.response) {
           if (error.response.status === 401) {
               throw new Error('Usuario no encontrado o código incorrecto');
           } else if (error.response.status === 403) {
               throw new Error('No tienes permisos para eliminar productos o ingredientes');
           } else if (error.response.status === 404) {
               throw new Error('Producto o ingrediente no encontrado');
           }
       }
       console.error('Error al eliminar producto:', error);
       throw error;
   }
};

// Función para aplicar descuento
export const applyDescuento = async (descuentoData) => {
   try {
       const response = await api.post('/apply-descuento', descuentoData);
       return response.data;
   } catch (error) {
       if (error.response) {
           if (error.response.status === 401) {
               throw new Error('Usuario no encontrado o código incorrecto');
           } else if (error.response.status === 403) {
               throw new Error('No tienes permisos para aplicar descuentos');
           } else if (error.response.status === 404) {
               throw new Error('Ticket no encontrado');
           }
       }
       console.error('Error al aplicar descuento:', error);
       throw error;
   }
};

// Función para obtener ticket por mesa
export const getTicketByMesa = async (mesaId) => {
   try {
       const response = await api.get(`/mesa/${mesaId}`);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Ticket no encontrado para esta mesa');
       }
       console.error('Error al obtener ticket de mesa:', error);
       throw error;
   }
};

// Función para cerrar mesa
export const cerrarMesa = async (cerrarData) => {
   try {
       const response = await api.post('/cerrar-mesa', cerrarData);
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Ticket temporal no encontrado');
       }
       console.error('Error al cerrar mesa:', error);
       throw error;
   }
};

// Función para obtener todas las mesas abiertas
export const getAllMesasAbiertas = async () => {
   try {
       const response = await api.get('/mesas-abiertas');
       return response.data;
   } catch (error) {
       console.error('Error al obtener mesas abiertas:', error);
       throw error;
   }
};

// Función para juntar mesas
export const juntarMesas = async (juntarData) => {
   try {
       const response = await api.put('/juntar', juntarData);
       return response.data;
   } catch (error) {
       if (error.response) {
           if (error.response.status === 404) {
               throw new Error('Una o más mesas no encontradas');
           }
       }
       console.error('Error al juntar mesas:', error);
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