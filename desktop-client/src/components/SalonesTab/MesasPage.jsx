import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from "@/components/ui/dialog";
import { Card } from '@/components/ui/card';
import { getMesaById, updateMesa } from '../../services/mesasService';
import { getSubCategorias } from '../../services/subCategoriasService';
import { getProductos } from '../../services/productosService';
import { getCategorias } from '../../services/categoriasService';
import { toast } from 'react-toastify';

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
  
  // Estado para el pedido actual
  const [pedidoActual, setPedidoActual] = useState(() => {
    try {
      const savedPedido = localStorage.getItem(STORAGE_KEY);
      return savedPedido ? JSON.parse(savedPedido) : {
        productos: [],
        subtotal: 0,
        descuento: 0,
        total: 0
      };
    } catch (error) {
      console.error('Error al cargar pedido del localStorage:', error);
      return {
        productos: [],
        subtotal: 0,
        descuento: 0,
        total: 0
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
  const [ingredientesPermitidosActual, setIngredientesPermitidosActual] = useState([]);
  const [selectedIngredientToAdd, setSelectedIngredientToAdd] = useState(null);
  const [descuentoTemp, setDescuentoTemp] = useState(0);

  // Funciones auxiliares
  const sonIngredientesIguales = (ingredientes1, ingredientes2) => {
    if (!Array.isArray(ingredientes1) || !Array.isArray(ingredientes2)) return false;
    if (ingredientes1.length !== ingredientes2.length) return false;

    const ingredientesSorted1 = [...ingredientes1].sort((a, b) => 
      a?.ingrediente?._id?.localeCompare(b?.ingrediente?._id || '') || 0
    );
    const ingredientesSorted2 = [...ingredientes2].sort((a, b) => 
      a?.ingrediente?._id?.localeCompare(b?.ingrediente?._id || '') || 0
    );

    return ingredientesSorted1.every((ing, index) => {
      const ing2 = ingredientesSorted2[index];
      return (
        ing?.ingrediente?._id === ing2?.ingrediente?._id &&
        (ing?.cantidad || 1) === (ing2?.cantidad || 1) &&
        (ing?.quitado || false) === (ing2?.quitado || false)
      );
    });
  };

  const obtenerIngredientesPermitidos = (producto) => {
    if (!producto?.subCategoria?._id) return [];
    const subCategoria = subCategorias.find(sc => sc._id === producto.subCategoria._id);
    return subCategoria?.ingredientesPermitidos || [];
  };

  const calcularTotal = (productos, descuentoActual = 0) => {
    // Calculamos el total incluyendo productos e ingredientes
    const subtotalConIngredientes = productos.reduce((total, p) => {
      const precioBase = (p.precio || 0) * p.cantidad;
      const precioIngredientes = (p.ingredientes || []).reduce((sum, ing) => {
        if (!ing?.ingrediente?.precio || ing.quitado) return sum;
        return sum + ((ing.ingrediente.precio || 0) * (ing.cantidad || 1));
      }, 0);
      return total + (precioBase + precioIngredientes);
    }, 0);

    // Calculamos el descuento
    const descuentoCalculado = (subtotalConIngredientes * (descuentoActual / 100)) || 0;

    return {
      subtotal: subtotalConIngredientes,
      descuento: descuentoActual,
      total: subtotalConIngredientes - descuentoCalculado
    };
  };

  // Efectos
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidoActual));
    } catch (error) {
      console.error('Error al guardar pedido en localStorage:', error);
      toast.error('Error al guardar el pedido');
    }
  }, [pedidoActual, mesaId]);

  useEffect(() => {
    try {
      const userStored = localStorage.getItem('user');
      if (userStored) {
        setCurrentUser(JSON.parse(userStored));
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      toast.error('Error al cargar información del usuario');
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [mesaId]);

  useEffect(() => {
    if (subCategoriaActiva) {
      const subCategoria = subCategorias.find(sc => sc._id === subCategoriaActiva);
      if (subCategoria) {
        setSubCategoriaActiva(subCategoria._id);
      }
    }
  }, [subCategoriaActiva, subCategorias]);

  useEffect(() => {
    const primeraSubCategoria = subCategorias.find(
      sc => sc.categoria._id === categoriaActiva
    );
    
    if (primeraSubCategoria) {
      setSubCategoriaActiva(primeraSubCategoria._id);
    }
  }, [categoriaActiva]);

// Funciones de manejo
const cargarDatos = async () => {
  try {
    setIsLoading(true);
    const [mesaData, categoriasData, subCategoriasData, productosData] = await Promise.all([
      getMesaById(mesaId),
      getCategorias(),
      getSubCategorias(),
      getProductos()
    ]);

    if (!mesaData) throw new Error('No se encontró la mesa');

    setMesa(mesaData);
    
    const categoriasActivas = categoriasData.filter(cat => 
      cat.active && cat.ingrediente === false
    );
    setCategorias(categoriasActivas);
    
    const subCategoriasActivas = subCategoriasData.filter(subcat => subcat.active);
    setSubCategorias(subCategoriasActivas);
    
    const productosActivos = productosData.filter(prod => prod.active);
    setProductos(productosActivos);

    if (categoriasActivas.length > 0) {
      setCategoriaActiva(categoriasActivas[0]._id);
      const primeraSubCategoria = subCategoriasActivas.find(
        sc => sc.categoria._id === categoriasActivas[0]._id
      );
      
      if (primeraSubCategoria) {
        setSubCategoriaActiva(primeraSubCategoria._id);
      }
    }

    if (currentUser) {
      const mesaActualizada = {
        ...mesaData,
        camarero: currentUser.id,
        nombreCamarero: currentUser.nombre
      };
      await updateMesa(mesaId, mesaActualizada);
    }
  } catch (error) {
    console.error('Error al cargar datos:', error);
    toast.error('Error al cargar los datos de la mesa');
  } finally {
    setIsLoading(false);
  }
};

const handleAddProducto = (producto) => {
  if (!producto) return;

  setPedidoActual(prev => {
    const ingredientesPorDefecto = producto.ingredientes?.map(ing => ({
      ingrediente: ing,
      cantidad: ing.cantidad || 1,
      porDefecto: true
    })) || [];

    const nuevoProducto = { 
      ...producto, 
      cantidad: 1, 
      uid: Date.now(),
      ingredientes: ingredientesPorDefecto
    };

    const productoIgualIndex = prev.productos.findIndex(p => 
      p.nombre === producto.nombre && 
      sonIngredientesIguales(p.ingredientes, nuevoProducto.ingredientes)
    );

    if (productoIgualIndex !== -1) {
      const nuevosProductos = prev.productos.map((p, index) => 
        index === productoIgualIndex 
          ? { ...p, cantidad: p.cantidad + 1 }
          : p
      );
      const totales = calcularTotal(nuevosProductos, prev.descuento);
      return {
        productos: nuevosProductos,
        ...totales
      };
    }

    const nuevosProductos = [...prev.productos, nuevoProducto];
    const totales = calcularTotal(nuevosProductos, prev.descuento);
    return {
      productos: nuevosProductos,
      ...totales
    };
  });
};

const handleUpdateCantidad = (uid, nuevaCantidad) => {
  if (nuevaCantidad < 1) return;
  
  setPedidoActual(prev => {
    const nuevosProductos = prev.productos.map(p => 
      p.uid === uid ? { ...p, cantidad: nuevaCantidad } : p
    );
    const totales = calcularTotal(nuevosProductos, prev.descuento);
    return {
      productos: nuevosProductos,
      ...totales
    };
  });
};

const handleEliminarProducto = (uid) => {
  setPedidoActual(prev => {
    const nuevosProductos = prev.productos.filter(p => p.uid !== uid);
    const totales = calcularTotal(nuevosProductos, prev.descuento);
    return {
      productos: nuevosProductos,
      ...totales
    };
  });
};

const handleAgregarIngrediente = (producto) => {
  if (!producto) return;

  const ingredientesPermitidos = obtenerIngredientesPermitidos(producto);
  setIngredientesDisponibles(ingredientesPermitidos);
  setIngredientesPermitidosActual(ingredientesPermitidos);

  setSelectedProduct(producto);
  
  if (producto.cantidad > 1) {
    setIsSelectCantidadModalOpen(true);
  } else {
    setIsIngredientModalOpen(true);
  }
};

const handleConfirmAgregarIngrediente = (cantidadSeleccionada, ingrediente) => {
  if (!selectedProduct || !ingrediente || cantidadSeleccionada < 1) return;

  setPedidoActual(prev => {
    const nuevosProductos = [...prev.productos];
    const indexProducto = nuevosProductos.findIndex(p => p.uid === selectedProduct.uid);
    
    if (indexProducto === -1) return prev;

    if (cantidadSeleccionada < selectedProduct.cantidad) {
      const productoConIngrediente = {
        ...selectedProduct,
        cantidad: cantidadSeleccionada,
        ingredientes: [
          ...selectedProduct.ingredientes || [],
          { ingrediente, cantidad: 1, porDefecto: false }
        ],
        uid: Date.now()
      };

      const productoSinIngrediente = {
        ...selectedProduct,
        cantidad: selectedProduct.cantidad - cantidadSeleccionada,
        uid: Date.now() + 1
      };

      nuevosProductos.splice(indexProducto, 1, productoConIngrediente, productoSinIngrediente);
    } else {
      nuevosProductos[indexProducto] = {
        ...selectedProduct,
        ingredientes: [
          ...selectedProduct.ingredientes || [],
          { ingrediente, cantidad: 1, porDefecto: false }
        ]
      };
    }

    const totales = calcularTotal(nuevosProductos, prev.descuento);
    return {
      productos: nuevosProductos,
      ...totales
    };
  });

  setIsSelectCantidadModalOpen(false);
  setIsIngredientModalOpen(false);
};

const handleQuitarIngrediente = (producto, ingredienteId) => {
  if (!producto || !ingredienteId) return;

  const ingredienteExistente = producto.ingredientes?.find(
    ing => ing.ingrediente._id === ingredienteId
  );

  setPedidoActual(prev => {
    const nuevosProductos = prev.productos.map(p => {
      if (p.uid === producto.uid) {
        let nuevosIngredientes = p.ingredientes || [];
        
        if (ingredienteExistente) {
          nuevosIngredientes = nuevosIngredientes.map(ing => {
            if (ing.ingrediente._id === ingredienteId) {
              return {
                ...ing,
                quitado: true,
                cantidadOriginal: ing.cantidad
              };
            }
            return ing;
          });
        } else {
          const ingredientePermitido = obtenerIngredientesPermitidos(producto).find(i => i._id === ingredienteId);
          if (!ingredientePermitido) return p;

          nuevosIngredientes = [
            ...nuevosIngredientes,
            {
              ingrediente: ingredientePermitido,
              quitado: true,
              cantidadOriginal: 1
            }
          ];
        }

        return {
          ...p,
          ingredientes: nuevosIngredientes
        };
      }
      return p;
    });

    const totales = calcularTotal(nuevosProductos, prev.descuento);
    return {
      productos: nuevosProductos,
      ...totales
    };
  });
  
  setIsRemoveIngredientModalOpen(false);
};

const handleAplicarDescuento = () => {
  setPedidoActual(prev => {
    const totales = calcularTotal(prev.productos, descuentoTemp);
    return {
      ...prev,
      ...totales
    };
  });
  setIsDescuentoModalOpen(false);
};

if (isLoading) {
  return <div className="flex items-center justify-center h-screen">Cargando...</div>;
}

if (!mesa) {
  return <div className="flex items-center justify-center h-screen">Mesa no encontrada</div>;
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
      <div className="text-[#727D73]">Mozo: {currentUser?.nombre || 'No asignado'}</div>
    </div>

    {/* Contenido principal */}
    <div className="flex h-[calc(100vh-98px)]">
      {/* Panel izquierdo - Categorías y subcategorías */}
      <div className="w-32 bg-white border-r border-[#AAB99A] flex flex-col">
        {/* Categorías */}
        <div className="overflow-y-auto flex-1">
          {categorias.map(cat => (
            <button
              key={cat._id}
              onClick={() => setCategoriaActiva(cat._id)}
              className={`w-full text-left px-2 py-1.5 text-sm transition-colors
                ${categoriaActiva === cat._id
                  ? 'bg-[#727D73] text-white'
                  : 'text-[#727D73] hover:bg-[#D0DDD0]'
                }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
        {/* Subcategorías */}
        <div className="border-t border-[#AAB99A] overflow-y-auto flex-1">
          {subCategorias
            .filter(subcat => subcat.categoria._id === categoriaActiva)
            .map(subcat => (
              <button
                key={subcat._id}
                onClick={() => setSubCategoriaActiva(subcat._id)}
                className={`w-full text-left px-2 py-1.5 text-sm transition-colors
                  ${subCategoriaActiva === subcat._id
                    ? 'bg-[#727D73] text-white'
                    : 'text-[#727D73] hover:bg-[#D0DDD0]'
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
            .filter(prod => prod.subCategoria._id === subCategoriaActiva)
            .map(prod => (
              <button
                key={prod._id}
                onClick={() => handleAddProducto(prod)}
                className="p-2 bg-white rounded border border-[#AAB99A] text-[#727D73] 
                         hover:bg-[#D0DDD0] transition-colors text-sm text-center whitespace-nowrap 
                         overflow-hidden text-ellipsis w-full"
              >
                {prod.nombre}
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
          {pedidoActual.productos.map(producto => (
            <ContextMenu key={producto.uid}>
              <ContextMenuTrigger>
                <div className="mb-2 bg-[#F0F0D7] p-2 rounded">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-[#727D73] font-medium">
                        {producto.nombre}
                      </div>
                      <div className="text-sm text-gray-600">
                        {((producto.precio || 0) * producto.cantidad).toLocaleString('es-ES', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </div>
                      {(producto.ingredientes?.length > 0) && (
                        <div className="text-xs space-y-0.5 mt-1">
                          {/* Ingredientes añadidos */}
                          {producto.ingredientes
                            .filter(ing => !ing.porDefecto && !ing.quitado)
                            .map((ing, idx) => (
                              <div key={`${ing.ingrediente._id}-${idx}`} className="text-green-600">
                                + {ing.ingrediente.nombre} {ing.cantidad > 1 ? `x${ing.cantidad}` : ''}
                                <span className="text-gray-500">
                                  ({(ing.ingrediente.precio || 0).toLocaleString('es-ES', {
                                    style: 'currency',
                                    currency: 'EUR'
                                  })})
                                </span>
                              </div>
                            ))}
                          {/* Ingredientes quitados */}
                          {producto.ingredientes
                            .filter(ing => ing.quitado)
                            .map((ing, idx) => (
                              <div key={`${ing.ingrediente._id}-${idx}`} className="text-red-600">
                                - {ing.ingrediente.nombre}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button 
                        onClick={() => handleUpdateCantidad(producto.uid, producto.cantidad - 1)}
                        className="bg-[#727D73] text-white w-6 h-6 rounded flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-6 text-center">{producto.cantidad}</span>
                      <button 
                        onClick={() => handleUpdateCantidad(producto.uid, producto.cantidad + 1)}
                        className="bg-[#727D73] text-white w-6 h-6 rounded flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </ContextMenuTrigger>

              <ContextMenuContent>
                <ContextMenuItem onClick={() => handleAgregarIngrediente(producto)}>
                  Agregar Ingrediente
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem 
                  onClick={() => {
                    setSelectedProduct(producto);
                    setIsRemoveIngredientModalOpen(true);
                  }}
                >
                  Quitar Ingrediente
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem 
                  className="text-red-600"
                  onClick={() => handleEliminarProducto(producto.uid)}
                >
                  Eliminar
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
          {/* Panel de totales */}
          <div className="p-2 border-t border-[#AAB99A] bg-[#F0F0D7]">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm text-[#727D73]">
                <span>Subtotal:</span>
                <span>
                  {(pedidoActual.subtotal || 0).toLocaleString('es-ES', {
                    style: 'currency',
                    currency: 'EUR'
                  })}
                </span>
              </div>
              {pedidoActual.descuento > 0 && (
                <div className="flex justify-between items-center text-sm text-red-600">
                  <span>Descuento ({pedidoActual.descuento}%):</span>
                  <span>
                    -{((pedidoActual.subtotal * (pedidoActual.descuento / 100)) || 0).toLocaleString('es-ES', {
                      style: 'currency',
                      currency: 'EUR'
                    })}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center font-medium text-[#727D73] pt-1 border-t border-[#AAB99A]">
                <span>Total:</span>
                <span>
                  {(pedidoActual.total || 0).toLocaleString('es-ES', {
                    style: 'currency',
                    currency: 'EUR'
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

      {/* Modal de selección de cantidad */}
      <Dialog 
        open={isSelectCantidadModalOpen} 
        onOpenChange={(open) => {
          setIsSelectCantidadModalOpen(open);
          if (!open) setSelectedIngredientToAdd(null);
        }}
      >
        <DialogContent className="bg-[#F0F0D7] border border-[#AAB99A]">
          <DialogHeader>
            <DialogTitle className="text-[#727D73]">
              ¿A cuántas unidades desea agregar el ingrediente?
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-4">
            <div className="text-center mb-4">
              Cantidad actual: {selectedProduct?.cantidad || 0}
            </div>
            <div className="flex justify-center gap-4">
              {Array.from({ length: selectedProduct?.cantidad || 0 }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handleConfirmAgregarIngrediente(i + 1, selectedIngredientToAdd)}
                  className="px-4 py-2 bg-[#727D73] text-white rounded hover:bg-[#727D73]/90"
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de ingredientes para agregar */}
      <Dialog 
        open={isIngredientModalOpen} 
        onOpenChange={(open) => setIsIngredientModalOpen(open)}
      >
        <DialogContent className="bg-[#F0F0D7] border border-[#AAB99A]">
          <DialogHeader>
            <DialogTitle className="text-[#727D73]">
              Agregar ingredientes a {selectedProduct?.nombre}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-4 gap-2 p-4">
            {(selectedProduct ? obtenerIngredientesPermitidos(selectedProduct) : [])
              .filter(ingrediente => 
                ingrediente.active && 
                !selectedProduct?.ingredientes?.some(
                  ing => ing.ingrediente._id === ingrediente._id && !ing.quitado
                )
              )
              .map(ingrediente => (
                <button
                  key={ingrediente._id}
                  className="p-2 bg-white rounded border border-[#AAB99A] text-[#727D73] 
                           hover:bg-[#D0DDD0] transition-colors text-sm flex flex-col items-center"
                  onClick={() => {
                    if ((selectedProduct?.cantidad || 0) > 1) {
                      setSelectedIngredientToAdd(ingrediente);
                      setIsSelectCantidadModalOpen(true);
                      setIsIngredientModalOpen(false);
                    } else {
                      handleConfirmAgregarIngrediente(1, ingrediente);
                    }
                  }}
                >
                  <span>{ingrediente.nombre}</span>
                  <span className="text-xs text-gray-500">
                    ({(ingrediente.precio || 0).toLocaleString('es-ES', {
                      style: 'currency',
                      currency: 'EUR'
                    })})
                  </span>
                </button>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para quitar ingredientes */}
      <Dialog 
        open={isRemoveIngredientModalOpen} 
        onOpenChange={(open) => setIsRemoveIngredientModalOpen(open)}
      >
        <DialogContent className="bg-[#F0F0D7] border border-[#AAB99A]">
          <DialogHeader>
            <DialogTitle className="text-[#727D73]">
              Quitar ingredientes de {selectedProduct?.nombre}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-4 gap-2 p-4">
            {(selectedProduct ? obtenerIngredientesPermitidos(selectedProduct) : [])
              .filter(ingrediente => 
                ingrediente.active && 
                !selectedProduct?.ingredientes?.some(
                  ing => ing.ingrediente._id === ingrediente._id && ing.quitado
                )
              )
              .map(ingrediente => {
                const isIngredienteEnProducto = selectedProduct?.ingredientes?.some(
                  ing => ing.ingrediente._id === ingrediente._id
                ) || false;
                
                return (
                  <button
                    key={ingrediente._id}
                    className={`p-2 rounded border text-sm flex flex-col items-center
                      ${isIngredienteEnProducto 
                        ? 'bg-[#D0DDD0] border-[#AAB99A] text-[#727D73]' 
                        : 'bg-white border-[#AAB99A] text-[#727D73]'
                      } hover:bg-[#D0DDD0] transition-colors`}
                    onClick={() => handleQuitarIngrediente(selectedProduct, ingrediente._id)}
                  >
                    <span>{ingrediente.nombre}</span>
                    {isIngredienteEnProducto && (
                      <span className="text-xs text-gray-500">(En producto)</span>
                    )}
                  </button>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de descuento */}
      <Dialog 
        open={isDescuentoModalOpen} 
        onOpenChange={(open) => {
          setIsDescuentoModalOpen(open);
          if (!open) setDescuentoTemp(pedidoActual.descuento);
        }}
      >
        <DialogContent className="bg-[#F0F0D7] border border-[#AAB99A] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[#727D73]">
              Aplicar Descuento
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-4">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <label className="text-sm text-[#727D73]">Porcentaje de descuento:</label>
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
                      {pedidoActual.subtotal.toLocaleString('es-ES', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Descuento ({descuentoTemp}%):</span>
                    <span>
                      -{((pedidoActual.subtotal * (descuentoTemp / 100)) || 0).toLocaleString('es-ES', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium pt-1 border-t border-[#AAB99A]">
                    <span>Total con descuento:</span>
                    <span>
                      {(pedidoActual.subtotal * (1 - descuentoTemp / 100)).toLocaleString('es-ES', {
                        style: 'currency',
                        currency: 'EUR'
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
      </Dialog>
    </div>
  );
};

export default MesasPage;
