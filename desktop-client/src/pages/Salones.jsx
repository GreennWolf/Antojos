import React, { useState, useEffect } from 'react';
import { getSalones } from '../services/salonesService';
import { toast } from 'react-toastify';
import { Mesas } from '../components/SalonesTab/Mesas';
import TabButton from '../components/TabButton';
import { DetallePedido } from '../components/SalonesTab/DetallePedidos';

export function Salones() {
  const [salones, setSalones] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pedidoActual, setPedidoActual] = useState(null);
  const [selectedMesa, setSelectedMesa] = useState(null);

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

  const handleMesaSeleccionada = (mesa, pedido) => {
    setSelectedMesa(mesa);
    setPedidoActual(pedido);
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

      <div className="flex-1 grid grid-cols-12 gap-4">
        <div className="col-span-9 bg-[rgb(240,240,215)] rounded-lg border border-[#AAB99A] p-4">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              Cargando salones...
            </div>
          ) : activeTab ? (
            <Mesas 
              salonId={activeTab} 
              onMesaSelect={handleMesaSeleccionada}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Seleccione un salón para ver sus mesas
            </div>
          )}
        </div>

        <div className="col-span-3 bg-[rgb(240,240,215)] rounded-lg border border-[#AAB99A] p-4">
          <div className="text-lg font-medium text-[#727D73] mb-4">
            {selectedMesa ? `Mesa ${selectedMesa.numero}` : 'Detalle'}
          </div>
          <DetallePedido pedido={pedidoActual} />
          {!pedidoActual && selectedMesa && (
            <div className="h-full flex items-center justify-center text-gray-500">
              No hay pedido activo en esta mesa
            </div>
          )}
        </div>
      </div>
    </div>
  );
}