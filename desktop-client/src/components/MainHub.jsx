import React, { useState, useEffect } from 'react';
import { Home, Package, Users, Settings, FileText, UserCircle, LogOut } from 'lucide-react';
import { Personal } from '../pages/Personal';
import { useNavigate } from 'react-router-dom';
import { Configuracion } from '../pages/Configuracion';
import Productos from '../pages/Productos';

const TabButton = ({ isActive, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-colors
      ${isActive 
        ? 'bg-[#727D73] text-[#F0F0D7]' 
        : 'text-[#727D73] hover:bg-[#D0DDD0]'}`}
  >
    <Icon 
      className={`w-5 h-5 mr-2 
        ${isActive ? 'text-[#F0F0D7]' : 'text-[#727D73]'}`} 
    />
    {label}
  </button>
);

export const MainHub = () => {
  const [activeTab, setActiveTab] = useState('salones');
  const [userName, setUserName] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.nombre) {
      setUserName(user.nombre);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permisos');
    navigate('/');
  };

  const tabs = [
    { id: 'salones', label: 'Salones', icon: Home, component: <div>Salones Component</div> },
    { id: 'productos', label: 'Productos', icon: Package, component: <Productos/> },
    { id: 'personal', label: 'Personal', icon: Users, component: <Personal/> },
    { id: 'administracion', label: 'Administración', icon: FileText, component: <div>Administración Component</div> },
    { id: 'configuracion', label: 'Configuración', icon: Settings, component: <Configuracion/>}
  ];

  const renderContent = () => {
    const activeTabData = tabs.find(tab => tab.id === activeTab);
    return activeTabData?.component;
  };

  return (
    <div className="min-h-screen bg-[#F0F0D7]">
      {/* Header con navegación principal */}
      <header className="bg-[#AAB99A] shadow-lg relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex-1 flex justify-center gap-2">
              {tabs.map(tab => (
                <TabButton
                  key={tab.id}
                  isActive={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  icon={tab.icon}
                  label={tab.label}
                />
              ))}
            </div>
            
            {/* Perfil de usuario */}
            <div className="absolute right-4">
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg 
                           text-[#727D73] hover:bg-[#D0DDD0] transition-colors"
                >
                  <UserCircle className="w-6 h-6" />
                  <span className="font-medium">{userName}</span>
                </button>

                {/* Menú desplegable */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl border border-[#AAB99A]">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-[#D0DDD0] rounded-lg shadow-lg border border-[#AAB99A] min-h-[calc(100vh-8rem)]">
          <div className="p-6 text-[#727D73]">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainHub;