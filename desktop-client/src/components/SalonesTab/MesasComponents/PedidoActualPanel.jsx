import React from 'react';
import ProductosPedidoList from './ProductosPedidoList';
import ResumenPedido from './ResumenPedido';

const PedidoActualPanel = ({
  pedido,
  onUpdateCantidad,
  onAgregarIngrediente,
  onQuitarIngrediente,
  onEliminarProducto
}) => {
  const { productos = [], subtotal = 0, descuento = 0, total = 0 } = pedido || {};

  return (
    <div className="w-80 bg-white border-l border-[#AAB99A] flex flex-col">
      {/* Cabecera del panel */}
      <div className="p-2 border-b border-[#AAB99A]">
        <h2 className="font-medium text-[#727D73]">Pedido Actual</h2>
      </div>

      {/* Lista de productos */}
      <ProductosPedidoList
        productos={productos}
        onUpdateCantidad={onUpdateCantidad}
        onAgregarIngrediente={onAgregarIngrediente}
        onQuitarIngrediente={onQuitarIngrediente}
        onEliminarProducto={onEliminarProducto}
      />

      {/* Resumen de totales */}
      <ResumenPedido
        subtotal={subtotal}
        descuento={descuento}
        total={total}
      />

      {/* Panel de información adicional */}
      {productos.length > 0 && (
        <div className="p-2 text-xs text-[#727D73] bg-[#F0F0D7] border-t border-[#AAB99A]">
          <div className="flex items-center gap-1">
            <span className="font-medium">Consejos:</span>
            <ul className="list-disc list-inside">
              <li>Click derecho en un producto para más opciones</li>
              {productos.some(p => p.ingredientes?.length > 0) && (
                <li>Puedes modificar los ingredientes de los productos</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidoActualPanel;