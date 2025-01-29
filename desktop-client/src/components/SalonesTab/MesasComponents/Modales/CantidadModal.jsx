import React from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";

const CantidadModal = ({
  isOpen,
  onClose,
  producto,
  ingrediente,
  accion,
  onConfirm,
  cantidadMaxima = 10
}) => {
  // Función para calcular la cantidad disponible según la acción
  const getCantidadDisponible = () => {
    if (accion !== 'quitar') return cantidadMaxima;
  
    const ingBase = producto?.producto?.ingredientes?.find(
      ing => ing.ingrediente._id === ingrediente?._id
    );
  
    if (!ingBase) return 0;
  
    // Buscar cuántos ya están excluidos
    const exclusionExistente = producto.ingredientes.excluidos.find(
      exc => exc.ingrediente === ingrediente._id
    );
  
    const cantidadExcluida = exclusionExistente?.cantidad || 0;
    
    // La cantidad disponible es la cantidad base menos lo ya excluido
    return Math.max(0, ingBase.cantidad - cantidadExcluida);
  };

  const cantidadDisponible = getCantidadDisponible();
  const cantidadBotones = Math.min(cantidadMaxima, cantidadDisponible);

  // Si no hay producto o ingrediente, no mostramos el modal
  if (!producto || !ingrediente) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay 
          className="bg-black/80" 
          onClick={(e) => e.stopPropagation()}
        />
        <DialogContent
          className="bg-[#F0F0D7] border border-[#AAB99A]"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold leading-none tracking-tight text-[#727D73]">
              {accion === 'agregar' ? 'Agregar' : 'Quitar'}: ¿Cuántos{' '}
              {ingrediente?.nombre || 'ingredientes'}?
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 relative z-50">
            <div className="text-center mb-4">
              <div>Producto: {producto.producto.nombre}</div>
              <div className="text-sm text-gray-600">
                {ingrediente?.nombre}:{' '}
                {accion === 'agregar' ? 'Agregar cantidad' : 'Quitar cantidad'}
              </div>
              
              {/* Mensaje condicional para quitar ingredientes */}
              {accion === 'quitar' && (
                <div className={`text-sm mt-2 ${cantidadDisponible === 0 ? 'text-red-600 font-medium' : 'text-[#727D73]'}`}>
                  {cantidadDisponible === 0 ? (
                    <div className="bg-red-100 border border-red-400 rounded p-2">
                      No se pueden quitar más {ingrediente.nombre} de este producto.
                      <div className="text-xs mt-1">
                        Ya has quitado la cantidad máxima permitida.
                      </div>
                    </div>
                  ) : (
                    `Puedes quitar hasta: ${cantidadDisponible}`
                  )}
                </div>
              )}
            </div>

            {cantidadDisponible > 0 ? (
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: cantidadBotones }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => onConfirm(i + 1)}
                    className="p-4 bg-[#727D73] text-white rounded 
                      hover:bg-[#727D73]/90 text-lg font-medium 
                      transition-colors relative z-50"
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex justify-center mt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-[#727D73] text-white rounded 
                    hover:bg-[#727D73]/90 transition-colors"
                >
                  Entendido
                </button>
              </div>
            )}
          </div>

          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 
              transition-opacity hover:opacity-100 focus:outline-none 
              focus:ring-2 focus:ring-[#AAB99A] focus:ring-offset-2 z-40"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </button>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default CantidadModal;