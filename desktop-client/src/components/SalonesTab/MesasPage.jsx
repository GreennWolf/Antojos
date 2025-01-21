import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { getMesaById, updateMesa } from "../../services/mesasService";
import { getSubCategorias } from "../../services/subCategoriasService";
import { getProductos } from "../../services/productosService";
import { getCategorias } from "../../services/categoriasService";
import { toast } from "react-toastify";

export const MesasPage = () => {
  const { mesaId } = useParams();
  const navigate = useNavigate();
  const STORAGE_KEY = `mesa_pedido_${mesaId}`;

  // Estados principales
  const [mesa, setMesa] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para categorías y productos
  const [categorias, setCategorias] = useState([]);
  const [subCategorias, setSubCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [subCategoriaActiva, setSubCategoriaActiva] = useState(null);
  const [currentAction, setCurrentAction] = useState(null); // 'add' o 'remove'

  // Estado para el pedido actual
  const [pedidoActual, setPedidoActual] = useState(() => {
    try {
      const savedPedido = localStorage.getItem(STORAGE_KEY);
      return savedPedido
        ? JSON.parse(savedPedido)
        : {
            productos: [],
            subtotal: 0,
            descuento: 0,
            total: 0,
          };
    } catch (error) {
      console.error("Error al cargar pedido del localStorage:", error);
      return {
        productos: [],
        subtotal: 0,
        descuento: 0,
        total: 0,
      };
    }
  });

  // Estados para modales e ingredientes
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [isRemoveIngredientModalOpen, setIsRemoveIngredientModalOpen] = useState(false);
  const [isSelectCantidadModalOpen, setIsSelectCantidadModalOpen] = useState(false);
  const [isDescuentoModalOpen, setIsDescuentoModalOpen] = useState(false);
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState([]);
  const [selectedIngredientToAdd, setSelectedIngredientToAdd] = useState(null);
  const [selectedCantidadToAdd, setSelectedCantidadToAdd] = useState(1);
  const [descuentoTemp, setDescuentoTemp] = useState(0);
  useEffect(() => {
    const handleFocus = (e) => {
      const dialogElement = document.querySelector('[role="dialog"][aria-hidden="true"]');
      if (dialogElement?.contains(e.target)) {
        e.target.setAttribute('tabindex', '-1');
        e.target.blur();
        dialogElement.focus();
      }
    };

    document.addEventListener('focus', handleFocus, true);
    return () => document.removeEventListener('focus', handleFocus, true);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidoActual));
    } catch (error) {
      console.error("Error al guardar pedido en localStorage:", error);
      toast.error("Error al guardar el pedido");
    }
  }, [pedidoActual, mesaId]);

  useEffect(() => {
    try {
      const userStored = localStorage.getItem("user");
      if (userStored) {
        setCurrentUser(JSON.parse(userStored));
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      toast.error("Error al cargar información del usuario");
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [mesaId]);

  useEffect(() => {
    if (subCategoriaActiva) {
      const subCategoria = subCategorias.find(
        (sc) => sc._id === subCategoriaActiva
      );
      if (subCategoria) {
        setSubCategoriaActiva(subCategoria._id);
      }
    }
  }, [subCategoriaActiva, subCategorias]);

  useEffect(() => {
    const primeraSubCategoria = subCategorias.find(
      (sc) => sc.categoria._id === categoriaActiva
    );

    if (primeraSubCategoria) {
      setSubCategoriaActiva(primeraSubCategoria._id);
    }
  }, [categoriaActiva]);

  const obtenerIngredientesProducto = (producto) => {
    if (!producto?.ingredientes) return [];
    return producto.ingredientes.map((ing) => ({
      ...ing.ingrediente,
      cantidadBase: ing.cantidad,
      unidad: ing.unidad,
    }));
  };

  const calcularTotal = (productos, descuentoActual = 0) => {
    const subtotalConIngredientes = productos.reduce((total, p) => {
      const precioBase = (p.precio || 0) * p.cantidad;
      
      const precioIngredientes = p.ingredientes?.reduce((sum, ing) => {
        if (ing.cantidadQuitada) return sum;
        
        if (ing.cantidadAgregada) {
          return sum + ((ing.ingrediente.precio || 0) * ing.cantidadAgregada);
        }
        
        return sum;
      }, 0) || 0;
  
      return total + precioBase + precioIngredientes;
    }, 0);
  
    const descuentoCalculado = (subtotalConIngredientes * (descuentoActual / 100)) || 0;
  
    return {
      subtotal: subtotalConIngredientes,
      descuento: descuentoActual,
      total: subtotalConIngredientes - descuentoCalculado
    };
  };

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      const [mesaData, categoriasData, subCategoriasData, productosData] =
        await Promise.all([
          getMesaById(mesaId),
          getCategorias(),
          getSubCategorias(),
          getProductos(),
        ]);

      if (!mesaData) throw new Error("No se encontró la mesa");

      setMesa(mesaData);

      const categoriasActivas = categoriasData.filter(
        (cat) => cat.active && cat.ingrediente === false
      );
      setCategorias(categoriasActivas);

      const subCategoriasActivas = subCategoriasData.filter(
        (subcat) => subcat.active
      );
      setSubCategorias(subCategoriasActivas);
      setProductos(productosData.filter((prod) => prod.active));

      if (categoriasActivas.length > 0) {
        setCategoriaActiva(categoriasActivas[0]._id);
        const primeraSubCategoria = subCategoriasActivas.find(
          (sc) => sc.categoria._id === categoriasActivas[0]._id
        );

        if (primeraSubCategoria) {
          setSubCategoriaActiva(primeraSubCategoria._id);
        }
      }

      if (currentUser) {
        const mesaActualizada = {
          ...mesaData,
          camarero: currentUser.id,
          nombreCamarero: currentUser.nombre,
        };
        await updateMesa(mesaId, mesaActualizada);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setIsLoading(false);
    }
  };
  const handleAddProducto = (producto) => {
    if (!producto) return;

    setPedidoActual((prev) => {
      const ingredientesIniciales =
        producto.ingredientes?.map((ing) => ({
          ingrediente: ing.ingrediente,
          cantidad: ing.cantidad,
          cantidadAgregada: 0,
          cantidadQuitada: 0,
          porDefecto: true,
          unidad: ing.unidad,
        })) || [];

      const nuevoProducto = {
        ...producto,
        cantidad: 1,
        uid: Date.now(),
        ingredientes: ingredientesIniciales,
      };

      const productoIgualIndex = prev.productos.findIndex(
        (p) =>
          p.nombre === producto.nombre &&
          sonIngredientesIguales(p.ingredientes, nuevoProducto.ingredientes)
      );

      if (productoIgualIndex !== -1) {
        const nuevosProductos = prev.productos.map((p, index) =>
          index === productoIgualIndex ? { ...p, cantidad: p.cantidad + 1 } : p
        );
        const totales = calcularTotal(nuevosProductos, prev.descuento);
        return {
          productos: nuevosProductos,
          ...totales,
        };
      }

      const nuevosProductos = [...prev.productos, nuevoProducto];
      const totales = calcularTotal(nuevosProductos, prev.descuento);
      return {
        productos: nuevosProductos,
        ...totales,
      };
    });
  };

  const handleAgregarIngrediente = (producto) => {
    if (!producto) return;
    setSelectedProduct(producto);
    setIsIngredientModalOpen(true);
    setCurrentAction("add");
  };

  const handleConfirmAgregarIngrediente = (cantidad, ingrediente) => {
    if (!selectedProduct || !ingrediente || cantidad < 1) return;

    setPedidoActual((prev) => {
      const nuevosProductos = prev.productos.map((p) => {
        if (p.uid !== selectedProduct.uid) return p;

        let nuevosIngredientes = [...p.ingredientes];
        const ingredienteExistente = nuevosIngredientes.find(
          (ing) => ing.ingrediente._id === ingrediente._id
        );

        if (ingredienteExistente) {
          if (ingredienteExistente.cantidadQuitada > 0) {
            nuevosIngredientes = nuevosIngredientes
              .map((ing) => {
                if (ing.ingrediente._id !== ingrediente._id) return ing;
                return {
                  ...ing,
                  cantidadQuitada: ing.cantidadQuitada - cantidad,
                };
              })
              .filter(
                (ing) =>
                  ing.cantidadQuitada > 0 ||
                  ing.cantidadAgregada > 0 ||
                  ing.porDefecto
              );
          } else {
            nuevosIngredientes = nuevosIngredientes.map((ing) => {
              if (ing.ingrediente._id !== ingrediente._id) return ing;
              return {
                ...ing,
                cantidadAgregada: (ing.cantidadAgregada || 0) + cantidad,
              };
            });
          }
        } else {
          nuevosIngredientes.push({
            ingrediente: ingrediente,
            cantidad: 0,
            cantidadAgregada: cantidad,
            cantidadQuitada: 0,
            porDefecto: false,
            unidad: ingrediente.unidad,
          });
        }

        return {
          ...p,
          ingredientes: nuevosIngredientes,
        };
      });

      const totales = calcularTotal(nuevosProductos, prev.descuento);
      return {
        productos: nuevosProductos,
        ...totales,
      };
    });

    setIsSelectCantidadModalOpen(false);
    setIsIngredientModalOpen(false);
    setSelectedIngredientToAdd(null);
  };

  const handleQuitarIngrediente = (producto, ingredienteId, cantidad = 1) => {
    if (!producto || !ingredienteId) return;

    setPedidoActual((prev) => {
      const nuevosProductos = prev.productos.map((p) => {
        if (p.uid !== producto.uid) return p;

        let nuevosIngredientes = [...p.ingredientes];
        const ingredienteExistente = nuevosIngredientes.find(
          (ing) =>
            ing.ingrediente._id === ingredienteId && ing.cantidadAgregada > 0
        );

        if (ingredienteExistente) {
          nuevosIngredientes = nuevosIngredientes
            .map((ing) => {
              if (ing.ingrediente._id !== ingredienteId) return ing;
              return {
                ...ing,
                cantidadAgregada: ing.cantidadAgregada - cantidad,
              };
            })
            .filter((ing) => ing.cantidadAgregada > 0 || ing.porDefecto);
        } else {
          nuevosIngredientes = nuevosIngredientes.map((ing) => {
            if (ing.ingrediente._id !== ingredienteId) return ing;
            return {
              ...ing,
              cantidadQuitada: (ing.cantidadQuitada || 0) + cantidad,
            };
          });
        }

        return {
          ...p,
          ingredientes: nuevosIngredientes,
        };
      });

      const totales = calcularTotal(nuevosProductos, prev.descuento);
      return {
        productos: nuevosProductos,
        ...totales,
      };
    });

    setIsSelectCantidadModalOpen(false);
  };
  const handleUpdateCantidad = (uid, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;

    setPedidoActual((prev) => {
      const nuevosProductos = prev.productos.map((p) =>
        p.uid === uid ? { ...p, cantidad: nuevaCantidad } : p
      );
      const totales = calcularTotal(nuevosProductos, prev.descuento);
      return {
        productos: nuevosProductos,
        ...totales,
      };
    });
  };

  const handleEliminarProducto = (uid) => {
    setPedidoActual((prev) => {
      const nuevosProductos = prev.productos.filter((p) => p.uid !== uid);
      const totales = calcularTotal(nuevosProductos, prev.descuento);
      return {
        productos: nuevosProductos,
        ...totales,
      };
    });
  };

  const handleAplicarDescuento = () => {
    setPedidoActual((prev) => {
      const totales = calcularTotal(prev.productos, descuentoTemp);
      return {
        ...prev,
        ...totales,
      };
    });
    setIsDescuentoModalOpen(false);
  };

  const sonIngredientesIguales = (ingredientes1, ingredientes2) => {
    if (!Array.isArray(ingredientes1) || !Array.isArray(ingredientes2))
      return false;
    if (ingredientes1.length !== ingredientes2.length) return false;

    const ingredientesSorted1 = [...ingredientes1].sort(
      (a, b) =>
        a?.ingrediente?._id?.localeCompare(b?.ingrediente?._id || "") || 0
    );
    const ingredientesSorted2 = [...ingredientes2].sort(
      (a, b) =>
        a?.ingrediente?._id?.localeCompare(b?.ingrediente?._id || "") || 0
    );

    return ingredientesSorted1.every((ing, index) => {
      const ing2 = ingredientesSorted2[index];
      if (!ing2) return false;

      const cantidadNeta1 =
        (ing.cantidad || 0) +
        (ing.cantidadAgregada || 0) -
        (ing.cantidadQuitada || 0);
      const cantidadNeta2 =
        (ing2.cantidad || 0) +
        (ing2.cantidadAgregada || 0) -
        (ing2.cantidadQuitada || 0);

      return (
        ing?.ingrediente?._id === ing2?.ingrediente?._id &&
        ing?.porDefecto === ing2?.porDefecto &&
        cantidadNeta1 === cantidadNeta2
      );
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Cargando...
      </div>
    );
  }

  if (!mesa) {
    return (
      <div className="flex items-center justify-center h-screen">
        Mesa no encontrada
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F0D7]">
      {/* Header */}
      <div className="bg-white border-b border-[#AAB99A] p-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="bg-[#727D73] text-white px-2 py-1 rounded hover:bg-[#727D73]/90"
          >
            ←
          </button>
          <h1 className="text-xl text-[#727D73]">Mesa {mesa?.numero}</h1>
        </div>
        <div className="text-[#727D73]">
          Mozo: {currentUser?.nombre || "No asignado"}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex h-[calc(100vh-98px)]">
        {/* Panel izquierdo - Categorías y subcategorías */}
        <div className="w-32 bg-white border-r border-[#AAB99A] flex flex-col">
          {/* Categorías */}
          <div className="overflow-y-auto flex-1">
            {categorias.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setCategoriaActiva(cat._id)}
                className={`w-full text-left px-2 py-1.5 text-sm transition-colors
                  ${
                    categoriaActiva === cat._id
                      ? "bg-[#727D73] text-white"
                      : "text-[#727D73] hover:bg-[#D0DDD0]"
                  }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
          {/* Subcategorías */}
          <div className="border-t border-[#AAB99A] overflow-y-auto flex-1">
            {subCategorias
              .filter((subcat) => subcat.categoria._id === categoriaActiva)
              .map((subcat) => (
                <button
                  key={subcat._id}
                  onClick={() => setSubCategoriaActiva(subcat._id)}
                  className={`w-full text-left px-2 py-1.5 text-sm transition-colors
                    ${
                      subCategoriaActiva === subcat._id
                        ? "bg-[#727D73] text-white"
                        : "text-[#727D73] hover:bg-[#D0DDD0]"
                    }`}
                >
                  {subcat.nombre}
                </button>
              ))}
          </div>
        </div>

        {/* Panel central - Productos */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-8 gap-2">
            {productos
              .filter((prod) => prod.subCategoria._id === subCategoriaActiva)
              .map((prod) => (
                <button
                  key={prod._id}
                  onClick={() => handleAddProducto(prod)}
                  className="p-2 bg-white rounded border border-[#AAB99A] text-[#727D73] 
                 hover:bg-[#D0DDD0] transition-colors text-sm text-center 
                 min-h-[60px] flex flex-col items-center justify-center"
                >
                  <span className="break-words w-full">{prod.nombre}</span>
                </button>
              ))}
          </div>
        </div>

        {/* Panel derecho - Pedido actual */}
        <div className="w-80 bg-white border-l border-[#AAB99A] flex flex-col">
          <div className="p-2 border-b border-[#AAB99A]">
            <h2 className="font-medium text-[#727D73]">Pedido Actual</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {pedidoActual.productos.map((producto) => (
              <ContextMenu key={producto.uid}>
                <ContextMenuTrigger>
                  <div className="mb-2 bg-[#F0F0D7] p-2 rounded">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-[#727D73] font-medium">
                          {producto.nombre}
                        </div>
                        <div className="text-sm text-gray-600">
                          {(
                            (producto.precio || 0) * producto.cantidad
                          ).toLocaleString("es-ES", {
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
                                  + {ing.ingrediente.nombre} x
                                  {ing.cantidadAgregada} (
                                  {(ing.ingrediente.precio || 0).toLocaleString(
                                    "es-ES",
                                    {
                                      style: "currency",
                                      currency: "EUR",
                                    }
                                  )}
                                  {ing.cantidadAgregada > 1
                                    ? ` x ${ing.cantidadAgregada} = ${(
                                        (ing.ingrediente.precio || 0) *
                                        ing.cantidadAgregada
                                      ).toLocaleString("es-ES", {
                                        style: "currency",
                                        currency: "EUR",
                                      })}`
                                    : ""}
                                  )
                                </div>
                              ))}
                            {producto.ingredientes
                              .filter((ing) => (ing.cantidadQuitada || 0) > 0)
                              .map((ing, idx) => (
                                <div
                                  key={`${ing.ingrediente._id}-quitado-${idx}`}
                                  className="text-red-600"
                                >
                                  - {ing.ingrediente.nombre} x
                                  {ing.cantidadQuitada} {ing.unidad}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() =>
                            handleUpdateCantidad(
                              producto.uid,
                              producto.cantidad - 1
                            )
                          }
                          className="bg-[#727D73] text-white w-6 h-6 rounded flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-6 text-center">
                          {producto.cantidad}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateCantidad(
                              producto.uid,
                              producto.cantidad + 1
                            )
                          }
                          className="bg-[#727D73] text-white w-6 h-6 rounded flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </ContextMenuTrigger>

                <ContextMenuContent className="bg-white border border-[#AAB99A] shadow-lg">
                  <ContextMenuItem
                    className="hover:bg-[#D0DDD0] cursor-pointer"
                    onClick={() => handleAgregarIngrediente(producto)}
                  >
                    Agregar Ingrediente
                  </ContextMenuItem>
                  <ContextMenuSeparator className="bg-[#AAB99A]" />
                  <ContextMenuItem
                    className="hover:bg-[#D0DDD0] cursor-pointer"
                    onClick={() => {
                      setSelectedProduct(producto);
                      setSelectedIngredientToAdd(null);
                      setIsRemoveIngredientModalOpen(true);
                    }}
                  >
                    Quitar Ingrediente
                  </ContextMenuItem>
                  <ContextMenuSeparator className="bg-[#AAB99A]" />
                  <ContextMenuItem
                    className="text-red-600 hover:bg-[#D0DDD0] cursor-pointer"
                    onClick={() => handleEliminarProducto(producto.uid)}
                  >
                    Eliminar
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </div>

          <div className="p-2 border-t border-[#AAB99A] bg-[#F0F0D7]">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm text-[#727D73]">
                <span>Subtotal:</span>
                <span>
                  {(pedidoActual.subtotal || 0).toLocaleString("es-ES", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
              </div>
              {pedidoActual.descuento > 0 && (
                <div className="flex justify-between items-center text-sm text-red-600">
                  <span>Descuento ({pedidoActual.descuento}%):</span>
                  <span>
                    -
                    {(
                      pedidoActual.subtotal * (pedidoActual.descuento / 100) ||
                      0
                    ).toLocaleString("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center font-medium text-[#727D73] pt-1 border-t border-[#AAB99A]">
                <span>Total:</span>
                <span>
                  {(pedidoActual.total || 0).toLocaleString("es-ES", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de acciones inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#AAB99A] p-2">
        <div className="flex justify-between">
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-[#727D73] text-white text-sm rounded hover:bg-[#727D73]/90">
              Consultar Mesa
            </button>
            <button className="px-3 py-1.5 bg-[#727D73] text-white text-sm rounded hover:bg-[#727D73]/90">
              Hacer Factura
            </button>
            <button className="px-3 py-1.5 bg-[#727D73] text-white text-sm rounded hover:bg-[#727D73]/90">
              Cerrar Mesa
            </button>
            <button className="px-3 py-1.5 bg-[#727D73] text-white text-sm rounded hover:bg-[#727D73]/90">
              Asignar Cliente
            </button>
            <button className="px-3 py-1.5 bg-[#727D73] text-white text-sm rounded hover:bg-[#727D73]/90">
              Cambiar Mesa
            </button>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-[#727D73] text-white text-sm rounded hover:bg-[#727D73]/90">
              Dividir Mesa
            </button>
            <button
              onClick={() => {
                setDescuentoTemp(pedidoActual.descuento);
                setIsDescuentoModalOpen(true);
              }}
              className="px-3 py-1.5 bg-[#727D73] text-white text-sm rounded hover:bg-[#727D73]/90"
            >
              Descuento
            </button>
            <button className="px-3 py-1.5 bg-[#727D73] text-white text-sm rounded hover:bg-[#727D73]/90">
              Imprimir
            </button>
            <button className="px-3 py-1.5 bg-[#727D73] text-white text-sm rounded hover:bg-[#727D73]/90">
              Juntar Mesa
            </button>
          </div>
        </div>
      </div>
      {/* Modal de ingredientes para agregar */}
      <Dialog 
        open={isIngredientModalOpen}
        onOpenChange={setIsIngredientModalOpen}
      >
        <DialogPortal>
          <DialogOverlay className="bg-black/80" onClick={(e) => e.stopPropagation()} />
          <DialogContent 
            className="bg-[#F0F0D7] border border-[#AAB99A]"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold leading-none tracking-tight text-[#727D73]">
                Agregar ingredientes a {selectedProduct?.nombre}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-4 gap-2 p-4">
              {(selectedProduct
                ? obtenerIngredientesProducto(selectedProduct)
                : []
              )
                .filter((ingrediente) => ingrediente.active)
                .map((ingrediente) => (
                  <button
                    key={ingrediente._id}
                    className="p-2 bg-white rounded border border-[#AAB99A] text-[#727D73] 
                       hover:bg-[#D0DDD0] transition-colors text-sm flex flex-col items-center"
                    onClick={() => {
                      setSelectedIngredientToAdd(ingrediente);
                      setIsIngredientModalOpen(false);
                      setIsSelectCantidadModalOpen(true);
                    }}
                  >
                    <span>{ingrediente.nombre}</span>
                    <span className="text-xs text-gray-500">
                      (
                      {(ingrediente.precio || 0).toLocaleString("es-ES", {
                        style: "currency",
                        currency: "EUR",
                      })}{" "}
                      / {ingrediente.unidad})
                    </span>
                  </button>
                ))}
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* Modal para quitar ingredientes */}
      <Dialog 
        open={isRemoveIngredientModalOpen}
        onOpenChange={setIsRemoveIngredientModalOpen}
      >
        <DialogPortal>
          <DialogOverlay className="bg-black/80" onClick={(e) => e.stopPropagation()} />
          <DialogContent 
            className="bg-[#F0F0D7] border border-[#AAB99A]"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-[#727D73]">
                Quitar ingredientes de {selectedProduct?.nombre}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-4 gap-2 p-4">
              {selectedProduct?.ingredientes?.map((ing) => (
                <button
                  key={ing.ingrediente._id}
                  className="p-2 bg-white rounded border border-[#AAB99A] text-[#727D73] 
                    hover:bg-[#D0DDD0] transition-colors text-sm flex flex-col items-center gap-1"
                  onClick={() => {
                    setSelectedIngredientToAdd(ing.ingrediente);
                    setCurrentAction("remove");
                    setIsSelectCantidadModalOpen(true);
                    setIsRemoveIngredientModalOpen(false);
                  }}
                >
                  <span>{ing.ingrediente.nombre}</span>
                  <span className="text-xs text-gray-500">({ing.unidad})</span>
                </button>
              ))}
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {/* Modal de selección de cantidad */}
      <Dialog 
        open={isSelectCantidadModalOpen}
        onOpenChange={(open) => {
          setIsSelectCantidadModalOpen(open);
          if (!open) {
            setSelectedIngredientToAdd(null);
            setCurrentAction(null);
          }
        }}
      >
        <DialogPortal>
          <DialogOverlay className="bg-black/80" onClick={(e) => e.stopPropagation()} />
          <DialogContent 
            className="bg-[#F0F0D7] border border-[#AAB99A]"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold leading-none tracking-tight text-[#727D73]">
                {currentAction === "add" ? "Agregar" : "Quitar"}: ¿Cuántos{" "}
                {selectedIngredientToAdd?.nombre || "ingredientes"}?
              </DialogTitle>
            </DialogHeader>

            <div className="p-4 relative z-50">
              <div className="text-center mb-4">
                <div>Producto: {selectedProduct?.nombre}</div>
                <div className="text-sm text-gray-600">
                  {selectedIngredientToAdd?.nombre}:{" "}
                  {currentAction === "add" ? "Agregar cantidad" : "Quitar cantidad"}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 10 }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => {
                      if (currentAction === "add") {
                        handleConfirmAgregarIngrediente(i + 1, selectedIngredientToAdd);
                      } else {
                        handleQuitarIngrediente(
                          selectedProduct,
                          selectedIngredientToAdd._id,
                          i + 1
                        );
                      }
                    }}
                    className="p-4 bg-[#727D73] text-white rounded hover:bg-[#727D73]/90 text-lg font-medium relative z-50"
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#AAB99A] focus:ring-offset-2 z-40"
              onClick={() => setIsSelectCantidadModalOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </button>
          </DialogContent>
        </DialogPortal>
      </Dialog>
      {/* Modal de descuento */}
      <Dialog
        open={isDescuentoModalOpen}
        onOpenChange={(open) => {
          setIsDescuentoModalOpen(open);
          if (!open) setDescuentoTemp(pedidoActual.descuento);
        }}
      >
        <DialogPortal>
          <DialogOverlay className="bg-black/80" onClick={(e) => e.stopPropagation()} />
          <DialogContent 
            className="bg-[#F0F0D7] border border-[#AAB99A] max-w-sm"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-[#727D73]">
                Aplicar Descuento
              </DialogTitle>
            </DialogHeader>

            <div className="p-4">
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm text-[#727D73]">
                    Porcentaje de descuento:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={descuentoTemp}
                      onChange={(e) => {
                        const value = Math.min(100, Math.max(0, Number(e.target.value)));
                        setDescuentoTemp(value);
                      }}
                      className="w-full px-3 py-2 border border-[#AAB99A] rounded text-[#727D73]"
                    />
                    <span className="text-[#727D73]">%</span>
                  </div>
                </div>

                {pedidoActual.subtotal > 0 && (
                  <div className="text-sm text-[#727D73] space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>
                        {pedidoActual.subtotal.toLocaleString("es-ES", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Descuento ({descuentoTemp}%):</span>
                      <span>
                        -
                        {(pedidoActual.subtotal * (descuentoTemp / 100) || 0).toLocaleString(
                          "es-ES",
                          {
                            style: "currency",
                            currency: "EUR",
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium pt-1 border-t border-[#AAB99A]">
                      <span>Total con descuento:</span>
                      <span>
                        {(
                          pedidoActual.subtotal * (1 - descuentoTemp / 100)
                        ).toLocaleString("es-ES", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => setIsDescuentoModalOpen(false)}
                    className="px-4 py-2 border border-[#727D73] text-[#727D73] rounded hover:bg-[#D0DDD0]"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAplicarDescuento}
                    className="px-4 py-2 bg-[#727D73] text-white rounded hover:bg-[#727D73]/90"
                  >
                    Aplicar Descuento
                  </button>
                </div>
              </div>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
};

export default MesasPage;