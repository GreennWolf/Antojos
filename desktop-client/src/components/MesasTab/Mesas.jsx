import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
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
import { getMesaById, updateMesa } from '../../services/mesasService';
import { getSubCategorias } from '../../services/subCategoriasService';
import { getProductos } from '../../services/productosService';
import { getCategorias } from '../../services/categoriasService';
import { getIngredientes } from '../../services/ingredientesService';
import { toast } from 'react-toastify';

const Mesas = () => {
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

  // Estados para menú contextual y modal de ingredientes
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState([]);

  useEffect(() => {
    // Obtener el usuario del localStorage
    const userStored = localStorage.getItem('user');
    if (userStored) {
      setCurrentUser(JSON.parse(userStored));
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [mesaId]);

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
      
      // Filtramos categorías que no son ingredientes
      const categoriasActivas = categoriasData.filter(cat => 
        cat.active && cat.ingrediente === false
      );
      setCategorias(categoriasActivas);
      
      setSubCategorias(subCategoriasData.filter(subcat => subcat.active));
      setProductos(productosData.filter(prod => prod.active));

      if (categoriasActivas.length > 0) {
        setCategoriaActiva(categoriasActivas[0]._id);
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
      const ingredientes = await getIngredientes();
      setIngredientesDisponibles(ingredientes);
    } catch (error) {
      console.error('Error al cargar ingredientes:', error);
      toast.error('Error al cargar ingredientes');
    }
  };

  const handleAddProducto = (producto) => {
    setPedidoActual(prev => {
      const productoExistente = prev.productos.find(p => p._id === producto._id);
      let nuevosProductos = productoExistente
        ? prev.productos.map(p => p._id === producto._id ? { ...p, cantidad: p.cantidad + 1 } : p)
        : [...prev.productos, { ...producto, cantidad: 1 }];
      
      return {
        productos: nuevosProductos,
        total: nuevosProductos.reduce((total, p) => total + (p.precio * p.cantidad), 0)
      };
    });
  };

  const handleUpdateCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    setPedidoActual(prev => {
      const nuevosProductos = prev.productos.map(p => 
        p._id === productoId ? { ...p, cantidad: nuevaCantidad } : p
      );
      return {
        productos: nuevosProductos,
        total: nuevosProductos.reduce((total, p) => total + (p.precio * p.cantidad), 0)
      };
    });
  };

  const handleAgregarIngrediente = (producto) => {
    setSelectedProduct(producto);
    setIsIngredientModalOpen(true);
    cargarIngredientes();
  };

  const handleQuitarIngrediente = (producto, ingredienteId) => {
    setPedidoActual(prev => {
      const nuevosProductos = prev.productos.map(p => {
        if (p._id === producto._id) {
          return {
            ...p,
            ingredientes: p.ingredientes.filter(ing => ing.ingrediente._id !== ingredienteId)
          };
        }
        return p;
      });

      return {
        ...prev,
        productos: nuevosProductos
      };
    });
  };

  const handleEliminarProducto = (productoId) => {
    setPedidoActual(prev => ({
      ...prev,
      productos: prev.productos.filter(p => p._id !== productoId),
      total: prev.productos
        .filter(p => p._id !== productoId)
        .reduce((total, p) => total + (p.precio * p.cantidad), 0)
    }));
  };
  if (isLoading) {
    return <div className="min-h-screen bg-[#F0F0D7] flex items-center justify-center">
      <div className="text-[#727D73] text-xl">Cargando...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#F0F0D7] flex flex-col">
      {/* Cabecera */}
      <div className="bg-white border-b border-[#AAB99A] shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-[#727D73] text-[#F0F0D7] rounded-lg hover:bg-[#727D73]/90 transition-colors"
              >
                Volver
              </button>
              <h1 className="text-xl font-medium text-[#727D73]">Mesa {mesa?.numero}</h1>
            </div>
            <div className="text-[#727D73]">Camarero: {currentUser?.nombre || 'No identificado'}</div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 max-w-8xl mx-auto px-4 py-6 w-full">
        <div className="flex gap-4 h-[calc(100vh-10rem)]">
          {/* Panel izquierdo - Categorías y productos */}
          <div className="flex-1 bg-white rounded-lg shadow-lg border border-[#AAB99A] p-6">
            <Tabs value={categoriaActiva} onValueChange={setCategoriaActiva} className="h-full">
              <TabsList className="grid grid-cols-10 gap-2 bg-transparent h-auto p-0">
                {categorias.map(categoria => (
                  <TabsTrigger
                    key={categoria._id}
                    value={categoria._id}
                    className="px-6 py-3 bg-[#F0F0D7] border border-[#AAB99A] text-[#727D73] rounded-lg
                             data-[state=active]:bg-[#727D73] data-[state=active]:text-[#F0F0D7]
                             hover:bg-[#D0DDD0] transition-colors"
                  >
                    {categoria.nombre}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categorias.map(categoria => (
                <TabsContent 
                  key={categoria._id} 
                  value={categoria._id}
                  className="mt-6 h-[calc(100%-4rem)] flex flex-col"
                >
                  {/* SubCategorías */}
                  <div className="flex gap-2 overflow-x-auto py-2 px-1">
                    {subCategorias
                      .filter(subcat => subcat.categoria?._id === categoria._id)
                      .map(subcategoria => (
                        <button
                          key={subcategoria._id}
                          onClick={() => setSubCategoriaActiva(subcategoria._id)}
                          className={`px-6 py-2 rounded-lg whitespace-nowrap transition-colors
                            ${subcategoria._id === subCategoriaActiva 
                              ? 'bg-[#727D73] text-[#F0F0D7]' 
                              : 'bg-[#F0F0D7] border border-[#AAB99A] text-[#727D73] hover:bg-[#D0DDD0]'
                            }`}
                        >
                          {subcategoria.nombre}
                        </button>
                      ))}
                  </div>

                  {/* Grid de productos */}
                  <div className="grid grid-cols-6 gap-4 mt-4 overflow-y-auto pb-4">
                    {productos
                      .filter(producto => 
                        producto.active && 
                        producto.subCategoria?._id === subCategoriaActiva
                      )
                      .map(producto => (
                        <Card
                          key={producto._id}
                          onClick={() => handleAddProducto(producto)}
                          className="cursor-pointer hover:bg-[#D0DDD0] transition-colors border-[#AAB99A]"
                        >
                          <div className="p-4 text-center space-y-2">
                            <div className="font-medium text-[#727D73] text-lg">
                              {producto.nombre}
                            </div>
                            <div className="text-gray-600">
                              {producto.precio?.toLocaleString('es-ES', { 
                                style: 'currency', 
                                currency: 'EUR' 
                              })}
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Panel derecho - Pedido actual */}
          <div className="w-96 bg-white rounded-lg shadow-lg border border-[#AAB99A] flex flex-col">
            <div className="p-4 border-b border-[#AAB99A]">
              <h2 className="text-lg font-medium text-[#727D73]">Pedido Actual</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {pedidoActual?.productos.map(producto => (
                <ContextMenu key={producto._id}>
                  <ContextMenuTrigger>
                    <div className="flex items-center justify-between py-2 border-b border-[#AAB99A] last:border-0">
                      <div className="flex-1">
                        <div className="font-medium text-[#727D73]">{producto.nombre}</div>
                        <div className="text-sm text-gray-600">
                          {(producto.precio * producto.cantidad).toLocaleString('es-ES', { 
                            style: 'currency', 
                            currency: 'EUR' 
                          })}
                        </div>
                        {producto.ingredientes?.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Ingredientes: {producto.ingredientes.map(ing => ing.ingrediente.nombre).join(', ')}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateCantidad(producto._id, producto.cantidad - 1)}
                          className="px-2 py-1 bg-[#727D73] text-[#F0F0D7] rounded hover:bg-[#727D73]/90 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-[#727D73]">{producto.cantidad}</span>
                        <button
                          onClick={() => handleUpdateCantidad(producto._id, producto.cantidad + 1)}
                          className="px-2 py-1 bg-[#727D73] text-[#F0F0D7] rounded hover:bg-[#727D73]/90 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </ContextMenuTrigger>

                  <ContextMenuContent className="min-w-[160px] bg-white rounded-lg shadow-lg border border-[#AAB99A] p-1">
                    <ContextMenuItem 
                      className="px-3 py-2 text-[#727D73] hover:bg-[#D0DDD0] rounded-md cursor-pointer transition-colors" 
                      onClick={() => handleAgregarIngrediente(producto)}
                    >
                      Agregar Ingrediente
                    </ContextMenuItem>
                    {producto.ingredientes?.length > 0 && (
                      <>
                        <ContextMenuSeparator className="my-1 border-[#AAB99A]" />
                        <ContextMenuItem 
                          className="px-3 py-2 text-[#727D73] hover:bg-[#D0DDD0] rounded-md cursor-pointer transition-colors"
                          onClick={() => setSelectedProduct(producto)}
                        >
                          Quitar Ingrediente
                        </ContextMenuItem>
                      </>
                    )}
                    <ContextMenuSeparator className="my-1 border-[#AAB99A]" />
                    <ContextMenuItem 
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md cursor-pointer transition-colors"
                      onClick={() => handleEliminarProducto(producto._id)}
                    >
                      Eliminar
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </div>

            <div className="p-4 border-t border-[#AAB99A] bg-[#F0F0D7]">
              <div className="flex justify-between items-center text-lg font-medium text-[#727D73]">
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
        <div className="mt-4 bg-white rounded-lg shadow-lg border border-[#AAB99A] p-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-[#727D73] text-[#F0F0D7] rounded-lg hover:bg-[#727D73]/90 transition-colors">
                Consultar Mesa
              </button>
              <button className="px-4 py-2 bg-[#727D73] text-[#F0F0D7] rounded-lg hover:bg-[#727D73]/90 transition-colors">
                Hacer Factura
              </button>
              <button className="px-4 py-2 bg-[#727D73] text-[#F0F0D7] rounded-lg hover:bg-[#727D73]/90 transition-colors">
                Cerrar Mesa
              </button>
              <button className="px-4 py-2 bg-[#727D73] text-[#F0F0D7] rounded-lg hover:bg-[#727D73]/90 transition-colors">
                Cobrar Mesa
              </button>
              <button className="px-4 py-2 bg-[#727D73] text-[#F0F0D7] rounded-lg hover:bg-[#727D73]/90 transition-colors">
                Asignar Cliente
              </button>
              <button className="px-4 py-2 bg-[#727D73] text-[#F0F0D7] rounded-lg hover:bg-[#727D73]/90 transition-colors">
                Cambiar Mesa
              </button>
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 bg-[#727D73] text-[#F0F0D7] rounded-lg hover:bg-[#727D73]/90 transition-colors">
                Dividir Mesa
              </button>
              <button className="px-4 py-2 bg-[#727D73] text-[#F0F0D7] rounded-lg hover:bg-[#727D73]/90 transition-colors">
                Imprimir
              </button>
              <button className="px-4 py-2 bg-[#727D73] text-[#F0F0D7] rounded-lg hover:bg-[#727D73]/90 transition-colors">
                Juntar Mesa
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Ingredientes */}
      <Dialog open={isIngredientModalOpen} onOpenChange={setIsIngredientModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-[#F0F0D7] border border-[#AAB99A] shadow-lg">
          <DialogHeader className="border-b border-[#AAB99A] px-6 py-4">
            <DialogTitle className="text-xl font-medium text-[#727D73]">
              Ingredientes para {selectedProduct?.nombre}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-4 p-6">
            {ingredientesDisponibles
              .filter(ingrediente => ingrediente.active)
              .map(ingrediente => (
                <Card
                  key={ingrediente._id}
                  className="p-4 cursor-pointer hover:bg-[#D0DDD0] transition-colors border-[#AAB99A] bg-white"
                  onClick={() => {
                    setPedidoActual(prev => ({
                      ...prev,
                      productos: prev.productos.map(p => {
                        if (p._id === selectedProduct?._id) {
                          const nuevosIngredientes = [...(p.ingredientes || [])];
                          const existeIngrediente = nuevosIngredientes
                            .some(ing => ing.ingrediente._id === ingrediente._id);
                          
                          if (!existeIngrediente) {
                            nuevosIngredientes.push({
                              ingrediente: ingrediente,
                              cantidad: 1,
                              unidad: 'unidad'
                            });
                          }
                          
                          return {
                            ...p,
                            ingredientes: nuevosIngredientes
                          };
                        }
                        return p;
                      })
                    }));
                    setIsIngredientModalOpen(false);
                  }}
                >
                  <div className="font-medium text-[#727D73]">{ingrediente.nombre}</div>
                  <div className="text-sm text-gray-600">
                    {ingrediente.precio?.toLocaleString('es-ES', { 
                      style: 'currency', 
                      currency: 'EUR' 
                    })}
                  </div>
                </Card>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Mesas;