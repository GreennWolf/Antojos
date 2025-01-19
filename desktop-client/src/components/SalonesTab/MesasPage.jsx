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
  const [selectedCantidadToAdd, setSelectedCantidadToAdd] = useState(1);
  const [descuentoTemp, setDescuentoTemp] = useState(0);

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

  const obtenerIngredientesPermitidos = (producto) => {
    if (!producto?.subCategoria?._id) return [];
    const subCategoria = subCategorias.find(sc => sc._id === producto.subCategoria._id);
    return subCategoria?.ingredientesPermitidos || [];
  };

  // Función para verificar si un ingrediente es por defecto en el producto
  const esIngredientePorDefecto = (producto, ingredienteId) => {
    return producto.ingredientes.some(
      ing => ing.porDefecto && ing.ingrediente._id === ingredienteId
    );
  };

  // Función para obtener el balance actual de un ingrediente
  const obtenerBalanceIngrediente = (producto, ingredienteId) => {
    const ingrediente = producto.ingredientes.find(
      ing => ing.ingrediente._id === ingredienteId
    );
  
    if (!ingrediente) return 0;
  
    const cantidadBase = ingrediente.porDefecto ? ingrediente.cantidad : 0;
    const cantidadAgregada = ingrediente.cantidadAgregada || 0;
    const cantidadQuitada = ingrediente.cantidadQuitada || 0;
  
    return cantidadBase + cantidadAgregada - cantidadQuitada;
  };

  const calcularTotal = (productos, descuentoActual = 0) => {
    const subtotalConIngredientes = productos.reduce((total, p) => {
      const precioBase = (p.precio || 0) * p.cantidad;
      const precioIngredientes = (p.ingredientes || []).reduce((sum, ing) => {
        if (ing.porDefecto) return sum;
        const cantidadNeta = (ing.cantidadAgregada || 0) - (ing.cantidadQuitada || 0);
        if (cantidadNeta <= 0) return sum;
        return sum + ((ing.ingrediente.precio || 0) * cantidadNeta);
      }, 0);
      return total + (precioBase + precioIngredientes);
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
      setProductos(productosData.filter(prod => prod.active));

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
      toast.error('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProducto = (producto) => {
    if (!producto) return;

    setPedidoActual(prev => {
      const ingredientesPorDefecto = producto.ingredientes?.map(ing => ({
        ingrediente: ing.ingrediente,
        cantidad: ing.cantidad,
        porDefecto: true,
        cantidadAgregada: 0,
        cantidadQuitada: 0,
        unidad: ing.unidad
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

  const handleConfirmAgregarIngrediente = (cantidad, ingrediente) => {
    if (!selectedProduct || !ingrediente || cantidad < 1) return;
  
    setPedidoActual(prev => {
      const nuevosProductos = prev.productos.map(p => {
        if (p.uid !== selectedProduct.uid) return p;
  
        const ingredienteExistente = p.ingredientes.find(
          ing => ing.ingrediente._id === ingrediente._id
        );
  
        let nuevosIngredientes;
        if (ingredienteExistente) {
          // Si el ingrediente existe, actualizamos sus cantidades
          nuevosIngredientes = p.ingredientes.map(ing => {
            if (ing.ingrediente._id !== ingrediente._id) return ing;
  
            // Si es un ingrediente por defecto que fue quitado
            if (ing.porDefecto && ing.cantidadQuitada > 0) {
              return {
                ...ing,
                cantidadQuitada: Math.max(0, ing.cantidadQuitada - cantidad)
              };
            }
  
            // Si no es por defecto, solo sumamos a la cantidad agregada
            return {
              ...ing,
              cantidadAgregada: (ing.cantidadAgregada || 0) + cantidad
            };
          });
        } else {
          // Si el ingrediente no existe, lo añadimos como nuevo
          nuevosIngredientes = [
            ...p.ingredientes,
            {
              ingrediente: ingrediente,
              cantidad: 0,
              cantidadAgregada: cantidad,
              cantidadQuitada: 0,
              porDefecto: false,
              unidad: ingrediente.unidad || 'unidad'
            }
          ];
        }
  
        return {
          ...p,
          ingredientes: nuevosIngredientes
        };
      });
  
      const totales = calcularTotal(nuevosProductos, prev.descuento);
      return {
        productos: nuevosProductos,
        ...totales
      };
    });
  
    setIsSelectCantidadModalOpen(false);
    setIsIngredientModalOpen(false);
    setSelectedIngredientToAdd(null);
    setSelectedCantidadToAdd(1);
  };

  const handleQuitarIngrediente = (producto, ingredienteId, cantidad = 1) => {
    if (!producto || !ingredienteId) return;

    setPedidoActual(prev => {
      const nuevosProductos = prev.productos.map(p => {
        if (p.uid !== producto.uid) return p;

        const nuevosIngredientes = p.ingredientes.map(ing => {
          if (ing.ingrediente._id !== ingredienteId) return ing;

          // Si es un ingrediente por defecto
          if (ing.porDefecto) {
            return {
              ...ing,
              cantidadQuitada: (ing.cantidadQuitada || 0) + cantidad
            };
          }
          
          // Si es un ingrediente agregado posteriormente
          const cantidadAgregadaActual = ing.cantidadAgregada || 0;
          const cantidadQuitadaActual = ing.cantidadQuitada || 0;
          const nuevaCantidadQuitada = cantidadQuitadaActual + cantidad;

          // Si se han quitado todos los ingredientes agregados, eliminamos el registro
          if (nuevaCantidadQuitada >= cantidadAgregadaActual) {
            return null;
          }

          return {
            ...ing,
            cantidadQuitada: nuevaCantidadQuitada
          };
        }).filter(Boolean); // Eliminamos los registros null

        return {
          ...p,
          ingredientes: nuevosIngredientes
        };
      });

      const totales = calcularTotal(nuevosProductos, prev.descuento);
      return {
        productos: nuevosProductos,
        ...totales
      };
    });
    
    setIsRemoveIngredientModalOpen(false);
  };

  const handleAgregarIngrediente = (producto) => {
    if (!producto) return;
    
    setSelectedProduct(producto);
    const ingredientesPermitidos = obtenerIngredientesPermitidos(producto);
    
    // Filtramos los ingredientes que podemos agregar
    const ingredientesDisponibles = ingredientesPermitidos.filter(ingrediente => {
      if (!ingrediente.active) return false;
  
      const ingredienteExistente = producto.ingredientes?.find(
        ing => ing.ingrediente._id === ingrediente._id
      );
  
      // Si no existe o no es por defecto, siempre lo podemos agregar
      if (!ingredienteExistente || !ingredienteExistente.porDefecto) return true;
  
      // Si es por defecto, solo lo mostramos si tiene cantidadQuitada
      return ingredienteExistente.cantidadQuitada > 0;
    });
  
    setIngredientesDisponibles(ingredientesDisponibles);
    
    if (producto.cantidad > 1) {
      setSelectedCantidadToAdd(1);
      setIsSelectCantidadModalOpen(true);
    } else {
      setIsIngredientModalOpen(true);
    }
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
      if (!ing2) return false;

      const cantidadNeta1 = (ing.cantidad || 0) + (ing.cantidadAgregada || 0) - (ing.cantidadQuitada || 0);
      const cantidadNeta2 = (ing2.cantidad || 0) + (ing2.cantidadAgregada || 0) - (ing2.cantidadQuitada || 0);

      return (
        ing?.ingrediente?._id === ing2?.ingrediente?._id &&
        ing?.porDefecto === ing2?.porDefecto &&
        cantidadNeta1 === cantidadNeta2
      );
    });
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
                            {/* Ingredientes añadidos y modificados */}
{producto.ingredientes
  .map((ing, idx) => {
    const cantidadBase = ing.porDefecto ? ing.cantidad : 0;
    const cantidadAgregada = ing.cantidadAgregada || 0;
    const cantidadQuitada = ing.cantidadQuitada || 0;
    const cantidadNeta = cantidadBase + cantidadAgregada - cantidadQuitada;

    // Si es ingrediente por defecto y está quitado
    if (ing.porDefecto && cantidadQuitada > 0) {
      return (
        <div key={`${ing.ingrediente._id}-${idx}`} className="text-red-600">
          - {ing.ingrediente.nombre} x{cantidadQuitada}
        </div>
      );
    }

    // Si tiene cantidad agregada (no por defecto)
    if (!ing.porDefecto && cantidadAgregada > 0) {
      return (
        <div key={`${ing.ingrediente._id}-${idx}`} className="text-green-600">
          + {ing.ingrediente.nombre} x{cantidadAgregada} (
          {(ing.ingrediente.precio || 0).toLocaleString('es-ES', {
            style: 'currency',
            currency: 'EUR'
          })}
          {cantidadAgregada > 1 ? ` x ${cantidadAgregada} = ${((ing.ingrediente.precio || 0) * cantidadAgregada).toLocaleString('es-ES', {
            style: 'currency',
            currency: 'EUR'
          })}` : ''}
          )
        </div>
      );
    }

    return null;
  })
  .filter(Boolean)}
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
          if (!open) setSelectedCantidadToAdd(1);
        }}
      >
        <DialogContent className="bg-[#F0F0D7] border border-[#AAB99A]">
          <DialogHeader>
            <DialogTitle className="text-[#727D73]">
              ¿Cuántos {selectedIngredientToAdd?.nombre || 'ingredientes'} desea agregar?
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-4">
            <div className="text-center mb-4">
              <div>Producto: {selectedProduct?.nombre}</div>
              <div className="text-sm text-gray-600">Cantidad del producto: {selectedProduct?.cantidad || 0}</div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: selectedProduct?.cantidad || 0 }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handleConfirmAgregarIngrediente(i + 1, selectedIngredientToAdd)}
                  className="p-4 bg-[#727D73] text-white rounded hover:bg-[#727D73]/90 text-lg font-medium"
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
        onOpenChange={setIsIngredientModalOpen}
      >
        <DialogContent className="bg-[#F0F0D7] border border-[#AAB99A]">
          <DialogHeader>
            <DialogTitle className="text-[#727D73]">
              Agregar ingredientes a {selectedProduct?.nombre}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-4 gap-2 p-4">
            {(selectedProduct ? obtenerIngredientesPermitidos(selectedProduct) : [])
              .filter(ingrediente => {
                if (!ingrediente.active) return false;
                // Obtener el balance actual del ingrediente
                const balanceActual = obtenerBalanceIngrediente(selectedProduct, ingrediente._id);
                // Permitir agregar si no está en el producto o si es un ingrediente quitado
                return balanceActual <= 0;
              })
              .map(ingrediente => (
                <button
                  key={ingrediente._id}
                  className="p-2 bg-white rounded border border-[#AAB99A] text-[#727D73] 
                           hover:bg-[#D0DDD0] transition-colors text-sm flex flex-col items-center"
                  onClick={() => {
                    if (selectedProduct?.cantidad > 1) {
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
                    })} / {ingrediente.unidad || 'unidad'})
                  </span>
                </button>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para quitar ingredientes */}
      <Dialog 
        open={isRemoveIngredientModalOpen} 
        onOpenChange={setIsRemoveIngredientModalOpen}
      >
        <DialogContent className="bg-[#F0F0D7] border border-[#AAB99A]">
          <DialogHeader>
            <DialogTitle className="text-[#727D73]">
              Quitar ingredientes de {selectedProduct?.nombre}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-4 gap-2 p-4">
            {selectedProduct?.ingredientes
              ?.filter(ing => {
                const balanceActual = obtenerBalanceIngrediente(selectedProduct, ing.ingrediente._id);
                return balanceActual > 0; // Solo mostrar ingredientes que aún tienen cantidad positiva
              })
              .map(ing => (
                <button
                  key={ing.ingrediente._id}
                  className="p-2 bg-white rounded border border-[#AAB99A] text-[#727D73] 
                           hover:bg-[#D0DDD0] transition-colors text-sm flex flex-col items-center gap-1"
                  onClick={() => handleQuitarIngrediente(selectedProduct, ing.ingrediente._id)}
                >
                  <span>{ing.ingrediente.nombre}</span>
                  <span className="text-xs text-gray-500">
                    {obtenerBalanceIngrediente(selectedProduct, ing.ingrediente._id)} {ing.unidad || 'unidad'}
                  </span>
                  {ing.porDefecto && (
                    <span className="text-xs text-blue-600">(Por defecto)</span>
                  )}
                </button>
              ))}
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