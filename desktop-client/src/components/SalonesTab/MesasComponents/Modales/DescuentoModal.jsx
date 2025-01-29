import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";

const DescuentoModal = ({
  isOpen,
  onClose,
  descuentoInicial,
  subtotal,
  onAplicarDescuento
}) => {
  const [descuento, setDescuento] = useState(descuentoInicial);

  const handleDescuentoChange = (e) => {
    const value = Math.min(100, Math.max(0, Number(e.target.value)));
    setDescuento(value);
  };

  const descuentoCalculado = subtotal * (descuento / 100);
  const totalConDescuento = subtotal - descuentoCalculado;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay 
          className="bg-black/80" 
          onClick={(e) => e.stopPropagation()}
        />
        <DialogContent
          className="bg-[#F0F0D7] border border-[#AAB99A] max-w-sm"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-[#727D73]">
              Aplicar Descuento
            </DialogTitle>
          </DialogHeader>

          <div className="p-4">
            <div className="space-y-4">
              {/* Input de descuento */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm text-[#727D73]">
                  Porcentaje de descuento:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={descuento}
                    onChange={handleDescuentoChange}
                    className="w-full px-3 py-2 border border-[#AAB99A] rounded text-[#727D73]"
                  />
                  <span className="text-[#727D73]">%</span>
                </div>
              </div>

              {/* Resumen de cálculos */}
              {subtotal > 0 && (
                <div className="text-sm text-[#727D73] space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>
                      {subtotal.toLocaleString('es-ES', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Descuento ({descuento}%):</span>
                    <span>
                      -{descuentoCalculado.toLocaleString('es-ES', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium pt-1 border-t border-[#AAB99A]">
                    <span>Total con descuento:</span>
                    <span>
                      {totalConDescuento.toLocaleString('es-ES', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </span>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-[#727D73] text-[#727D73] 
                    rounded hover:bg-[#D0DDD0]"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onAplicarDescuento(descuento);
                    onClose();
                  }}
                  className="px-4 py-2 bg-[#727D73] text-white 
                    rounded hover:bg-[#727D73]/90"
                >
                  Aplicar Descuento
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default DescuentoModal;