import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/tickets`;

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

// Función para obtener todos los tickets
export const getTickets = async () => {
   try {
       const response = await api.get('/');
       return response.data;
   } catch (error) {
       console.error('Error al obtener tickets:', error);
       throw error;
   }
};

// Función para modificar el método de pago
export const modifyMetodoPago = async (ticketId, metodoPagoId) => {
   try {
       const response = await api.patch('/metodo-pago', {
           ticketId,
           metodoPagoId
       });
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Ticket no encontrado');
       }
       console.error('Error al modificar método de pago:', error);
       throw error;
   }
};

// Función para crear factura A
export const createFacturaA = async (ticketId, clienteId) => {
   try {
       const response = await api.post('/factura-a', {
           ticketId,
           clienteId
       });
       return response.data;
   } catch (error) {
       if (error.response) {
           if (error.response.status === 404) {
               const message = error.response.data.message;
               if (message.includes('Cliente')) {
                   throw new Error('Cliente no encontrado');
               } else {
                   throw new Error('Ticket no encontrado');
               }
           }
       }
       console.error('Error al crear factura A:', error);
       throw error;
   }
};

// Función para anular ticket
export const anularTicket = async (ticketId, motivoAnulacion) => {
   try {
       const response = await api.post('/anular', {
           ticketId,
           motivoAnulacion
       });
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Ticket no encontrado');
       }
       console.error('Error al anular ticket:', error);
       throw error;
   }
};

// Función para reabrir ticket
export const reopenTicket = async (ticketId) => {
   try {
       const response = await api.post('/reopen', {
           ticketId
       });
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('Ticket no encontrado');
       }
       console.error('Error al reabrir ticket:', error);
       throw error;
   }
};

// Función auxiliar para verificar si un ticket es anulable
export const isTicketAnulable = (ticket) => {
   return ticket && 
          ticket.estado === 'valido' && 
          !ticket.cliente; // No se puede anular si ya es factura A
};

// Función auxiliar para verificar si un ticket puede convertirse en factura A
export const isFacturableA = (ticket) => {
   return ticket && 
          ticket.estado === 'valido' && 
          !ticket.cliente && 
          ticket.serie !== 'A';
};

// Función auxiliar para verificar si un ticket puede reabrirse
export const isReopenable = (ticket) => {
   return ticket && 
          ticket.estado === 'valido' && 
          !ticket.cliente && 
          new Date(ticket.fechaCierre).getTime() > Date.now() - 24 * 60 * 60 * 1000; // Solo tickets cerrados hace menos de 24 horas
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