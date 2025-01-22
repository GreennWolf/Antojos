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

const JuntarMesaDialog = ({ 
  open, 
  onOpenChange, 
  mesaActual,
  onJuntarMesa,
  getMesas
}) => {
  const [mesas, setMesas] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [salonesDisponibles, setSalonesDisponibles] = useState([]);
  const [salonActivo, setSalonActivo] = useState(null);
  const [detallesMesa, setDetallesMesa] = useState(null);

  useEffect(() => {
    const cargarMesas = async () => {
      try {
        setIsLoading(true);
        const response = await getMesas();
        
        const mesasConPedidos = response.filter(mesa => {
          if (mesa._id === mesaActual) return false;
          
          const pedidoKey = `mesa_pedido_${mesa._id}`;
          const pedidoGuardado = localStorage.getItem(pedidoKey);
          
          if (pedidoGuardado) {
            try {
              const pedido = JSON.parse(pedidoGuardado);
              return pedido.productos?.length > 0 && pedido.subtotal > 0;
            } catch {
              return false;
            }
          }
          return false;
        });

        const mesasPorSalon = mesasConPedidos.reduce((acc, mesa) => {
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

        const salones = Object.values(mesasPorSalon).sort((a, b) => 
          a.nombre.localeCompare(b.nombre)
        );

        setSalonesDisponibles(salones);
        setMesas(mesasConPedidos);
        
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
      setMesaSeleccionada(null);
      setDetallesMesa(null);
    }
  }, [open, mesaActual, getMesas]);

  const handleSeleccionarMesa = (mesa) => {
    setMesaSeleccionada(mesa._id);
    const pedidoKey = `mesa_pedido_${mesa._id}`;
    const pedidoGuardado = localStorage.getItem(pedidoKey);
    
    if (pedidoGuardado) {
      try {
        const pedido = JSON.parse(pedidoGuardado);
        setDetallesMesa({
          mesa,
          pedido
        });
      } catch (error) {
        console.error('Error al cargar detalles de la mesa:', error);
        toast.error('Error al cargar detalles de la mesa');
      }
    }
  };

  const handleJuntarMesa = () => {
    if (mesaSeleccionada && detallesMesa?.pedido) {
      onJuntarMesa(mesaSeleccionada, detallesMesa.pedido, detallesMesa.mesa);
      setMesaSeleccionada(null);
      setDetallesMesa(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/80" onClick={(e) => e.stopPropagation()} />
        <DialogContent 
          className="bg-[#F0F0D7] border border-[#AAB99A] max-w-5xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold leading-none tracking-tight text-[#727D73]">
              Juntar Mesa
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 flex gap-4">
            {/* Panel izquierdo - Selección de mesa */}
            <div className="flex-1">
              {isLoading ? (
                <div className="text-center py-4">Cargando mesas disponibles...</div>
              ) : salonesDisponibles.length === 0 ? (
                <div className="text-center py-4">No hay mesas con pedidos para juntar</div>
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
                        {salon.mesas.map((mesa) => {
                          const pedidoKey = `mesa_pedido_${mesa._id}`;
                          const pedidoGuardado = localStorage.getItem(pedidoKey);
                          let totalPedido = '0.00';
                          try {
                            const pedido = JSON.parse(pedidoGuardado);
                            totalPedido = pedido.total?.toFixed(2) || '0.00';
                          } catch {}

                          return (
                            <button
                              key={mesa._id}
                              onClick={() => handleSeleccionarMesa(mesa)}
                              className={`p-4 rounded border ${
                                mesaSeleccionada === mesa._id
                                  ? 'bg-[#727D73] text-white border-[#727D73]'
                                  : 'bg-white text-[#727D73] border-[#AAB99A] hover:bg-[#D0DDD0]'
                              }`}
                            >
                              <div>Mesa {mesa.numero}</div>
                              <div className="text-xs mt-1">
                                {totalPedido}€
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </div>

            {/* Panel derecho - Detalle de la mesa */}
            <div className="w-80 border-l border-[#AAB99A] pl-4">
              <h3 className="font-medium text-[#727D73] mb-2">
                {detallesMesa ? `Detalle Mesa ${detallesMesa.mesa.numero}` : 'Seleccione una mesa'}
              </h3>
              
              {detallesMesa && (
                <div className="space-y-2">
                  {detallesMesa.pedido.productos.map((producto, index) => (
                    <div key={index} className="bg-white p-2 rounded border border-[#AAB99A]">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[#727D73] font-medium">{producto.nombre}</div>
                          <div className="text-sm text-gray-600">
                            {((producto.precio || 0) * producto.cantidad).toFixed(2)}€
                          </div>
                          {producto.ingredientes?.length > 0 && (
                            <div className="text-xs space-y-0.5 mt-1">
                              {producto.ingredientes
                                .filter((ing) => (ing.cantidadAgregada || 0) > 0)
                                .map((ing, idx) => (
                                  <div key={`${ing.ingrediente._id}-agregado-${idx}`} className="text-green-600">
                                    + {ing.ingrediente.nombre} x{ing.cantidadAgregada}
                                  </div>
                                ))}
                              {producto.ingredientes
                                .filter((ing) => (ing.cantidadQuitada || 0) > 0)
                                .map((ing, idx) => (
                                  <div key={`${ing.ingrediente._id}-quitado-${idx}`} className="text-red-600">
                                    - {ing.ingrediente.nombre} x{ing.cantidadQuitada}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                        <div className="text-[#727D73] font-medium">
                          x{producto.cantidad}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="mt-4 p-2 bg-white rounded border border-[#AAB99A]">
                    <div className="flex justify-between text-sm text-[#727D73]">
                      <span>Subtotal:</span>
                      <span>{detallesMesa.pedido.subtotal?.toFixed(2)}€</span>
                    </div>
                    {detallesMesa.pedido.descuento > 0 && (
                      <div className="flex justify-between text-sm text-red-600">
                        <span>Descuento ({detallesMesa.pedido.descuento}%):</span>
                        <span>
                          -{(detallesMesa.pedido.subtotal * (detallesMesa.pedido.descuento / 100)).toFixed(2)}€
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-[#727D73] pt-1 border-t border-[#AAB99A] mt-1">
                      <span>Total:</span>
                      <span>{detallesMesa.pedido.total?.toFixed(2)}€</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 p-4 border-t border-[#AAB99A]">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 border border-[#727D73] text-[#727D73] rounded hover:bg-[#D0DDD0]"
            >
              Cancelar
            </button>
            <button
              onClick={handleJuntarMesa}
              disabled={!mesaSeleccionada}
              className={`px-4 py-2 rounded ${
                mesaSeleccionada
                  ? 'bg-[#727D73] text-white hover:bg-[#727D73]/90'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Juntar Mesa
            </button>
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

export default JuntarMesaDialog;