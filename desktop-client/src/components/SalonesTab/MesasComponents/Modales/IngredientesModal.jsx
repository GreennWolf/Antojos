// IngredientesModal.jsx
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

const IngredientesModal = ({
  isOpen,
  onClose,
  producto,
  ingredientesDisponibles,
  onIngredienteSelect
}) => {
  if (!producto) return null;

  // Filtrar ingredientes que ya están como extras
  const ingredientesFiltrados = ingredientesDisponibles.filter(ing => 
    !producto.ingredientes.extras.some(extra => 
      extra.ingrediente === ing._id
    )
  );

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
              Agregar ingredientes a {producto.producto.nombre}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-4 gap-2 p-4">
            {ingredientesFiltrados.length > 0 ? (
              ingredientesFiltrados.map((ingrediente) => (
                <button
                  key={ingrediente._id}
                  onClick={() => onIngredienteSelect(ingrediente)}
                  className="p-2 bg-white rounded border border-[#AAB99A] text-[#727D73] 
                    hover:bg-[#D0DDD0] transition-colors text-sm flex flex-col items-center"
                >
                  <span>{ingrediente.nombre}</span>
                  <span className="text-xs text-gray-500">
                    ({ingrediente.precio?.toLocaleString('es-ES', {
                      style: 'currency',
                      currency: 'EUR'
                    })} / {ingrediente.unidad})
                  </span>
                </button>
              ))
            ) : (
              <div className="col-span-4 text-center text-[#727D73] p-4">
                Esta subcategoría no tiene ingredientes permitidos
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

export default IngredientesModal;