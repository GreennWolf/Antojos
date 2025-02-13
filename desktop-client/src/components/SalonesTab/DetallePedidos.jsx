import React from 'react';

export const DetallePedido = ({ pedido }) => {
  if (!pedido) return null;

  return (
    <div className="flex flex-col h-[calc(100%-2rem)]"> {/* Ajustado para considerar el título */}
      <div className="flex-1 overflow-y-auto">
        {pedido.productos.map((producto) => (
          <div key={producto.uid} className="mb-2 bg-white p-2 rounded">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-[#727D73] font-medium">
                  {producto.producto.nombre}
                </div>
                <div className="text-sm text-gray-600">
                  {((producto.precio || 0) * producto.cantidad).toLocaleString("es-ES", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </div>
                {producto.ingredientes?.length > 0 && (
                  <div className="text-xs space-y-0.5 mt-1">
                    {producto.ingredientes
                      .filter((ing) => (ing.cantidadAgregada || 0) > 0)
                      .map((ing, idx) => (
                        <div
                          key={`${ing.ingrediente._id}-agregado-${idx}`}
                          className="text-green-600"
                        >
                          + {ing.ingrediente.nombre} x{ing.cantidadAgregada} ({ing.ingrediente.precio.toLocaleString("es-ES", {
                            style: "currency",
                            currency: "EUR",
                          })})
                        </div>
                      ))}
                    {producto.ingredientes
                      .filter((ing) => (ing.cantidadQuitada || 0) > 0)
                      .map((ing, idx) => (
                        <div
                          key={`${ing.ingrediente._id}-quitado-${idx}`}
                          className="text-red-600"
                        >
                          - {ing.ingrediente.nombre} x{ing.cantidadQuitada} {ing.unidad}
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 ml-2">
                <span className="w-6 text-center">
                  {producto.cantidad}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen fijo en la parte inferior */}
      <div className="mt-2 bg-white rounded-lg p-3 border border-[#AAB99A]">
        <div className="space-y-1">
          <div className="flex justify-between items-center text-sm text-[#727D73]">
            <span>Subtotal:</span>
            <span>
              {(pedido.subtotal || 0).toLocaleString("es-ES", {
                style: "currency",
                currency: "EUR",
              })}
            </span>
          </div>
          {pedido.descuento > 0 && (
            <div className="flex justify-between items-center text-sm text-red-600">
              <span>Descuento ({pedido.descuento}%):</span>
              <span>
                -{(pedido.subtotal * (pedido.descuento / 100) || 0).toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR",
                })}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center font-medium text-[#727D73] pt-1 border-t border-[#AAB99A]">
            <span>Total:</span>
            <span>
              {(pedido.total || 0).toLocaleString("es-ES", {
                style: "currency",
                currency: "EUR",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};