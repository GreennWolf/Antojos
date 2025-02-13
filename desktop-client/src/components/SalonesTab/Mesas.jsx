import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// Importa la función para traer las mesas según el salón y para traer el ticket activo de una mesa
import { getMesasBySalon } from "../../services/mesasService";
import { getTicketByMesa } from "../../services/ticketsTempService";

export const Mesas = ({ salonId, onMesaSelect }) => {
  const navigate = useNavigate();
  const [mesas, setMesas] = useState([]);
  const [isLoadingMesas, setIsLoadingMesas] = useState(true);
  // Este estado contendrá los IDs de mesas que tienen un ticket activo (pedido)
  const [mesasConPedido, setMesasConPedido] = useState(new Set());
  const [selectedMesa, setSelectedMesa] = useState(null);

  // Cargar las mesas según el salonId
  useEffect(() => {
    if (salonId) {
      cargarMesas(salonId);
    }
  }, [salonId]);

  // Una vez que se cargan las mesas, consultamos para cada mesa si existe un pedido activo en la BD
  useEffect(() => {
    const cargarTicketsActivos = async () => {
      const mesasActivas = new Set();
      for (let mesa of mesas) {
        try {
          const ticket = await getTicketByMesa(mesa._id);
          console.log(ticket.productos.length > 0 && ticket);
          // Consideramos que la mesa tiene pedido activo si el ticket existe, tiene productos y un subtotal mayor a 0
          if (ticket) {
            console.log(mesa._id , 'mesa')
            mesasActivas.add(mesa._id);
          }
        } catch (error) {
          // Si no hay ticket o ocurre un error, simplemente no se marca la mesa como activa
        }
      }
      setMesasConPedido(mesasActivas);
    };
    if (mesas.length > 0) {
      cargarTicketsActivos();
    }
  }, [mesas]);

  const cargarMesas = async (salonId) => {
    try {
      setIsLoadingMesas(true);
      const mesasData = await getMesasBySalon(salonId);
      setMesas(mesasData);
    } catch (error) {
      toast.error("Error al cargar las mesas");
    } finally {
      setIsLoadingMesas(false);
    }
  };

  // Al hacer click en una mesa, se selecciona y se consulta el ticket activo de esa mesa
  const handleMesaClick = async (mesa) => {
    setSelectedMesa(mesa);
    let pedido = null;
    try {
      pedido = await getTicketByMesa(mesa._id);
    } catch (error) {
      console.error("Error al obtener ticket:", error);
    }
    onMesaSelect(mesa, pedido);
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
          onClick={() => handleMesaClick(mesa)}
          onDoubleClick={() => handleMesaDoubleClick(mesa._id)}
          className={`aspect-square rounded-lg border-2 
            flex items-center justify-center cursor-pointer transition-colors
            ${selectedMesa?._id === mesa._id ? "border-4" : "border-2"}
            ${
              selectedMesa?._id === mesa._id
                ? "border-[#727D73]"
                : "border-[#727D73]"
            }
            ${
              mesasConPedido.has(mesa._id)
                ? "bg-[#9cc273] hover:bg-[#AAB99A]/80"
                : "bg-[#D0DDD0] hover:bg-[#D0DDD0]/80"
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

export default Mesas;
