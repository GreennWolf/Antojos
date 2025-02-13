import React, { useEffect, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { FileText } from "lucide-react";

const ProductoPedidoCard = ({
  producto,
  onUpdateCantidad,
  onAgregarIngrediente,
  onQuitarIngrediente,
  onEliminarProducto,
  onAgregarObservaciones,
}) => {
  const precioBaseTotal = (producto.precio || 0) * producto.cantidad;
  const precioIngredientesExtras =
    producto.ingredientes?.extras?.reduce((sum, extra) => {
      return sum + (extra.costoExtra || 0) * extra.cantidad;
    }, 0) || 0;

  const [mostrarObservacion, setMostrarObservacion] = useState(false);

  useEffect(() => {
    setMostrarObservacion(false);
  }, [producto]);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="mb-2 bg-[#F0F0D7] p-2 rounded shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex justify-between items-start gap-2">
            {/* Información del producto */}
            <div className="flex-1 min-w-0">
              <div className="text-[#727D73] font-medium text-sm truncate">
                {producto.producto.nombre}
              </div>
              
              <div className="text-sm text-gray-700">
                {(precioBaseTotal + precioIngredientesExtras).toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR",
                })}
              </div>

              {/* Ingredientes */}
              <div className="mt-1 space-y-0.5">
                {producto.ingredientes?.extras?.map((extra, idx) => {
                  const extraNombre =
                    extra.nombre ||
                    (extra.ingrediente && extra.ingrediente.nombre ? extra.ingrediente.nombre : "");
                  return (
                    <div 
                      key={`extra-${extra.ingrediente.toString()}-${idx}`} 
                      className="text-xs text-green-600 flex items-center"
                    >
                      <span className="inline-block w-3 text-center mr-0.5">+</span>
                      <span className="truncate">{extraNombre}</span>
                      <span className="ml-0.5">x{extra.cantidad}</span>
                    </div>
                  );
                })}
                
                {producto.ingredientes?.excluidos?.map((exc, idx) => {
                  const excNombre =
                    exc.nombre ||
                    (exc.ingrediente && exc.ingrediente.nombre ? exc.ingrediente.nombre : "");
                  return (
                    <div 
                      key={`exc-${exc.ingrediente.toString()}-${idx}`} 
                      className="text-xs text-red-600 flex items-center"
                    >
                      <span className="inline-block w-3 text-center mr-0.5">-</span>
                      <span className="truncate">{excNombre}</span>
                      {exc.cantidad >= 1 && <span className="ml-0.5">x{exc.cantidad}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Controles de cantidad */}
            <div className="flex items-center gap-1 bg-white p-0.5 rounded shadow-sm">
              <button
                onClick={() => onUpdateCantidad(producto.uid, producto.cantidad - 1)}
                className="bg-[#727D73] text-white w-6 h-6 rounded flex items-center justify-center hover:bg-[#5a635b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                disabled={producto.cantidad <= 1}
              >
                -
              </button>
              <span className="w-5 text-center text-sm">{producto.cantidad}</span>
              <button
                onClick={() => onUpdateCantidad(producto.uid, producto.cantidad + 1)}
                className="bg-[#727D73] text-white w-6 h-6 rounded flex items-center justify-center hover:bg-[#5a635b] transition-colors text-xs"
              >
                +
              </button>
            </div>
          </div>

          {/* Observaciones */}
          {producto.observaciones && producto.observaciones.trim() !== "" && (
            <div className="relative mt-2">
              <button
                className="absolute -bottom-0 right-0 bg-white p-1 rounded shadow-sm hover:bg-gray-50 transition-colors"
                onClick={() => setMostrarObservacion((prev) => !prev)}
              >
                <FileText className="h-3 w-3 text-[#727D73]" />
              </button>
              {mostrarObservacion && (
                <div className="mt-1 p-2 bg-white rounded shadow-sm max-w-full">
                  <p className="text-xs text-gray-600 break-words">
                    {producto.observaciones}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="bg-white border border-[#AAB99A] shadow-lg rounded">
        <ContextMenuItem 
          className="hover:bg-[#D0DDD0] cursor-pointer px-3 py-1.5 text-xs"
          onClick={() => onAgregarIngrediente(producto)}
        >
          Agregar Ingrediente
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-[#AAB99A]" />
        <ContextMenuItem 
          className="hover:bg-[#D0DDD0] cursor-pointer px-3 py-1.5 text-xs"
          onClick={() => onQuitarIngrediente(producto)}
        >
          Quitar Ingrediente
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-[#AAB99A]" />
        <ContextMenuItem 
          className="hover:bg-[#D0DDD0] cursor-pointer px-3 py-1.5 text-xs"
          onClick={() => onAgregarObservaciones(producto)}
        >
          Observaciones
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-[#AAB99A]" />
        <ContextMenuItem 
          className="text-red-600 hover:bg-[#D0DDD0] cursor-pointer px-3 py-1.5 text-xs"
          onClick={() => onEliminarProducto(producto.uid)}
        >
          Eliminar
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default ProductoPedidoCard;