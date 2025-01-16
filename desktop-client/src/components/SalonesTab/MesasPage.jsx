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
import { getIngredientes } from '../../services/ingredientesService';
import { toast } from 'react-toastify';

export const MesasPage = () => {
  const { mesaId } = useParams();
  const navigate = useNavigate();

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
  const [pedidoActual, setPedidoActual] = useState({
    productos: [],
    total: 0
  });

  // Estados para modales e ingredientes
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [isRemoveIngredientModalOpen, setIsRemoveIngredientModalOpen] = useState(false);
  const [isSelectCantidadModalOpen, setIsSelectCantidadModalOpen] = useState(false);
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState([]);
  const [ingredientesPermitidosActual, setIngredientesPermitidosActual] = useState([]);
  const [selectedIngredientToAdd, setSelectedIngredientToAdd] = useState(null);

  useEffect(() => {
    const userStored = localStorage.getItem('user');
    if (userStored) {
      setCurrentUser(JSON.parse(userStored));
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [mesaId]);

  useEffect(() => {
    if (subCategoriaActiva) {
      const subCategoria = subCategorias.find(sc => sc._id === subCategoriaActiva);
      if (subCategoria) {
        setIngredientesPermitidosActual(subCategoria.ingredientesPermitidos || []);
      }
    }
  }, [subCategoriaActiva, subCategorias]);

  useEffect(() => {
    const primeraSubCategoria = subCategorias.find(
      sc => sc.categoria._id === categoriaActiva
    );
    
    if (primeraSubCategoria) {
      setSubCategoriaActiva(primeraSubCategoria._id);
      setIngredientesPermitidosActual(primeraSubCategoria.ingredientesPermitidos || []);
    }
  }, [categoriaActiva]);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      const [mesaData, categoriasData, subCategoriasData, productosData] = await Promise.all([
        getMesaById(mesaId),
        getCategorias(),
        getSubCategorias(),
        getProductos()
      ]);

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
          setIngredientesPermitidosActual(primeraSubCategoria.ingredientesPermitidos || []);
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

  const cargarIngredientes = async () => {
    try {
      setIngredientesDisponibles(ingredientesPermitidosActual);
    } catch (error) {
      console.error('Error al cargar ingredientes:', error);
      toast.error('Error al cargar ingredientes');
    }
  };

  const calcularTotal = (productos) => {
    return productos.reduce((total, p) => {
      const precioBase = p.precio * p.cantidad;
      const precioIngredientes = p.ingredientes.reduce((sum, ing) => {
        if (ing.quitado) return sum;
        return sum + (ing.ingrediente.precio * ing.cantidad);
      }, 0);
      return total + (precioBase + precioIngredientes);
    }, 0);
  };

  const sonIngredientesIguales = (ingredientes1, ingredientes2) => {
    if (!ingredientes1 || !ingredientes2) return false;
    if (ingredientes1.length !== ingredientes2.length) return false;

    const ingredientesSorted1 = [...ingredientes1].sort((a, b) => 
      a.ingrediente._id.localeCompare(b.ingrediente._id)
    );
    const ingredientesSorted2 = [...ingredientes2].sort((a, b) => 
      a.ingrediente._id.localeCompare(b.ingrediente._id)
    );

    return ingredientesSorted1.every((ing, index) => 
      ing.ingrediente._id === ingredientesSorted2[index].ingrediente._id &&
      ing.cantidad === ingredientesSorted2[index].cantidad &&
      ing.quitado === ingredientesSorted2[index].quitado
    );
  };

  const handleAddProducto = (producto) => {
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

      // Buscar si ya existe un producto igual
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
        return {
          productos: nuevosProductos,
          total: calcularTotal(nuevosProductos)
        };
      }

      return {
        productos: [...prev.productos, nuevoProducto],
        total: calcularTotal([...prev.productos, nuevoProducto])
      };
    });
  };

  const handleUpdateCantidad = (uid, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    setPedidoActual(prev => {
      const nuevosProductos = prev.productos.map(p => 
        p.uid === uid ? { ...p, cantidad: nuevaCantidad } : p
      );
      return {
        productos: nuevosProductos,
        total: calcularTotal(nuevosProductos)
      };
    });
  };

  const handleAgregarIngrediente = (producto) => {
    if (producto.cantidad > 1) {
      setSelectedProduct(producto);
      setIsSelectCantidadModalOpen(true);
    } else {
      setSelectedProduct(producto);
      setIsIngredientModalOpen(true);
      cargarIngredientes();
    }
  };

  const handleConfirmAgregarIngrediente = (cantidadSeleccionada, ingrediente) => {
    setPedidoActual(prev => {
      const nuevosProductos = [...prev.productos];
      const indexProducto = nuevosProductos.findIndex(p => p.uid === selectedProduct.uid);
      
      if (indexProducto === -1) return prev;

      if (cantidadSeleccionada < selectedProduct.cantidad) {
        const productoConIngrediente = {
          ...selectedProduct,
          cantidad: cantidadSeleccionada,
          ingredientes: [
            ...selectedProduct.ingredientes,
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
            ...selectedProduct.ingredientes,
            { ingrediente, cantidad: 1, porDefecto: false }
          ]
        };
      }

      return {
        productos: nuevosProductos,
        total: calcularTotal(nuevosProductos)
      };
    });

    setIsSelectCantidadModalOpen(false);
    setIsIngredientModalOpen(false);
  };

  const handleQuitarIngrediente = (producto, ingredienteId) => {
    const ingredientePermitido = ingredientesPermitidosActual.some(
      ing => ing._id === ingredienteId
    );

    if (!ingredientePermitido) {
      toast.error('Este ingrediente no se puede quitar');
      return;
    }

    setPedidoActual(prev => {
      const nuevosProductos = prev.productos.map(p => {
        if (p.uid === producto.uid) {
          return {
            ...p,
            ingredientes: p.ingredientes.map(ing => {
              if (ing.ingrediente._id === ingredienteId) {
                return {
                  ...ing,
                  quitado: true,
                  cantidadOriginal: ing.cantidad
                };
              }
              return ing;
            })
          };
        }
        return p;
      });

      return {
        ...prev,
        productos: nuevosProductos,
        total: calcularTotal(nuevosProductos)
      };
    });
    setIsRemoveIngredientModalOpen(false);
  };

  const handleEliminarProducto = (uid) => {
    setPedidoActual(prev => {
      const nuevosProductos = prev.productos.filter(p => p.uid !== uid);
      return {
        productos: nuevosProductos,
        total: calcularTotal(nuevosProductos)
      };
    });
  };
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
        <div className="text-[#727D73]">Mozo: {currentUser?.nombre}</div>
      </div>

      {/* Contenido principal */}
      <div className="flex h-[calc(100vh-64px)]">
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
                          {(producto.precio * producto.cantidad).toLocaleString('es-ES', {
                            style: 'currency',
                            currency: 'EUR'
                          })}
                        </div>
                        {producto.ingredientes?.length > 0 && (
                          <div className="text-xs space-y-0.5 mt-1">
                            {/* Ingredientes añadidos */}
                            {producto.ingredientes
                              .filter(ing => !ing.porDefecto && !ing.quitado)
                              .map((ing, idx) => (
                                <div key={`${ing.ingrediente._id}-${idx}`} className="text-green-600">
                                  + {ing.ingrediente.nombre} {ing.cantidad > 1 ? `x${ing.cantidad}` : ''}
                                </div>
                              ))}
                            {/* Ingredientes quitados */}
                            {producto.ingredientes
                              .filter(ing => ing.quitado)
                              .map((ing, idx) => (
                                <div key={`${ing.ingrediente._id}-${idx}`} className="text-red-600">
                                  - {ing.ingrediente.nombre} x{ing.cantidadOriginal || 1}
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
                  {producto.ingredientes?.length > 0 && (
                    <>
                      <ContextMenuSeparator />
                      <ContextMenuItem 
                        onClick={() => {
                          setSelectedProduct(producto);
                          setIsRemoveIngredientModalOpen(true);
                        }}
                      >
                        Quitar Ingrediente
                      </ContextMenuItem>
                    </>
                  )}
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
            <div className="flex justify-between items-center font-medium text-[#727D73]">
              <span>Total:</span>
              <span>
                {pedidoActual.total.toLocaleString('es-ES', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </span>
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
      <Dialog open={isSelectCantidadModalOpen} onOpenChange={setIsSelectCantidadModalOpen}>
        <DialogContent className="bg-[#F0F0D7] border border-[#AAB99A]">
          <DialogHeader>
            <DialogTitle className="text-[#727D73]">
              ¿A cuántas unidades desea agregar el ingrediente?
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-4">
            <div className="text-center mb-4">
              Cantidad actual: {selectedProduct?.cantidad}
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

      {/* Modal de ingredientes */}
      <Dialog open={isIngredientModalOpen} onOpenChange={setIsIngredientModalOpen}>
        <DialogContent className="bg-[#F0F0D7] border border-[#AAB99A]">
          <DialogHeader>
            <DialogTitle className="text-[#727D73]">
              Agregar ingredientes a {selectedProduct?.nombre}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-4 gap-2 p-4">
            {ingredientesDisponibles
              .filter(ingrediente => ingrediente.active)
              .map(ingrediente => (
                <button
                  key={ingrediente._id}
                  className="p-2 bg-white rounded border border-[#AAB99A] text-[#727D73] 
                           hover:bg-[#D0DDD0] transition-colors text-sm"
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
                  {ingrediente.nombre}
                </button>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para quitar ingredientes */}
      <Dialog open={isRemoveIngredientModalOpen} onOpenChange={setIsRemoveIngredientModalOpen}>
        <DialogContent className="bg-[#F0F0D7] border border-[#AAB99A]">
          <DialogHeader>
            <DialogTitle className="text-[#727D73]">
              Quitar ingredientes de {selectedProduct?.nombre}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-4 gap-2 p-4">
            {selectedProduct?.ingredientes
              ?.filter(({ ingrediente }) => 
                !ingrediente.quitado &&
                ingredientesPermitidosActual.some(ing => ing._id === ingrediente._id)
              )
              .map(({ ingrediente }) => (
                <button
                  key={ingrediente._id}
                  className="p-2 bg-white rounded border border-[#AAB99A] text-[#727D73] 
                           hover:bg-[#D0DDD0] transition-colors text-sm"
                  onClick={() => handleQuitarIngrediente(selectedProduct, ingrediente._id)}
                >
                  {ingrediente.nombre}
                </button>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MesasPage