import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getMesasBySalon } from '../../services/mesasService';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const Mesas = ({ salonId }) => {
  const navigate = useNavigate();
  const [mesas, setMesas] = useState([]);
  const [isLoadingMesas, setIsLoadingMesas] = useState(true);
  const [mesasConPedido, setMesasConPedido] = useState(new Set());

  useEffect(() => {
    if (salonId) {
      cargarMesas(salonId);
    }
  }, [salonId]);

  useEffect(() => {
    // Verificar pedidos activos en localStorage para cada mesa
    const mesasActivas = new Set();
    mesas.forEach(mesa => {
      const pedidoKey = `mesa_pedido_${mesa._id}`;
      const pedidoGuardado = localStorage.getItem(pedidoKey);
      
      if (pedidoGuardado) {
        try {
          const pedido = JSON.parse(pedidoGuardado);
          if (pedido.productos?.length > 0) {
            mesasActivas.add(mesa._id);
          }
        } catch (error) {
          console.error('Error al parsear pedido:', error);
        }
      }
    });
    setMesasConPedido(mesasActivas);
  }, [mesas]);

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
          className={`aspect-square rounded-lg border-2 border-[#727D73] 
                   flex items-center justify-center cursor-pointer transition-colors
                   ${mesasConPedido.has(mesa._id)
                     ? 'bg-[#9cc273] hover:bg-[#AAB99A]/80'  // Color más oscuro para mesas con pedido
                     : 'bg-[#D0DDD0] hover:bg-[#D0DDD0]/80'  // Color original para mesas sin pedido
                   }`}
        >
          <span className="text-md font-medium text-[#727D73] text-center">
            {mesa.numero}
          </span>
        </div>
      ))}
    </div>
  );
};