// TabButton.jsx
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

// Salones.jsx
import React, { useState, useEffect } from 'react';
import { getSalones } from '../services/salonesService';
import { toast } from 'react-toastify';
import { Mesas } from '../components/SalonesTab/Mesas';

export function Salones() {
  const [salones, setSalones] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      const salonesData = await getSalones();
      setSalones(salonesData.filter(salon => salon.active));
      if (salonesData.length > 0) {
        setActiveTab(salonesData[0]._id);
      }
    } catch (error) {
      toast.error('Error al cargar los salones');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[#727D73]">Salones</h1>
      </div>

      <div className="border-b border-[#AAB99A] mb-4">
        <div className="flex space-x-4">
          {!isLoading && salones.map(salon => (
            <TabButton
              key={salon._id}
              isActive={activeTab === salon._id}
              onClick={() => setActiveTab(salon._id)}
            >
              {salon.nombre}
            </TabButton>
          ))}
        </div>
      </div>

      <div className=" flex-1 grid grid-cols-12 gap-4">
        <div className="col-span-9 bg-white rounded-lg border border-[#AAB99A] p-4">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              Cargando salones...
            </div>
          ) : activeTab ? (
            <Mesas salonId={activeTab} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Seleccione un salón para ver sus mesas
            </div>
          )}
        </div>

        <div className="col-span-3 bg-white rounded-lg border border-[#AAB99A] p-4">
          <div className="text-lg font-medium text-[#727D73] mb-4">Detalle</div>
        </div>
      </div>
    </div>
  );
}