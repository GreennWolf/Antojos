import React from 'react';

const BotonesAccionesSecundarias = ({
  tienePedido,
  onDividirMesa,
  onAplicarDescuento,
  onConfirmarPedido,
  onJuntarMesa,
  mostrarToast
}) => {
  const buttonClass = `
    px-3 py-1.5 text-sm rounded
    transition-colors duration-200
  `;

  const activeButtonClass = `
    ${buttonClass}
    bg-[#727D73] text-white
    hover:bg-[#727D73]/90
  `;

  const handleDividirMesa = () => {
    if (!tienePedido) {
      mostrarToast?.('No hay productos para dividir', { type: 'warning' });
      return;
    }
    onDividirMesa();
  };

  const handleJuntarMesa = () => {
    if (!tienePedido) {
      mostrarToast?.('No hay productos en la mesa actual', { type: 'warning' });
      return;
    }
    onJuntarMesa();
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleDividirMesa}
        className={activeButtonClass}
      >
        Dividir Mesa
      </button>

      <button
        onClick={onAplicarDescuento}
        className={tienePedido ? activeButtonClass : `
          ${buttonClass}
          bg-gray-300 text-gray-500
          cursor-not-allowed
        `}
        disabled={!tienePedido}
      >
        Descuento
      </button>

      <button
        onClick={onConfirmarPedido}
        className={tienePedido ? activeButtonClass : `
          ${buttonClass}
          bg-gray-300 text-gray-500
          cursor-not-allowed
        `}
        disabled={!tienePedido}
      >
        Confirmar Pedido
      </button>

      <button
        onClick={handleJuntarMesa}
        className={activeButtonClass}
      >
        Juntar Mesa
      </button>
    </div>
  );
};

export default BotonesAccionesSecundarias;