import React, { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { loginUser } from '../services/userService';

export const Login = () => {
  const [codigo, setCodigo] = useState('');
  const [showCodigo, setShowCodigo] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCodigoChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 4) {
      setCodigo(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (codigo.length < 2) {
      toast.error('El código debe tener al menos 2 dígitos');
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser({ codigo });
      
      // Guardar en localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.usuario));
      localStorage.setItem('permisos', JSON.stringify(response.permisos));

      toast.success('Inicio de sesión exitoso');
      
      // Redirigir después de un breve delay para que se vea el toast
      navigate('/main');

      console.log('Permisos del usuario:', JSON.parse(localStorage.getItem('permisos')))

    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-[#F0F0D7] flex items-center justify-center">      
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#727D73] mb-2">
            Iniciar Sesión
          </h1>
          <p className="text-[#AAB99A]">
            Ingresa tu código para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#727D73]">
              Código de Acceso
            </label>
            <div className="relative">
              <input
                type={showCodigo ? "text" : "password"}
                value={codigo}
                onChange={handleCodigoChange}
                className="w-full px-4 py-3 rounded-lg border border-[#AAB99A] 
                         focus:outline-none focus:ring-2 focus:ring-[#727D73]
                         bg-[#F0F0D7] text-lg"
                placeholder="••••"
                maxLength={4}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowCodigo(!showCodigo)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2
                         text-[#727D73] hover:text-[#727D73]/90"
                disabled={loading}
              >
                {showCodigo ? 
                  <EyeOff className="w-5 h-5" /> : 
                  <Eye className="w-5 h-5" />
                }
              </button>
            </div>
            <p className="text-xs text-[#727D73] mt-1">
              {codigo.length}/4 dígitos
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || codigo.length < 2}
            className="w-full bg-[#727D73] text-[#F0F0D7] py-3 rounded-lg
                     flex items-center justify-center space-x-2
                     hover:bg-[#727D73]/90 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>Cargando...</span>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Ingresar</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;