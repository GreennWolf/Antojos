import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CambiarMesaDialog = ({ 
  open, 
  onOpenChange, 
  mesaActual,
  onCambiarMesa,
  getMesas 
}) => {
  const [mesas, setMesas] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [salonesDisponibles, setSalonesDisponibles] = useState([]);
  const [salonActivo, setSalonActivo] = useState(null);

  useEffect(() => {
    const cargarMesas = async () => {
      try {
        setIsLoading(true);
        const response = await getMesas();
        
        // Filtramos mesas disponibles (sin productos/pedidos) y que no sean la actual
        const mesasDisponibles = response.filter(mesa => 
          (!mesa.pedidoActual || mesa.pedidoActual.productos?.length === 0) 
          && mesa._id !== mesaActual
        );

        // Agrupamos las mesas por salón
        const mesasPorSalon = mesasDisponibles.reduce((acc, mesa) => {
          const salonId = mesa.salon?._id || 'sin-salon';
          const salonNombre = mesa.salon?.nombre || 'Sin Salón';
          
          if (!acc[salonId]) {
            acc[salonId] = {
              id: salonId,
              nombre: salonNombre,
              mesas: []
            };
          }
          
          acc[salonId].mesas.push(mesa);
          return acc;
        }, {});

        // Convertimos el objeto a array y ordenamos los salones
        const salones = Object.values(mesasPorSalon).sort((a, b) => 
          a.nombre.localeCompare(b.nombre)
        );

        setSalonesDisponibles(salones);
        setMesas(mesasDisponibles);
        
        // Establecemos el primer salón como activo si existe
        if (salones.length > 0 && !salonActivo) {
          setSalonActivo(salones[0].id);
        }
      } catch (error) {
        console.error('Error al cargar mesas:', error);
        toast.error('Error al cargar las mesas disponibles');
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      cargarMesas();
      setMesaSeleccionada(null); // Reset selección al abrir
    }
  }, [open, mesaActual, getMesas]);

  const handleCambiarMesa = () => {
    if (mesaSeleccionada) {
      onCambiarMesa(mesaSeleccionada);
      setMesaSeleccionada(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/80" onClick={(e) => e.stopPropagation()} />
        <DialogContent 
          className="bg-[#F0F0D7] border border-[#AAB99A] max-w-2xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold leading-none tracking-tight text-[#727D73]">
              Cambiar Mesa
            </DialogTitle>
          </DialogHeader>

          <div className="p-4">
            {isLoading ? (
              <div className="text-center py-4">Cargando mesas disponibles...</div>
            ) : salonesDisponibles.length === 0 ? (
              <div className="text-center py-4">No hay mesas disponibles para cambiar</div>
            ) : (
              <Tabs
                defaultValue={salonesDisponibles[0]?.id}
                className="w-full"
                value={salonActivo}
                onValueChange={setSalonActivo}
              >
                <TabsList className="w-full flex mb-4 bg-white border border-[#AAB99A] p-1 gap-1">
                  {salonesDisponibles.map((salon) => (
                    <TabsTrigger
                      key={salon.id}
                      value={salon.id}
                      className="flex-1 data-[state=active]:bg-[#727D73] data-[state=active]:text-white"
                    >
                      {salon.nombre}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {salonesDisponibles.map((salon) => (
                  <TabsContent key={salon.id} value={salon.id}>
                    <div className="grid grid-cols-6 gap-4">
                      {salon.mesas.map((mesa) => (
                        <button
                          key={mesa._id}
                          onClick={() => setMesaSeleccionada(mesa._id)}
                          className={`p-4 rounded border ${
                            mesaSeleccionada === mesa._id
                              ? 'bg-[#727D73] text-white border-[#727D73]'
                              : 'bg-white text-[#727D73] border-[#AAB99A] hover:bg-[#D0DDD0]'
                          }`}
                        >
                          Mesa {mesa.numero}
                        </button>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 border border-[#727D73] text-[#727D73] rounded hover:bg-[#D0DDD0]"
              >
                Cancelar
              </button>
              <button
                onClick={handleCambiarMesa}
                disabled={!mesaSeleccionada}
                className={`px-4 py-2 rounded ${
                  mesaSeleccionada
                    ? 'bg-[#727D73] text-white hover:bg-[#727D73]/90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Cambiar Mesa
              </button>
            </div>
          </div>

          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#AAB99A] focus:ring-offset-2"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </button>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default CambiarMesaDialog;