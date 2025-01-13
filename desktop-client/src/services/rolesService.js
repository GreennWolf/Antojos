import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/roles`;

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

// Función para crear un nuevo rol
export const createRol = async (rolData) => {
    try {
        const response = await api.post('/', rolData);
        return response.data;
    } catch (error) {
        console.error('Error al crear rol:', error);
        throw error;
    }
};

// Función para obtener todos los roles
export const getRoles = async () => {
    try {
        const response = await api.get('/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener roles:', error);
        throw error;
    }
};

// Función para obtener un rol por ID
export const getRolById = async (id) => {
    try {
        const response = await api.get(`/${id}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error('Rol no encontrado');
        }
        console.error('Error al obtener rol:', error);
        throw error;
    }
};

// Función para actualizar un rol
export const updateRol = async (id, rolData) => {
    try {
        const response = await api.put(`/${id}`, rolData);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error('Rol no encontrado');
        }
        console.error('Error al actualizar rol:', error);
        throw error;
    }
};

// Función para eliminar un rol
export const deleteRol = async (id) => {
    try {
        const response = await api.delete(`/${id}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error('Rol no encontrado');
        }
        console.error('Error al eliminar rol:', error);
        throw error;
    }
};

// Función para actualizar los permisos de un rol
export const updateRolPermissions = async (id, permisos) => {
    try {
        const response = await api.patch(`/${id}/permisos`, { permisos });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error('Rol no encontrado');
        }
        console.error('Error al actualizar permisos del rol:', error);
        throw error;
    }
};

// Función para activar/desactivar un rol
export const toggleRolActive = async (id) => {
    try {
        const response = await api.patch(`/${id}/toggle`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error('Rol no encontrado');
        }
        console.error('Error al cambiar estado del rol:', error);
        throw error;
    }
};

// Función para obtener todos los privilegios disponibles
export const getAllPrivileges = async () => {
    try {
        const response = await api.get('/privileges/all');
        return response.data;
    } catch (error) {
        console.error('Error al obtener privilegios:', error);
        throw error;
    }
};

// Interceptor para manejar errores de token
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('permisos');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);