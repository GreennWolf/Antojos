import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit, Trash2, Check, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  createProducto,
  getProductos,
  updateProducto,
  deleteProducto,
  toggleProductoActive,
} from '../../services/productosService';
import { getSubCategorias } from '../../services/subCategoriasService';
import { getIngredientes } from '../../services/ingredientesService';
import { useConfirm } from '../../context/ConfirmContext';

export const Producto = () => {
  const { showConfirm } = useConfirm();
  const inputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Estados principales
  const [productos, setProductos] = useState([]);
  const [subCategorias, setSubCategorias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [viewingProducto, setViewingProducto] = useState(null);
  const [currentTab, setCurrentTab] = useState('ingredientes');
  
  // Estados para navegación en grupos
  const [currentIngredientePage, setCurrentIngredientePage] = useState(0);
  const [currentProductPage, setCurrentProductPage] = useState(0);
  const [ingredientesSearch, setIngredientesSearch] = useState('');
  const [productosSearch, setProductosSearch] = useState('');

  // Estados para cantidades
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Estados para el manejo de ingredientes
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState([]);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState([]);
  const [todosLosIngredientes, setTodosLosIngredientes] = useState([]);
  const [ingredienteActual, setIngredienteActual] = useState(null);

  // Estados para el manejo de productos relacionados
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [productoActual, setProductoActual] = useState(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    precio: 0,
    costo: 0,
    stockActual: 0,
    stockMinimo: 0,
    subCategoria: '',
    ingredientes: [],
    productos: [],
    active: true
  });
  // Efecto inicial para cargar datos
  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para cargar todos los datos necesarios
  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      const [productosData, subCategoriasData, ingredientesData] = await Promise.all([
        getProductos(),
        getSubCategorias(),
        getIngredientes()
      ]);
      
      setProductos(productosData);
      setSubCategorias(subCategoriasData);
      setTodosLosIngredientes(ingredientesData);
      setIngredientesDisponibles(ingredientesData.map(ing => ({...ing, selected: false})));
      
      // Configurar productos disponibles excluyendo el actual si está en modo edición
      const productosParaRelacionar = productosData.filter(p => 
        !editingProducto || p._id !== editingProducto._id
      ).map(p => ({...p, selected: false}));
      setProductosDisponibles(productosParaRelacionar);
    } catch (error) {
      toast.error('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        ingredientes: ingredientesSeleccionados.map(ing => ({
          ingrediente: ing._id,
          cantidad: ing.cantidad || 0,
          unidad: ing.unidad || 'unidad'
        })),
        productos: productosSeleccionados.map(prod => ({
          producto: prod._id,
          cantidad: prod.cantidad || 1
        }))
      };

      if (editingProducto) {
        await updateProducto(editingProducto._id, dataToSend);
        toast.success('Producto actualizado correctamente');
      } else {
        await createProducto(dataToSend);
        toast.success('Producto creado correctamente');
      }
      handleCloseDialog();
      cargarDatos();
    } catch (error) {
      toast.error(error.message || 'Error al procesar la operación');
    }
  };

  const handleDelete = async (id) => {
    showConfirm(
      'Eliminar Producto',
      '¿Estás seguro de eliminar este producto?',
      async () => {
        try {
          await deleteProducto(id);
          toast.success('Producto eliminado correctamente');
          await cargarDatos();
        } catch (error) {
          toast.error('Error al eliminar el producto');
        }
      }
    );
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleProductoActive(id);
      cargarDatos();
    } catch (error) {
      toast.error('Error al cambiar el estado del producto');
    }
  };

  // Manejador para abrir el diálogo de vista detallada
  const handleOpenViewDialog = (producto) => {
    setViewingProducto(producto);
    setIsViewDialogOpen(true);
  };
  const handleOpenDialog = (producto = null) => {
    if (producto) {
      setFormData({
        nombre: producto.nombre,
        precio: producto.precio,
        costo: producto.costo,
        stockActual: producto.stockActual,
        stockMinimo: producto.stockMinimo,
        subCategoria: producto.subCategoria?._id || '',
        active: producto.active,
        ingredientes: producto.ingredientes || [],
        productos: producto.productos || []
      });
      setEditingProducto(producto);

      // Configurar ingredientes
      const selectedIngs = (producto.ingredientes || []).map(ing => ({
        ...(ing.ingrediente || {}),
        cantidad: ing.cantidad || 0,
        unidad: ing.unidad || 'unidad',
        selected: false
      }));
      const availableIngs = todosLosIngredientes.filter(ing => 
        !producto.ingredientes?.some(i => i.ingrediente?._id === ing._id)
      ).map(ing => ({...ing, selected: false}));
      
      setIngredientesSeleccionados(selectedIngs);
      setIngredientesDisponibles(availableIngs);

      // Configurar productos relacionados
      const selectedProds = (producto.productos || []).map(prod => ({
        ...(prod.producto || {}),
        cantidad: prod.cantidad || 1,
        selected: false
      }));
      const availableProds = productos.filter(p => 
        p._id !== producto._id && 
        !producto.productos?.some(pr => pr.producto?._id === p._id)
      ).map(p => ({...p, selected: false}));
      
      setProductosSeleccionados(selectedProds);
      setProductosDisponibles(availableProds);
    } else {
      // Reset para nuevo registro
      setFormData({
        nombre: '',
        precio: 0,
        costo: 0,
        stockActual: 0,
        stockMinimo: 0,
        subCategoria: '',
        ingredientes: [],
        productos: [],
        active: true
      });
      setEditingProducto(null);
      setIngredientesSeleccionados([]);
      setProductosSeleccionados([]);
      
      // Reset ingredientes disponibles
      const resetIngs = todosLosIngredientes.map(ing => ({...ing, selected: false}));
      setIngredientesDisponibles(resetIngs);
      
      // Reset productos disponibles
      const resetProds = productos.map(p => ({...p, selected: false}));
      setProductosDisponibles(resetProds);
    }
    setIsDialogOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProducto(null);
    setFormData({
      nombre: '',
      precio: 0,
      costo: 0,
      stockActual: 0,
      stockMinimo: 0,
      subCategoria: '',
      ingredientes: [],
      productos: [],
      active: true
    });
    setCurrentIngredientePage(0);
    setCurrentProductPage(0);
    setIngredientesSearch('');
    setProductosSearch('');
  };

  // Funciones para el manejo de ingredientes y productos
  const handleIngredienteModalOpen = (ingrediente) => {
    setIngredienteActual(ingrediente);
    setIsIngredientModalOpen(true);
  };

  const handleProductoModalOpen = (producto) => {
    setProductoActual(producto);
    setIsProductModalOpen(true);
  };

  const handleMoveIngredientes = (direction, ingrediente = null) => {
    if (direction === 'right') {
      if (ingrediente) {
        const ingToMove = { ...ingrediente, selected: false };
        setIngredientesSeleccionados(prev => [...prev, ingToMove]);
        setIngredientesDisponibles(prev => 
          prev.filter(ing => ing._id !== ingrediente._id)
        );
      }
    } else {
      const selectedToRemove = ingredientesSeleccionados.filter(ing => ing.selected);
      setIngredientesDisponibles(prev => [...prev, ...selectedToRemove.map(ing => ({...ing, selected: false}))]);
      setIngredientesSeleccionados(prev => prev.filter(ing => !ing.selected));
    }
  };

  const handleMoveProductos = (direction, producto = null) => {
    if (direction === 'right') {
      if (producto) {
        const prodToMove = { ...producto, selected: false };
        setProductosSeleccionados(prev => [...prev, prodToMove]);
        setProductosDisponibles(prev => 
          prev.filter(prod => prod._id !== producto._id)
        );
      }
    } else {
      const selectedToRemove = productosSeleccionados.filter(prod => prod.selected);
      setProductosDisponibles(prev => [...prev, ...selectedToRemove.map(prod => ({...prod, selected: false}))]);
      setProductosSeleccionados(prev => prev.filter(prod => !prod.selected));
    }
  };
  const handleSelectIngrediente = (ingrediente, lista) => {
    const updateList = lista === 'disponibles' ? setIngredientesDisponibles : setIngredientesSeleccionados;
    updateList(prev =>
      prev.map(ing => 
        ing._id === ingrediente._id 
          ? { ...ing, selected: !ing.selected }
          : ing
      )
    );
  };

  const handleSelectProducto = (producto, lista) => {
    const updateList = lista === 'disponibles' ? setProductosDisponibles : setProductosSeleccionados;
    updateList(prev =>
      prev.map(prod => 
        prod._id === producto._id 
          ? { ...prod, selected: !prod.selected }
          : prod
      )
    );
  };

  const handleRemoveIngrediente = (index, e) => {
    e.preventDefault(); // Prevenir el submit del formulario
    e.stopPropagation(); // Evitar la propagación del evento

    const ingrediente = ingredientesSeleccionados[index];
    setIngredientesSeleccionados(prev => prev.filter((_, i) => i !== index));
    setIngredientesDisponibles(prev => [...prev, {...ingrediente, selected: false}]);
  };

  const handleRemoveProducto = (index, e) => {
    e.preventDefault(); // Prevenir el submit del formulario
    e.stopPropagation(); // Evitar la propagación del evento
    const producto = productosSeleccionados[index];
    setProductosSeleccionados(prev => prev.filter((_, i) => i !== index));
    setProductosDisponibles(prev => [...prev, {...producto, selected: false}]);
  };

  return (
    <div className="space-y-4">
      {/* Barra superior */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-64"
            onFocus={(e) => e.currentTarget.select()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.currentTarget.blur();
                setSearchTerm('');
              }
            }}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-[#727D73]" />
        </div>
        <Button 
          onClick={() => handleOpenDialog()}
          className="flex items-center bg-[#727D73] text-[#F0F0D7] hover:bg-[#727D73]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Tabla de productos */}
      <div className="overflow-x-auto rounded-lg border border-[#AAB99A]">
        <table className="w-full">
          <thead>
            <tr className="bg-[#AAB99A] bg-opacity-30">
              <th className="px-4 py-3 text-left text-sm font-medium text-[#727D73]">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#727D73]">Subcategoría</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-[#727D73]">Precio</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-[#727D73]">Costo</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-[#727D73]">Stock</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-[#727D73]">Estado</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-[#727D73]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" className="text-center py-4">Cargando...</td>
              </tr>
            ) : (productos || []).length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">No se encontraron productos</td>
              </tr>
            ) : (
              (productos || [])
                .filter(producto => {
                  if (!producto) return false;
                  const searchLower = searchTerm?.toLowerCase() || '';
                  return (
                    (producto.nombre || '').toLowerCase().includes(searchLower) ||
                    (producto.subCategoria?.nombre || '').toLowerCase().includes(searchLower) ||
                    (producto.precio?.toString() || '').includes(searchLower) ||
                    (producto.costo?.toString() || '').includes(searchLower)
                  );
                })
                .map((producto) => (
                  <tr key={producto._id} 
                      className="border-t border-[#AAB99A] hover:bg-[#D0DDD0] cursor-pointer"
                      onClick={() => handleOpenViewDialog(producto)}>
                    <td className="px-4 py-3">{producto.nombre}</td>
                    <td className="px-4 py-3">{producto.subCategoria?.nombre}</td>
                    <td className="px-4 py-3 text-right">
                      {producto.precio?.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {producto.costo?.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {producto.stockActual} / {producto.stockMinimo}
                    </td>
                    <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleActive(producto._id)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs
                          ${producto.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'}`}
                      >
                        {producto.active ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Activo
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 mr-1" />
                            Inactivo
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-center space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDialog(producto);
                                }}
                                className="text-[#727D73] hover:text-[#727D73]/90 hover:bg-[#D0DDD0]"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar Producto</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(producto._id);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Eliminar Producto</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal de vista detallada */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-[#F0F0D7] max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-[#727D73]">
              Detalles de Producto
            </DialogTitle>
          </DialogHeader>
          
          {viewingProducto && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-[#727D73]">Información General</h3>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Nombre:</span> {viewingProducto.nombre}</p>
                    <p><span className="font-medium">Subcategoría:</span> {viewingProducto.subCategoria?.nombre}</p>
                    <p><span className="font-medium">Precio:</span> {viewingProducto.precio?.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                    <p><span className="font-medium">Costo:</span> {viewingProducto.costo?.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
                    <p><span className="font-medium">Stock:</span> {viewingProducto.stockActual} / {viewingProducto.stockMinimo}</p>
                    <p><span className="font-medium">Estado:</span> {viewingProducto.active ? 'Activo' : 'Inactivo'}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-[#727D73]">Ingredientes</h3>
                    <div className="mt-2 max-h-40 overflow-y-auto border rounded-md p-2 bg-white">
                      {viewingProducto.ingredientes?.length > 0 ? (
                        viewingProducto.ingredientes.map(ing => (
                          <div key={ing.ingrediente._id} className="py-1">
                            {ing.ingrediente.nombre} - {ing.cantidad} {ing.unidad}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No hay ingredientes asociados</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-[#727D73]">Productos Relacionados</h3>
                    <div className="mt-2 max-h-40 overflow-y-auto border rounded-md p-2 bg-white">
                      {viewingProducto.productos?.length > 0 ? (
                        viewingProducto.productos.map(prod => (
                          <div key={prod.producto._id} className="py-1">
                            {prod.producto.nombre} - Cantidad: {prod.cantidad}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No hay productos relacionados</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button"
                  onClick={() => setIsViewDialogOpen(false)}
                  className="bg-[#727D73] text-[#F0F0D7] hover:bg-[#727D73]/90"
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal principal de crear/editar */}
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          if (!open) handleCloseDialog();
        }}
      >
        <DialogContent 
          className="bg-[#F0F0D7] max-w-4xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-[#727D73]">
              {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
            {/* Columna izquierda - Datos básicos */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#727D73] mb-1">
                  Nombre
                </label>
                <Input 
                  ref={inputRef}
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full bg-white border-[#AAB99A]" 
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#727D73] mb-1">
                  Subcategoría
                </label>
                <select
                  name="subCategoria"
                  value={formData.subCategoria}
                  onChange={handleInputChange}
                  className="w-full bg-white border-[#AAB99A] rounded-md p-2"
                  required
                >
                  <option value="">Seleccione una subcategoría</option>
                  {subCategorias.length > 0 ? (
                    subCategorias
                      .filter(subcat => subcat.active)
                      .map(subcat => (
                        <option key={subcat._id} value={subcat._id}>
                          {subcat.nombre}
                        </option>
                      ))
                  ) : (
                    <option value="" disabled>Cargando subcategorías...</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#727D73] mb-1">
                  Precio
                </label>
                <Input 
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleInputChange}
                  className="w-full bg-white border-[#AAB99A]"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#727D73] mb-1">
                  Costo
                </label>
                <Input 
                  type="number"
                  name="costo"
                  value={formData.costo}
                  onChange={handleInputChange}
                  className="w-full bg-white border-[#AAB99A]"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#727D73] mb-1">
                  Stock Actual
                </label>
                <Input 
                  type="number"
                  name="stockActual"
                  value={formData.stockActual}
                  onChange={handleInputChange}
                  className="w-full bg-white border-[#AAB99A]"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#727D73] mb-1">
                  Stock Mínimo
                </label>
                <Input 
                  type="number"
                  name="stockMinimo"
                  value={formData.stockMinimo}
                  onChange={handleInputChange}
                  className="w-full bg-white border-[#AAB99A]"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#727D73] mb-1">
                  Estado
                </label>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={formData.active}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, active: checked }))
                    }
                  />
                  <span className="text-sm text-[#727D73]">
                    {formData.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            {/* Columna derecha - Tabs */}
            <div className="border-l border-[#AAB99A] pl-4">
              <Tabs defaultValue="ingredientes" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger 
                    value="ingredientes"
                    className="data-[state=active]:bg-white"
                  >
                    Ingredientes
                  </TabsTrigger>
                  <TabsTrigger 
                    value="productos"
                    className="data-[state=active]:bg-white"
                  >
                    Productos
                  </TabsTrigger>
                </TabsList>
                {/* Tab de Ingredientes */}
                <TabsContent value="ingredientes">
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Buscar ingrediente..."
                        value={ingredientesSearch}
                        onChange={(e) => setIngredientesSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full bg-white border-[#AAB99A]"
                      />
                      <Search className="absolute left-3 top-2.5 h-5 w-5 text-[#727D73]" />
                    </div>

                    <div className="relative">
                      <div className="h-40 overflow-y-auto border rounded-md p-2 bg-white">
                        <div className="grid grid-cols-3 gap-2">
                          {ingredientesDisponibles
                            .filter(ing => 
                              ing.nombre.toLowerCase().includes(ingredientesSearch.toLowerCase())
                            )
                            .slice(currentIngredientePage * 9, (currentIngredientePage + 1) * 9)
                            .map(ingrediente => (
                              <div
                                key={ingrediente._id}
                                onClick={() => handleIngredienteModalOpen(ingrediente)}
                                className="p-2 cursor-pointer rounded-md hover:bg-gray-100"
                              >
                                {ingrediente.nombre}
                              </div>
                            ))
                          }
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-[#727D73] mb-2">
                          Ingredientes seleccionados
                        </h4>
                        <div className="border rounded-md overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-[#AAB99A] bg-opacity-30">
                              <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium text-[#727D73]">Nombre</th>
                                <th className="px-4 py-2 text-right text-sm font-medium text-[#727D73]">Cantidad</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-[#727D73]">Unidad</th>
                                <th className="px-4 py-2 text-center text-sm font-medium text-[#727D73]">Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ingredientesSeleccionados.map((ing, index) => (
                                <tr key={index} className="border-t border-[#AAB99A]">
                                  <td className="px-4 py-2">{ing.nombre}</td>
                                  <td className="px-4 py-2 text-right">{ing.cantidad}</td>
                                  <td className="px-4 py-2">{ing.unidad}</td>
                                  <td className="px-4 py-2 text-center">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => handleRemoveIngrediente(index,e)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab de Productos */}
                <TabsContent value="productos">
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Buscar producto..."
                        value={productosSearch}
                        onChange={(e) => setProductosSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full bg-white border-[#AAB99A]"
                      />
                      <Search className="absolute left-3 top-2.5 h-5 w-5 text-[#727D73]" />
                    </div>

                    <div className="relative">
                      <div className="h-40 overflow-y-auto border rounded-md p-2 bg-white">
                        <div className="grid grid-cols-3 gap-2">
                          {productosDisponibles
                            .filter(prod => 
                              prod.nombre.toLowerCase().includes(productosSearch.toLowerCase())
                            )
                            .slice(currentProductPage * 9, (currentProductPage + 1) * 9)
                            .map(producto => (
                              <div
                                key={producto._id}
                                onClick={() => handleProductoModalOpen(producto)}
                                className="p-2 cursor-pointer rounded-md hover:bg-gray-100"
                              >
                                {producto.nombre}
                              </div>
                            ))
                          }
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-[#727D73] mb-2">
                          Productos seleccionados
                        </h4>
                        <div className="border rounded-md overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-[#AAB99A] bg-opacity-30">
                              <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium text-[#727D73]">Nombre</th>
                                <th className="px-4 py-2 text-right text-sm font-medium text-[#727D73]">Cantidad</th>
                                <th className="px-4 py-2 text-center text-sm font-medium text-[#727D73]">Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {productosSeleccionados.map((prod, index) => (
                                <tr key={index} className="border-t border-[#AAB99A]">
                                  <td className="px-4 py-2">{prod.nombre}</td>
                                  <td className="px-4 py-2 text-right">{prod.cantidad}</td>
                                  <td className="px-4 py-2 text-center">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => handleRemoveProducto(index,e)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter className="col-span-2">
              <Button 
                type="button"
                variant="outline" 
                onClick={handleCloseDialog}
                className="border-[#727D73] text-[#727D73] hover:bg-[#D0DDD0]"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-[#727D73] text-[#F0F0D7] hover:bg-[#727D73]/90"
              >
                {editingProducto ? 'Guardar Cambios' : 'Crear Producto'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Modal para cantidad de ingrediente */}
      <Dialog open={isIngredientModalOpen} onOpenChange={setIsIngredientModalOpen}>
        <DialogContent className="bg-[#F0F0D7]">
          <DialogHeader>
            <DialogTitle className="text-[#727D73]">
              Cantidad de ingrediente
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-[#727D73]">
                Cantidad
              </label>
              <Input 
                type="number"
                value={ingredienteActual?.cantidad || 0}
                onChange={(e) => setIngredienteActual(prev => ({
                  ...prev,
                  cantidad: parseFloat(e.target.value) || 0
                }))}
                className="col-span-3 bg-white border-[#AAB99A]"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-[#727D73]">
                Unidad
              </label>
              <select
                value={ingredienteActual?.unidad || 'unidad'}
                onChange={(e) => setIngredienteActual(prev => ({
                  ...prev,
                  unidad: e.target.value
                }))}
                className="col-span-3 bg-white border-[#AAB99A] rounded-md p-2"
                required
              >
                <option value="g">Gramos (g)</option>
                <option value="kg">Kilogramos (kg)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="l">Litros (l)</option>
                <option value="unidad">Unidades</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsIngredientModalOpen(false)}
              className="border-[#727D73] text-[#727D73] hover:bg-[#D0DDD0]"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => {
                handleMoveIngredientes('right', ingredienteActual);
                setIsIngredientModalOpen(false);
              }}
              className="bg-[#727D73] text-[#F0F0D7] hover:bg-[#727D73]/90"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para cantidad de producto */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="bg-[#F0F0D7]">
          <DialogHeader>
            <DialogTitle className="text-[#727D73]">
              Cantidad de producto
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-[#727D73]">
                Cantidad
              </label>
              <Input 
                type="number"
                value={productoActual?.cantidad || 1}
                onChange={(e) => setProductoActual(prev => ({
                  ...prev,
                  cantidad: parseInt(e.target.value) || 1
                }))}
                className="col-span-3 bg-white border-[#AAB99A]"
                min="1"
                step="1"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsProductModalOpen(false)}
              className="border-[#727D73] text-[#727D73] hover:bg-[#D0DDD0]"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => {
                handleMoveProductos('right', productoActual);
                setIsProductModalOpen(false);
              }}
              className="bg-[#727D73] text-[#F0F0D7] hover:bg-[#727D73]/90"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Producto;