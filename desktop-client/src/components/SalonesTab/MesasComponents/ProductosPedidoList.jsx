import React from 'react';
import ProductoPedidoCard from './ProductoPedidoCard';

const ProductosPedidoList = ({
  productos,
  onUpdateCantidad,
  onAgregarIngrediente,
  onQuitarIngrediente,
  onEliminarProducto,
  onAgregarObservaciones
}) => {
  if (!productos || productos.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-[#727D73] text-sm">
        No hay productos en el pedido
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2">
      <div className="space-y-2">
        {productos.map((producto) => (
          <ProductoPedidoCard
            key={producto.uid}
            producto={producto}
            onUpdateCantidad={onUpdateCantidad}
            onAgregarIngrediente={onAgregarIngrediente}
            onQuitarIngrediente={onQuitarIngrediente}
            onEliminarProducto={onEliminarProducto}
            onAgregarObservaciones={onAgregarObservaciones} // Pasamos el callback
          />
        ))}
      </div>

      {/* Sección de notas o advertencias si son necesarias */}
      {productos.some(p => p.ingredientes?.excluidos?.length > 0) && (
        <div className="mt-4 text-xs text-[#727D73] border-t border-[#AAB99A] pt-2">
          <span className="font-medium">Nota:</span> Hay productos con ingredientes 
          excluidos. Por favor, verifique antes de enviar a cocina.
        </div>
      )}
    </div>
  );
};

export default ProductosPedidoList;