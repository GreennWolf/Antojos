import React from 'react';

const ResumenPedido = ({
  subtotal = 0,
  descuento = 0,
  total = 0
}) => {
  const descuentoCalculado = subtotal * (descuento / 100);

  return (
    <div className="p-2 border-t border-[#AAB99A] bg-[#F0F0D7]">
      <div className="space-y-1">
        {/* Subtotal */}
        <div className="flex justify-between items-center text-sm text-[#727D73]">
          <span>Subtotal:</span>
          <span>
            {subtotal.toLocaleString('es-ES', {
              style: 'currency',
              currency: 'EUR'
            })}
          </span>
        </div>

        {/* Descuento si existe */}
        {descuento > 0 && (
          <div className="flex justify-between items-center text-sm text-red-600">
            <span>Descuento ({descuento}%):</span>
            <span>
              -{descuentoCalculado.toLocaleString('es-ES', {
                style: 'currency',
                currency: 'EUR'
              })}
            </span>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between items-center font-medium text-[#727D73] pt-1 border-t border-[#AAB99A]">
          <span>Total:</span>
          <span>
            {total.toLocaleString('es-ES', {
              style: 'currency',
              currency: 'EUR'
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResumenPedido;