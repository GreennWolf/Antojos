import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/zonas`;

// Crear una instancia de axios
const api = axios.create({
    baseURL: API_BASE_URL
});

// Interceptor para añadir el token a todas las peticiones
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

// Función para crear una nueva zona
export const createZona = async (zonaData) => {
    try {
        const response = await api.post('/', zonaData);
        return response.data;
    } catch (error) {
        console.error('Error al crear zona:', error);
        throw error;
    }
};

// Función para obtener todas las zonas
export const getZonas = async () => {
    try {
        const response = await api.get('/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener zonas:', error);
        throw error;
    }
};

// Función para obtener una zona por ID
export const getZonaById = async (id) => {
    try {
        const response = await api.get(`/${id}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error('Zona no encontrada');
        }
        console.error('Error al obtener zona:', error);
        throw error;
    }
};

// Función para actualizar una zona
export const updateZona = async (id, zonaData) => {
    try {
        const response = await api.put(`/${id}`, zonaData);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error('Zona no encontrada');
        }
        console.error('Error al actualizar zona:', error);
        throw error;
    }
};

// Función para eliminar una zona
export const deleteZona = async (id) => {
    try {
        const response = await api.delete(`/${id}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error('Zona no encontrada');
        }
        console.error('Error al eliminar zona:', error);
        throw error;
    }
};

// Función para activar/desactivar una zona
export const toggleZonaActive = async (id) => {
    try {
        const response = await api.patch(`/${id}/toggle`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error('Zona no encontrada');
        }
        console.error('Error al cambiar estado de la zona:', error);
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

