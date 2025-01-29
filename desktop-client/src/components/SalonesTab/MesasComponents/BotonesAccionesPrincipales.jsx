import React from 'react';

const BotonesAccionesPrincipales = ({
  tienePedido,
  onConsultarMesa,
  onHacerFactura,
  onCerrarMesa,
  onAsignarCliente,
  onCambiarMesa
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

  const disabledButtonClass = `
    ${buttonClass}
    bg-gray-300 text-gray-500
    cursor-not-allowed
  `;

  return (
    <div className="flex gap-2">
      <button 
        onClick={onConsultarMesa}
        className={activeButtonClass}
      >
        Consultar Mesa
      </button>

      <button 
        onClick={onHacerFactura}
        className={tienePedido ? activeButtonClass : disabledButtonClass}
        disabled={!tienePedido}
      >
        Hacer Factura
      </button>

      <button 
        onClick={onCerrarMesa}
        className={tienePedido ? activeButtonClass : disabledButtonClass}
        disabled={!tienePedido}
      >
        Cerrar Mesa
      </button>

      <button 
        onClick={onAsignarCliente}
        className={activeButtonClass}
      >
        Asignar Cliente
      </button>

      <button
        onClick={onCambiarMesa}
        className={tienePedido ? activeButtonClass : disabledButtonClass}
        disabled={!tienePedido}
      >
        Cambiar Mesa
      </button>
    </div>
  );
};

export default BotonesAccionesPrincipales;