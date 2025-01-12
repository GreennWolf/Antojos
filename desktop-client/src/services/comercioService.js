import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/comercio`;
const API_BASE_IMAGE = `${import.meta.env.VITE_API_URL}`;

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

// Función para transformar la URL del logo
const transformLogoUrl = (comercio) => {
   if (!comercio || !comercio.logo) return comercio;
   return {
       ...comercio,
       logoUrl: `${API_BASE_IMAGE}/${comercio.logo.replace(/\\/g, '/')}`
   };
};

// Función para crear o actualizar comercio
export const createOrUpdateComercio = async (comercioData) => {
   try {
       const response = await api.post('/', comercioData);
       return transformLogoUrl(response.data);
   } catch (error) {
       console.error('Error al guardar comercio:', error);
       throw error;
   }
};

// Función para obtener los datos del comercio
export const getComercio = async () => {
   try {
       const response = await api.get('/');
       // Si no hay datos, retornar un objeto con estructura base
       if (!response.data) {
           return {
               nombre: '',
               direccion: '',
               telefono: '',
               email: '',
               rut: '',
               logo: null
           };
       }
       return transformLogoUrl(response.data);
   } catch (error) {
       console.error('Error al obtener datos del comercio:', error);
       // Si hay error, también retornamos estructura base
       return {
           nombre: '',
           direccion: '',
           telefono: '',
           email: '',
           rut: '',
           logo: null
       };
   }
};

// Función para subir el logo del comercio
export const uploadLogo = async (logoFile) => {
   try {
       const formData = new FormData();
       formData.append('logo', logoFile);

       // Validar el tipo y tamaño del archivo antes de enviarlo
       if (!logoFile.type.startsWith('image/')) {
           throw new Error('El archivo debe ser una imagen');
       }
       
       if (logoFile.size > 5 * 1024 * 1024) { // 5MB
           throw new Error('El archivo es demasiado grande. Máximo 5MB');
       }

       const config = {
           headers: {
               'Content-Type': 'multipart/form-data'
           }
       };

       const response = await api.post('/logo', formData, config);
       return transformLogoUrl(response.data);
   } catch (error) {
       if (error.response?.status === 400) {
           throw new Error(error.response.data.message || 'Error al subir el logo');
       }
       console.error('Error al subir logo:', error);
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

export default api;