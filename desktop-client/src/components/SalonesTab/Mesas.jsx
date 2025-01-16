// Mesas.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getMesasBySalon } from '../../services/mesasService';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const Mesas = ({ salonId }) => {
  const navigate = useNavigate();
  const [mesas, setMesas] = useState([]);
  const [isLoadingMesas, setIsLoadingMesas] = useState(true);

  useEffect(() => {
    if (salonId) {
      cargarMesas(salonId);
    }
  }, [salonId]);

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

  const handleMesaDoubleClick = (mesaId) => {
    navigate(`/mesas/${mesaId}`);
  };

  if (isLoadingMesas) {
    return (
      <div className="h-full flex items-center justify-center">
        Cargando mesas...
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-320px)] grid grid-cols-12 gap-4">
      {mesas.map((mesa) => (
        <div
          key={mesa._id}
          onDoubleClick={() => handleMesaDoubleClick(mesa._id)}
          className="aspect-square bg-[#D0DDD0] rounded-lg border-2 border-[#727D73] 
                   flex items-center justify-center cursor-pointer hover:bg-[#D0DDD0]/80"
        >
          <span className="text-md font-medium text-[#727D73] text-center">
            {mesa.numero}
          </span>
        </div>
      ))}
    </div>
  );
};