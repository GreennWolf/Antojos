import React, { useState } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";

const CodigoModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Ingrese código de autorización",
  message = "Se requiere autorización para realizar esta acción"
}) => {
  const [codigo, setCodigo] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(codigo);
    setCodigo('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay 
          className="bg-black/80" 
          onClick={(e) => e.stopPropagation()}
        />
        <DialogContent className="bg-[#F0F0D7] border border-[#AAB99A]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold leading-none tracking-tight text-[#727D73]">
              {title}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-[#727D73]">{message}</p>
            <input
              type="password"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full p-2 border border-[#AAB99A] rounded"
              placeholder="Ingrese su código"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[#727D73] hover:bg-gray-100 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#727D73] text-white rounded hover:bg-[#727D73]/90"
              >
                Confirmar
              </button>
            </div>
          </form>

          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 
              transition-opacity hover:opacity-100"
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

export default CodigoModal;