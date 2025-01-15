import React, { useState, useEffect } from 'react';
import { getSalones } from '../services/salonesService';
import { getMesasBySalon } from '../services/mesasService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export function Salones() {
  const navigate = useNavigate();
  // Estados
  const [salones, setSalones] = useState([]);
  const [salonActivo, setSalonActivo] = useState(null);
  const [mesas, setMesas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMesas, setIsLoadingMesas] = useState(false);

  // Efecto inicial para cargar datos
  useEffect(() => {
    cargarDatos();
  }, []);

  // Efecto para cargar mesas cuando cambia el salón activo
  useEffect(() => {
    if (salonActivo) {
      cargarMesas(salonActivo);
    }
  }, [salonActivo]);

  // Función para cargar salones
  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      const salonesData = await getSalones();
      setSalones(salonesData);
      if (salonesData.length > 0 && !salonActivo) {
        setSalonActivo(salonesData[0]._id);
      }
    } catch (error) {
      toast.error('Error al cargar los salones');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cargar mesas del salón seleccionado
  const cargarMesas = async (salonId) => {
    try {
      setIsLoadingMesas(true);
      const mesasData = await getMesasBySalon(salonId);
      setMesas(mesasData);
    } catch (error) {
      toast.error('Error al cargar las mesas');
    } finally {
      setIsLoadingMesas(false);
    }
  };

  // Función para manejar el doble click en una mesa
  const handleMesaDoubleClick = (mesaId) => {
    navigate(`/mesas/${mesaId}`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Grid de salones */}
      <div className="grid grid-cols-10 gap-2 p-4">
        {isLoading ? (
          <div className="col-span-10 text-center py-4">Cargando salones...</div>
        ) : salones.length === 0 ? (
          <div className="col-span-10 text-center py-4">No hay salones disponibles</div>
        ) : (
          salones.map((salon) => (
            salon.active && (
              <div
                key={salon._id}
                onClick={() => setSalonActivo(salon._id)}
                className={`p-4 rounded-lg cursor-pointer border-2 transition-all
                  ${salon._id === salonActivo
                    ? 'border-[#727D73] bg-[#D0DDD0]'
                    : 'border-[#AAB99A] bg-white hover:bg-[#D0DDD0]/50'}`}
              >
                <div className="text-center font-medium text-[#727D73]">
                  {salon.nombre}
                </div>
              </div>
            )
          ))
        )}
      </div>

      {/* Área de mesas */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4">
        <div className="col-span-9 bg-white rounded-lg border border-[#AAB99A] p-4">
          {salonActivo ? (
            isLoadingMesas ? (
              <div className="h-full flex items-center justify-center">
                Cargando mesas...
              </div>
            ) : (
              <div className="h-full grid grid-cols-6 gap-4">
                {mesas.map((mesa) => (
                  <div
                    key={mesa._id}
                    onDoubleClick={() => handleMesaDoubleClick(mesa._id)}
                    className="aspect-square bg-[#D0DDD0] rounded-lg border-2 border-[#727D73] 
                             flex items-center justify-center cursor-pointer hover:bg-[#D0DDD0]/80"
                  >
                    <span className="text-lg font-medium text-[#727D73]">
                      Mesa {mesa.numero}
                    </span>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Seleccione un salón para ver sus mesas
            </div>
          )}
        </div>

        {/* Panel lateral */}
        <div className="col-span-3 bg-white rounded-lg border border-[#AAB99A] p-4">
          <div className="text-lg font-medium text-[#727D73] mb-4">Mozo</div>
        </div>
      </div>
    </div>
  );
}