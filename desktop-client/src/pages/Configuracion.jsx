import React, { useState } from 'react';
import { SalonesMesas } from '../components/ConfigTab/SalonesMesas';
import { MetodosPago } from '../components/ConfigTab/MetodosPago';
import { ZonasImpresion } from '../components/ConfigTab/ZonasImpresion';
import { Comercio } from '../components/ConfigTab/Comercio';

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
  const [activeTab, setActiveTab] = useState('salones');

  const tabs = [
    { 
      id: 'salones', 
      label: 'Salones/Mesas', 
      component: <SalonesMesas/>  
    },
    { 
      id: 'metodoPago', 
      label: 'Metodos de Pago', 
      component: <MetodosPago/>
    },
    { 
      id: 'zonasImpresion', 
      label: 'Zonas de Impresión', 
      component: <ZonasImpresion/>
    },
    { 
      id: 'comercio', 
      label: 'Comercio', 
      component: <Comercio/> 
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
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </TabButton>
          ))}
        </div>
      </div>

      {/* Contenido dinámico */}
      <div className="mt-4">
        {renderContent()}
      </div>
    </div>
  );
};