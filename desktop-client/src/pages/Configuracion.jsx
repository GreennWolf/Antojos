import React, { useEffect, useState } from 'react';
import { SalonesMesas } from '../components/ConfigTab/SalonesMesas';
import { MetodosPago } from '../components/ConfigTab/MetodosPago';
import { ZonasImpresion } from '../components/ConfigTab/ZonasImpresion';
import { Comercio } from '../components/ConfigTab/Comercio';
import { getPrivilegios } from '../services/userService';

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



export const Configuracion = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [privilegiosUser, setPrivilegiosUser] = useState({});

const hasPrivilege = (requiredPrivilege) => {
    if (!requiredPrivilege) return true;
    if (!privilegiosUser) return false;

    const { action, resource } = requiredPrivilege;
    const hasPriv = privilegiosUser[resource]?.[action] === true;
    console.log(`Checking privilege for ${resource}.${action}:`, hasPriv);
    return hasPriv;
  };

  const fetchUserPrivilegios = async () => {
    const priv = await getPrivilegios();
    console.log('Privilegios recibidos:', priv);
    return priv;
  };
  
  useEffect(() => {
    const fetchData = async () => {
      const p = await fetchUserPrivilegios();
      setPrivilegiosUser(p);
      
      // Encuentra la primera pestaña permitida
      const firstAllowedTab = tabs.find(tab => {
        const { action, resource } = tab.privilege;
        const isAllowed = p[resource]?.[action] === true;
        console.log(`Tab ${tab.id} allowed:`, isAllowed);
        return isAllowed;
      });

      console.log('First allowed tab:', firstAllowedTab);
      // Si encuentra una pestaña permitida, la establece como activa
      if (firstAllowedTab) {
        setActiveTab(firstAllowedTab.id);
      }
    };
  
    fetchData();
  }, []);

  const tabs = [
    { 
      id: 'salones', 
      label: 'Salones/Mesas', 
      component: <SalonesMesas/>,
      privilege: { action: 'READ', resource: 'SALONES' },  // Cambiado de CUENTA a EMPLEADOS  
    },
    { 
      id: 'metodoPago', 
      label: 'Metodos de Pago', 
      component: <MetodosPago/>,
      privilege: { action: 'READ', resource: 'METODOS_PAGO' },  // Cambiado de CUENTA a EMPLEADOS
    },
    { 
      id: 'zonasImpresion', 
      label: 'Zonas de Impresión', 
      component: <ZonasImpresion/>,
      privilege: { action: 'READ', resource: 'ZONAS' },  // Cambiado de CUENTA a EMPLEADOS
    },
    { 
      id: 'comercio', 
      label: 'Comercio', 
      component: <Comercio/> ,
      privilege: { action: 'READ', resource: 'COMERCIO' },  // Cambiado de CUENTA a EMPLEADOS
    }
  ];

  const renderContent = () => {
    const activeTabData = tabs.find(tab => tab.id === activeTab);
    return activeTabData?.component;
  };

  return (
    <div className="p-4">
      {/* Header con título */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[#727D73]">Configuración</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#AAB99A] mb-4">
        <div className="flex space-x-4">
          {tabs.map(tab => {  
              if (!hasPrivilege(tab.privilege)) return null;

              return(
                <TabButton
                  key={tab.id}
                  isActive={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </TabButton>
              )
            })
          }
        </div>
      </div>

      {/* Contenido dinámico */}
      <div className="mt-4">
        {renderContent()}
      </div>
    </div>
  );
};