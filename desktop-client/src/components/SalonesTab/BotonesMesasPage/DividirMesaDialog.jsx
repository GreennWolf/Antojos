import React, { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";

const DividirMesaDialog = ({
  open,
  onOpenChange,
  mesaActual,
  pedidoActual,
  onCobrarPedidoDividido,
}) => {
  // Estados para los pedidos de cada lado
  const [pedidoIzquierdo, setPedidoIzquierdo] = useState({
    productos: [],
    subtotal: 0,
    descuento: 0,
    total: 0,
  });
  const [pedidoDerecho, setPedidoDerecho] = useState({
    productos: [],
    subtotal: 0,
    descuento: 0,
    total: 0,
  });

  // Estados para la selección de productos
  const [productosSeleccionadosIzq, setProductosSeleccionadosIzq] = useState(
    new Set()
  );
  const [productosSeleccionadosDer, setProductosSeleccionadosDer] = useState(
    new Set()
  );

  // Función para calcular totales
  const calcularTotal = (productos, descuento = 0) => {
    const subtotal = productos.reduce((total, p) => {
      const precioBase = (p.precio || 0) * p.cantidad;

      const precioIngredientes =
        p.ingredientes?.reduce((sum, ing) => {
          if (ing.cantidadQuitada) return sum;

          if (ing.cantidadAgregada) {
            return sum + (ing.ingrediente.precio || 0) * ing.cantidadAgregada;
          }
          return sum;
        }, 0) || 0;

      return total + precioBase + precioIngredientes;
    }, 0);

    const descuentoCalculado = subtotal * (descuento / 100) || 0;

    return {
      subtotal,
      descuento,
      total: subtotal - descuentoCalculado,
    };
  };

  // Inicializar pedido izquierdo con el pedido actual
  useEffect(() => {
    if (open && pedidoActual) {
      setPedidoIzquierdo({
        productos: [...pedidoActual.productos],
        ...calcularTotal(pedidoActual.productos, pedidoActual.descuento),
      });
      setPedidoDerecho({
        productos: [],
        subtotal: 0,
        descuento: 0,
        total: 0,
      });
      setProductosSeleccionadosIzq(new Set());
      setProductosSeleccionadosDer(new Set());
    }
  }, [open, pedidoActual]);

  // Funciones para manejar la selección de productos
  const toggleSeleccionIzquierda = (uid) => {
    setProductosSeleccionadosIzq((prevSelected) => {
      const newSelection = new Set(prevSelected);
      if (newSelection.has(uid)) {
        newSelection.delete(uid);
      } else {
        newSelection.add(uid);
      }
      return newSelection;
    });
  };

  const toggleSeleccionDerecha = (uid) => {
    setProductosSeleccionadosDer((prevSelected) => {
      const newSelection = new Set(prevSelected);
      if (newSelection.has(uid)) {
        newSelection.delete(uid);
      } else {
        newSelection.add(uid);
      }
      return newSelection;
    });
  };

  // Funciones para mover productos
  const moverADerecha = () => {
    if (productosSeleccionadosIzq.size === 0) return;

    const nuevosProductosIzq = [...pedidoIzquierdo.productos];
    const nuevosProductosDer = [...pedidoDerecho.productos];

    productosSeleccionadosIzq.forEach((uid) => {
      const index = nuevosProductosIzq.findIndex((p) => p.uid === uid);
      if (index !== -1) {
        const producto = nuevosProductosIzq[index];

        // Buscar si el producto ya existe en el lado derecho (mismo nombre e ingredientes)
        const productoExistenteIndex = nuevosProductosDer.findIndex(
          (p) =>
            p.nombre === producto.nombre &&
            JSON.stringify(p.ingredientes) ===
              JSON.stringify(producto.ingredientes)
        );

        if (producto.cantidad > 1) {
          // Reducir la cantidad en el original
          nuevosProductosIzq[index] = {
            ...producto,
            cantidad: producto.cantidad - 1,
          };

          if (productoExistenteIndex !== -1) {
            // Si existe, sumamos la cantidad
            nuevosProductosDer[productoExistenteIndex] = {
              ...nuevosProductosDer[productoExistenteIndex],
              cantidad: nuevosProductosDer[productoExistenteIndex].cantidad + 1,
            };
          } else {
            // Si no existe, creamos uno nuevo con cantidad 1
            nuevosProductosDer.push({
              ...producto,
              cantidad: 1,
              uid: Date.now() + Math.random(),
            });
          }
        } else {
          // Si solo hay una unidad
          nuevosProductosIzq.splice(index, 1);

          if (productoExistenteIndex !== -1) {
            // Si existe, sumamos la cantidad
            nuevosProductosDer[productoExistenteIndex] = {
              ...nuevosProductosDer[productoExistenteIndex],
              cantidad: nuevosProductosDer[productoExistenteIndex].cantidad + 1,
            };
          } else {
            // Si no existe, lo movemos completo
            nuevosProductosDer.push(producto);
          }
        }
      }
    });

    setPedidoIzquierdo((prev) => ({
      productos: nuevosProductosIzq,
      ...calcularTotal(nuevosProductosIzq, prev.descuento),
    }));

    setPedidoDerecho((prev) => ({
      productos: nuevosProductosDer,
      ...calcularTotal(nuevosProductosDer, prev.descuento),
    }));

    setProductosSeleccionadosIzq(new Set());
  };

  const moverAIzquierda = () => {
    if (productosSeleccionadosDer.size === 0) return;

    const nuevosProductosDer = [...pedidoDerecho.productos];
    const nuevosProductosIzq = [...pedidoIzquierdo.productos];

    productosSeleccionadosDer.forEach((uid) => {
      const index = nuevosProductosDer.findIndex((p) => p.uid === uid);
      if (index !== -1) {
        const producto = nuevosProductosDer[index];

        // Buscar si el producto ya existe en el lado izquierdo
        const productoExistenteIndex = nuevosProductosIzq.findIndex(
          (p) =>
            p.nombre === producto.nombre &&
            JSON.stringify(p.ingredientes) ===
              JSON.stringify(producto.ingredientes)
        );

        if (producto.cantidad > 1) {
          // Reducir la cantidad en el original
          nuevosProductosDer[index] = {
            ...producto,
            cantidad: producto.cantidad - 1,
          };

          if (productoExistenteIndex !== -1) {
            // Si existe, sumamos la cantidad
            nuevosProductosIzq[productoExistenteIndex] = {
              ...nuevosProductosIzq[productoExistenteIndex],
              cantidad: nuevosProductosIzq[productoExistenteIndex].cantidad + 1,
            };
          } else {
            // Si no existe, creamos uno nuevo con cantidad 1
            nuevosProductosIzq.push({
              ...producto,
              cantidad: 1,
              uid: Date.now() + Math.random(),
            });
          }
        } else {
          // Si solo hay una unidad
          nuevosProductosDer.splice(index, 1);

          if (productoExistenteIndex !== -1) {
            // Si existe, sumamos la cantidad
            nuevosProductosIzq[productoExistenteIndex] = {
              ...nuevosProductosIzq[productoExistenteIndex],
              cantidad: nuevosProductosIzq[productoExistenteIndex].cantidad + 1,
            };
          } else {
            // Si no existe, lo movemos completo
            nuevosProductosIzq.push(producto);
          }
        }
      }
    });

    setPedidoDerecho((prev) => ({
      productos: nuevosProductosDer,
      ...calcularTotal(nuevosProductosDer, prev.descuento),
    }));

    setPedidoIzquierdo((prev) => ({
      productos: nuevosProductosIzq,
      ...calcularTotal(nuevosProductosIzq, prev.descuento),
    }));

    setProductosSeleccionadosDer(new Set());
  };

  // Renderizado de productos
  const renderProducto = (producto, seleccionado, onToggle) => (
    <div
      key={producto.uid}
      onClick={() => onToggle(producto.uid)}
      className={`mb-2 p-2 rounded cursor-pointer border ${
        seleccionado
          ? "bg-[#727D73] text-white border-[#727D73]"
          : "bg-white text-[#727D73] border-[#AAB99A]"
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="font-medium">{producto.nombre}</div>
          <div className="text-sm">
            {((producto.precio || 0) * producto.cantidad).toFixed(2)}€
          </div>
          {producto.ingredientes?.length > 0 && (
            <div className="text-xs space-y-0.5 mt-1">
              {producto.ingredientes
                .filter((ing) => (ing.cantidadAgregada || 0) > 0)
                .map((ing, idx) => (
                  <div
                    key={`${ing.ingrediente._id}-agregado-${idx}`}
                    className={
                      seleccionado ? "text-green-200" : "text-green-600"
                    }
                  >
                    + {ing.ingrediente.nombre} x{ing.cantidadAgregada}
                  </div>
                ))}
              {producto.ingredientes
                .filter((ing) => (ing.cantidadQuitada || 0) > 0)
                .map((ing, idx) => (
                  <div
                    key={`${ing.ingrediente._id}-quitado-${idx}`}
                    className={seleccionado ? "text-red-200" : "text-red-600"}
                  >
                    - {ing.ingrediente.nombre} x{ing.cantidadQuitada}
                  </div>
                ))}
            </div>
          )}
        </div>
        <div className="text-sm font-medium">x{producto.cantidad}</div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay
          className="bg-black/80"
          onClick={(e) => e.stopPropagation()}
        />
        <DialogContent
          className="bg-[#F0F0D7] border border-[#AAB99A] max-w-6xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold leading-none tracking-tight text-[#727D73]">
              Dividir Mesa {mesaActual}
            </DialogTitle>
          </DialogHeader>

          <div className="p-4">
            <div className="flex gap-4">
              {/* Panel Izquierdo */}
              <div className="flex-1 bg-white p-4 rounded border border-[#AAB99A]">
                <h3 className="font-medium text-[#727D73] mb-4">
                  Mesa Original
                </h3>
                <div className="overflow-y-auto max-h-[50vh]">
                  {pedidoIzquierdo.productos.map((producto) =>
                    renderProducto(
                      producto,
                      productosSeleccionadosIzq.has(producto.uid),
                      toggleSeleccionIzquierda
                    )
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-[#AAB99A]">
                  <div className="flex justify-between text-sm text-[#727D73]">
                    <span>Subtotal:</span>
                    <span>{pedidoIzquierdo.subtotal.toFixed(2)}€</span>
                  </div>
                  {pedidoIzquierdo.descuento > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Descuento ({pedidoIzquierdo.descuento}%):</span>
                      <span>
                        -
                        {(
                          (pedidoIzquierdo.subtotal *
                            pedidoIzquierdo.descuento) /
                          100
                        ).toFixed(2)}
                        €
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium text-[#727D73] pt-1 mt-1">
                    <span>Total:</span>
                    <span>{pedidoIzquierdo.total.toFixed(2)}€</span>
                  </div>
                </div>
              </div>

              {/* Botones centrales */}
              <div className="flex flex-col justify-center gap-4">
                <button
                  onClick={moverADerecha}
                  disabled={productosSeleccionadosIzq.size === 0}
                  className={`p-2 rounded ${
                    productosSeleccionadosIzq.size > 0
                      ? "bg-[#727D73] text-white hover:bg-[#727D73]/90"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <button
                  onClick={moverAIzquierda}
                  disabled={productosSeleccionadosDer.size === 0}
                  className={`p-2 rounded ${
                    productosSeleccionadosDer.size > 0
                      ? "bg-[#727D73] text-white hover:bg-[#727D73]/90"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              </div>

              {/* Panel Derecho */}
              <div className="flex-1 bg-white p-4 rounded border border-[#AAB99A]">
                <h3 className="font-medium text-[#727D73] mb-4">
                  Cuenta Separada
                </h3>
                <div className="overflow-y-auto max-h-[50vh]">
                  {pedidoDerecho.productos.map((producto) =>
                    renderProducto(
                      producto,
                      productosSeleccionadosDer.has(producto.uid),
                      toggleSeleccionDerecha
                    )
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-[#AAB99A]">
                  <div className="flex justify-between text-sm text-[#727D73]">
                    <span>Subtotal:</span>
                    <span>{pedidoDerecho.subtotal.toFixed(2)}€</span>
                  </div>
                  {pedidoDerecho.descuento > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Descuento ({pedidoDerecho.descuento}%):</span>
                      <span>
                        -
                        {(
                          (pedidoDerecho.subtotal * pedidoDerecho.descuento) /
                          100
                        ).toFixed(2)}
                        €
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium text-[#727D73] pt-1 mt-1">
                    <span>Total:</span>
                    <span>{pedidoDerecho.total.toFixed(2)}€</span>
                  </div>
                </div>
                {pedidoDerecho.productos.length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={async () => {
                        await onCobrarPedidoDividido(pedidoDerecho);
                        // Después de cobrar, actualizamos el pedido izquierdo y limpiamos el derecho
                        setPedidoDerecho({
                          productos: [],
                          subtotal: 0,
                          descuento: 0,
                          total: 0,
                        });
                        onOpenChange(false); // Cerramos el diálogo
                      }}
                      className="w-full px-4 py-2 bg-[#727D73] text-white rounded hover:bg-[#727D73]/90"
                    >
                      Cobrar Cuenta Separada
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 p-4 border-t border-[#AAB99A]">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 border border-[#727D73] text-[#727D73] rounded hover:bg-[#D0DDD0]"
            >
              Cerrar
            </button>
          </div>

          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#AAB99A] focus:ring-offset-2"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </button>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default DividirMesaDialog;
