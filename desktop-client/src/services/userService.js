import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/usuarios`;

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

export const getPrivilegios = () => {
    const privilegios = localStorage.getItem('permisos');
    if (privilegios) {
        return JSON.parse(privilegios);
    }
}

// Función para iniciar sesión (esta no necesita token)
export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/login`, credentials);
        return response.data;
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        throw error;
    }
};

// Función para verificar token
export const verifyToken = async () => {
    try {
        const response = await api.get('/verify-token');
        return response.data;
    } catch (error) {
        console.error('Error al verificar token:', error);
        throw error;
    }
};

// Función para crear un nuevo usuario
export const createUser = async (userData) => {
    try {
        const response = await api.post('/', userData);
        return response.data;
    } catch (error) {
        console.error('Error al crear usuario:', error);
        throw error;
    }
};

// Función para obtener todos los usuarios
export const getUsers = async () => {
    try {
        const response = await api.get('/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        throw error;
    }
};

// Función para obtener un usuario por ID
export const getUserById = async (id) => {
    try {
        const response = await api.get(`/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        throw error;
    }
};

// Función para actualizar un usuario
export const updateUser = async (id, userData) => {
    try {
        const response = await api.put(`/${id}`, userData);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        throw error;
    }
};

// Función para eliminar un usuario
export const deleteUser = async (id) => {
    try {
        const response = await api.delete(`/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        throw error;
    }
};

// Función para activar/desactivar un usuario
export const toggleUserActive = async (id) => {
    try {
        const response = await api.patch(`/${id}/toggle`);
        return response.data;
    } catch (error) {
        console.error('Error al cambiar estado del usuario:', error);
        throw error;
    }
};

// Función para cambiar la contraseña
export const changePassword = async (passwordData) => {
    try {
        const response = await api.post('/change-password', passwordData);
        return response.data;
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        throw error;
    }
};

// Función para obtener el usuario actual
export const getCurrentUser = async () => {
    try {
        const response = await api.get('/me');
        return response.data;
    } catch (error) {
        console.error('Error al obtener usuario actual:', error);
        throw error;
    }
};

// Opcional: Interceptor para manejar errores de token
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