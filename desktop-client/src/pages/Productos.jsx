import React, { useEffect, useState } from 'react';
import { getPrivilegios } from '../services/userService';
import { Categorias } from '../components/ProductosTab/Categorias';
import { SubCategorias } from '../components/ProductosTab/SubCategorias';
import { Ingredientes } from '../components/ProductosTab/Ingredientes';
import { Producto } from '../components/ProductosTab/Producto';

const TabButton = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors 
      ${isActive 
        ? 'bg-[#727D73] text-[#F0F0D7]' 
        : 'text-[#727D73] hover:bg-[#D0DDD0]'}`}
  >
    {children}
  </button>
);

export const Productos = () => {
  const [privilegiosUser, setPrivilegiosUser] = useState({});
  const [activeTab, setActiveTab] = useState(null);

  const tabs = [
    { 
      id: 'productos', 
      label: 'Productos', 
      privilege: { action: 'READ', resource: 'PRODUCTOS' },
      component:<Producto/>
    },
    { 
      id: 'ingredientes', 
      label: 'Ingredientes', 
      privilege: { action: 'READ', resource: 'INGREDIENTES' },
      component:<Ingredientes/>
    },
    { 
      id: 'subcategorias', 
      label: 'SubCategorías', 
      privilege: { action: 'READ', resource: 'SUBCATEGORIAS' },
      component:<SubCategorias/>
    },
    { 
      id: 'categorias', 
      label: 'Categorías', 
      privilege: { action: 'READ', resource: 'CATEGORIAS' },
      component:<Categorias/>
    }
  ];

  const hasPrivilege = (requiredPrivilege) => {
    if (!requiredPrivilege) return true;
    if (!privilegiosUser) return false;

    const { action, resource } = requiredPrivilege;
    const hasPriv = privilegiosUser[resource]?.[action] === true;
    return hasPriv;
  };

  const fetchUserPrivilegios = async () => {
    const priv = await getPrivilegios();
    return priv;
  };
  
  useEffect(() => {
    const fetchData = async () => {
      const p = await fetchUserPrivilegios();
      setPrivilegiosUser(p);
      
      // Encuentra la primera pestaña permitida
      const firstAllowedTab = tabs.find(tab => {
        const { action, resource } = tab.privilege;
        return p[resource]?.[action] === true;
      });

      // Si encuentra una pestaña permitida, la establece como activa
      if (firstAllowedTab) {
        setActiveTab(firstAllowedTab.id);
      }
    };
  
    fetchData();
  }, []);

  const renderContent = () => {
    const activeTabData = tabs.find(tab => tab.id === activeTab);
    if (!activeTabData || !hasPrivilege(activeTabData.privilege)) return null;
    return activeTabData.component;
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[#727D73]">Productos</h1>
      </div>

      <div className="border-b border-[#AAB99A] mb-4">
        <div className="flex space-x-4">
          {tabs.map(tab => {
            // Solo renderiza la pestaña si el usuario tiene el privilegio requerido
            if (!hasPrivilege(tab.privilege)) return null;
            
            return (
              <TabButton
                key={tab.id}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </TabButton>
            )
          })}
        </div>
      </div>

      <div className="mt-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default Productos;