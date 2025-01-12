import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/precuentas`;

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

// Función para obtener todas las precuentas
export const getAllPreCuentas = async () => {
   try {
       const response = await api.get('/');
       return response.data;
   } catch (error) {
       console.error('Error al obtener precuentas:', error);
       throw error;
   }
};

// Función para cambiar el método de pago
export const changeMetodoPago = async (preCuentaId, metodoPagoId) => {
   try {
       const response = await api.patch('/metodo-pago', {
           preCuentaId,
           metodoPagoId
       });
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('PreCuenta no encontrada');
       }
       console.error('Error al cambiar método de pago:', error);
       throw error;
   }
};

// Función para reabrir mesa
export const reopenMesa = async (preCuentaId) => {
   try {
       const response = await api.post('/reopen', {
           preCuentaId
       });
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('PreCuenta no encontrada');
       }
       console.error('Error al reabrir mesa:', error);
       throw error;
   }
};

// Función para imprimir ticket final
export const imprimirTicket = async (preCuentaId) => {
   try {
       const response = await api.post('/imprimir', {
           preCuentaId
       });
       return response.data;
   } catch (error) {
       if (error.response && error.response.status === 404) {
           throw new Error('PreCuenta no encontrada');
       }
       console.error('Error al imprimir ticket:', error);
       throw error;
   }
};

// Función auxiliar para verificar si una precuenta puede ser reabierta
export const isReopenable = (precuenta) => {
   if (!precuenta) return false;
   
   const fechaCreacion = new Date(precuenta.fechaApertura);
   const ahora = new Date();
   const diferenciaTiempo = ahora - fechaCreacion;
   const horasTranscurridas = diferenciaTiempo / (1000 * 60 * 60);
   
   return horasTranscurridas < 24;
};

// Función auxiliar para verificar si una precuenta puede ser impresa como ticket
export const isImprimible = (precuenta) => {
   return precuenta && 
          precuenta.metodoDePago && 
          precuenta.total > 0;
};

// Función auxiliar para formatear el total de una precuenta
export const formatearTotal = (total, decimales = 2) => {
   return Number(total).toFixed(decimales);
};

// Función auxiliar para calcular subtotales y totales con descuento
export const calcularTotales = (precuenta) => {
   if (!precuenta) return { subtotal: 0, total: 0 };

   const subtotal = precuenta.subTotal || 0;
   const descuento = precuenta.descuento || 0;
   const total = subtotal - (subtotal * (descuento / 100));

   return {
       subtotal: Number(subtotal.toFixed(2)),
       descuento: Number(descuento.toFixed(2)),
       total: Number(total.toFixed(2))
   };
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