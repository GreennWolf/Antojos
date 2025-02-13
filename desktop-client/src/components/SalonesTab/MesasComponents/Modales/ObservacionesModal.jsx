// ObservacionesModal.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";

const ObservacionesModal = ({ isOpen, onClose, producto, onConfirm }) => {
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    if (producto) {
      // Si el producto ya tiene observaciones, las pre-cargamos
      setObservaciones(producto.observaciones || "");
    }
  }, [producto]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="bg-black/80" onClick={(e) => e.stopPropagation()} />
        <DialogContent
          className="bg-[#F0F0D7] border border-[#AAB99A] p-4"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-medium text-[#727D73]">
              Agregar Observaciones
            </DialogTitle>
          </DialogHeader>
          <textarea
            className="w-full p-2 border border-gray-300 rounded"
            rows="4"
            placeholder="Escribe las observaciones..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
          <div className="flex justify-end mt-4">
            <button
              className="px-4 py-2 mr-2 border rounded bg-gray-200"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 border rounded bg-[#727D73] text-white"
              onClick={() => {
                onConfirm(observaciones);
                onClose();
              }}
            >
              Guardar
            </button>
          </div>
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
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

export default ObservacionesModal;
