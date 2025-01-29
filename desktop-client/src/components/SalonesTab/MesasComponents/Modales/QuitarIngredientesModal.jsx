// QuitarIngredientesModal.jsx
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

const QuitarIngredientesModal = ({
  isOpen,
  onClose,
  producto,
  ingredientes, // Ingredientes permitidos de la subcategoría
  onIngredienteSelect
}) => {
  if (!producto) return null;

  // Obtenemos los ingredientes base que aún no han sido excluidos
  // y que están en la lista de permitidos
  const ingredientesQuitables = producto.producto.ingredientes?.filter(ing => {
    // Primero verificamos si el ingrediente está permitido en la subcategoría
    const estaPermitido = ingredientes.some(
      permitido => permitido._id === ing.ingrediente._id
    );

    if (!estaPermitido) return false;

    // Luego verificamos las exclusiones existentes
    const exclusionExistente = producto.ingredientes.excluidos.find(
      exc => exc.ingrediente === ing.ingrediente._id
    );
    
    // Si no hay exclusión o aún se puede excluir más, mostramos el ingrediente
    return !exclusionExistente || 
      (exclusionExistente && exclusionExistente.cantidad < ing.cantidad);
  });

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
              Quitar ingredientes de {producto.producto.nombre}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-4 gap-2 p-4">
            {ingredientesQuitables?.length > 0 ? (
              ingredientesQuitables.map((ing) => {
                const exclusionExistente = producto.ingredientes.excluidos.find(
                  exc => exc.ingrediente === ing.ingrediente._id
                );

                return (
                  <button
                    key={ing.ingrediente._id}
                    onClick={() => onIngredienteSelect(ing.ingrediente)}
                    className="p-2 bg-white rounded border border-[#AAB99A] text-[#727D73] 
                      hover:bg-[#D0DDD0] transition-colors text-sm flex flex-col items-center"
                  >
                    <span>{ing.ingrediente.nombre}</span>
                    <span className="text-xs text-gray-500">
                      ({ing.unidad})
                      {exclusionExistente && (
                        <span className="text-red-500 ml-1">
                          -{exclusionExistente.cantidad}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="col-span-4 text-center text-[#727D73] p-4">
                No hay ingredientes disponibles para quitar
              </div>
            )}
          </div>

          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 
              transition-opacity hover:opacity-100 focus:outline-none 
              focus:ring-2 focus:ring-[#AAB99A] focus:ring-offset-2"
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

export default QuitarIngredientesModal;