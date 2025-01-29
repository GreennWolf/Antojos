import React, { useEffect } from 'react';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator
} from "@/components/ui/context-menu";

const ProductoPedidoCard = ({ 
  producto, 
  onUpdateCantidad, 
  onAgregarIngrediente,
  onQuitarIngrediente,
  onEliminarProducto 
}) => {
  // Calculamos el precio total del producto base
  const precioBaseTotal = (producto.precio || 0) * producto.cantidad;

  // Calculamos el precio de los ingredientes extras
  const precioIngredientesExtras = producto.ingredientes?.extras?.reduce((sum, extra) => {
    return sum + (extra.costoExtra || 0) * extra.cantidad;
  }, 0) || 0;

  useEffect(()=>{
    console.log(producto)
  },[])

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="mb-2 bg-[#F0F0D7] p-2 rounded">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {/* Nombre y precio del producto */}
              <div className="text-[#727D73] font-medium">
                {producto.producto.nombre}
              </div>
              <div className="text-sm text-gray-600">
                {(precioBaseTotal + precioIngredientesExtras).toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR",
                })}
              </div>

              {/* Lista de ingredientes modificados */}
              <div className="text-xs space-y-0.5 mt-1">
                {/* Ingredientes extras */}
                {producto.ingredientes?.extras?.map((extra, idx) => {
                  // Buscamos el ingrediente en la subcategoría para obtener su nombre
                  const ingrediente = producto.producto.subCategoria.ingredientesPermitidos.find(
                    ing => ing._id === extra.ingrediente
                  );
                  
                  return (
                    <div
                      key={`extra-${extra.ingrediente}-${idx}`}
                      className="text-green-600"
                    >
                      + {extra?.nombre} x{extra.cantidad} (
                      {(extra.costoExtra || 0).toLocaleString("es-ES", {
                        style: "currency",
                        currency: "EUR",
                      })}
                      {extra.cantidad > 1
                        ? ` x ${extra.cantidad} = ${(
                            (extra.costoExtra || 0) * extra.cantidad
                          ).toLocaleString("es-ES", {
                            style: "currency",
                            currency: "EUR",
                          })}`
                        : ""}
                      )
                    </div>
                  );
                })}

                {/* Ingredientes excluidos */}
                {producto.ingredientes.excluidos.map((excluido, idx) => {
                  // Buscamos el ingrediente en los ingredientes base del producto
                  const ingrediente = producto.producto.ingredientes.find(
                    ing => ing.ingrediente._id === excluido.ingrediente
                  );

                  return (
                    <div
                      key={`excluido-${excluido.ingrediente}-${idx}`}
                      className="text-red-600"
                    >
                      - {excluido?.nombre} {excluido.cantidad >= 1 ? `x${excluido.cantidad}` : ''}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Controles de cantidad */}
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => onUpdateCantidad(producto.producto._id, producto.cantidad - 1)}
                className="bg-[#727D73] text-white w-6 h-6 rounded flex items-center justify-center"
                disabled={producto.cantidad <= 1}
              >
                -
              </button>
              <span className="w-6 text-center">
                {producto.cantidad}
              </span>
              <button
                onClick={() => onUpdateCantidad(producto.producto._id, producto.cantidad + 1)}
                className="bg-[#727D73] text-white w-6 h-6 rounded flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>

      {/* Menú contextual */}
      <ContextMenuContent className="bg-white border border-[#AAB99A] shadow-lg">
        <ContextMenuItem
          className="hover:bg-[#D0DDD0] cursor-pointer"
          onClick={() => onAgregarIngrediente(producto)}
        >
          Agregar Ingrediente
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-[#AAB99A]" />
        <ContextMenuItem
          className="hover:bg-[#D0DDD0] cursor-pointer"
          onClick={() => onQuitarIngrediente(producto)}
        >
          Quitar Ingrediente
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-[#AAB99A]" />
        <ContextMenuItem
          className="text-red-600 hover:bg-[#D0DDD0] cursor-pointer"
          onClick={() => onEliminarProducto(producto.producto._id)}
        >
          Eliminar
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default ProductoPedidoCard;