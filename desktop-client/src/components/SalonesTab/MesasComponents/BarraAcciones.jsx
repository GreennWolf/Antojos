import React from 'react';
import BotonesAccionesPrincipales from './BotonesAccionesPrincipales';
import BotonesAccionesSecundarias from './BotonesAccionesSecundarias';

const BarraAcciones = ({
  tienePedido,
  // Acciones principales
  onConsultarMesa,
  onHacerFactura,
  onCerrarMesa,
  onAsignarCliente,
  onCambiarMesa,
  // Acciones secundarias
  onDividirMesa,
  onAplicarDescuento,
  onConfirmarPedido,
  onJuntarMesa,
  // Utilidades
  mostrarToast
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#AAB99A] p-2">
      <div className="flex justify-between">
        <BotonesAccionesPrincipales
          tienePedido={tienePedido}
          onConsultarMesa={onConsultarMesa}
          onHacerFactura={onHacerFactura}
          onCerrarMesa={onCerrarMesa}
          onAsignarCliente={onAsignarCliente}
          onCambiarMesa={onCambiarMesa}
        />

        <BotonesAccionesSecundarias
          tienePedido={tienePedido}
          onDividirMesa={onDividirMesa}
          onAplicarDescuento={onAplicarDescuento}
          onConfirmarPedido={onConfirmarPedido}
          onJuntarMesa={onJuntarMesa}
          mostrarToast={mostrarToast}
        />
      </div>
    </div>
  );
};

export default BarraAcciones;