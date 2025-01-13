import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit, Trash2, Check, X, ArrowRight, ArrowLeft, RefreshCw, MoveRight } from 'lucide-react';
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
  const [editingProducto, setEditingProducto] = useState(null);
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

  // Manejadores del formulario
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

  // Funciones para el manejo del diálogo principal
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
      const selectedIngs = producto.ingredientes.map(ing => ({
        ...ing.ingrediente,
        cantidad: ing.cantidad,
        unidad: ing.unidad,
        selected: false
      }));
      const availableIngs = todosLosIngredientes.filter(ing => 
        !producto.ingredientes.some(i => i.ingrediente._id === ing._id)
      ).map(ing => ({...ing, selected: false}));
      
      setIngredientesSeleccionados(selectedIngs);
      setIngredientesDisponibles(availableIngs);

      // Configurar productos relacionados
      const selectedProds = producto.productos.map(prod => ({
        ...prod.producto,
        cantidad: prod.cantidad,
        selected: false
      }));
      const availableProds = productos.filter(p => 
        p._id !== producto._id && 
        !producto.productos.some(pr => pr.producto._id === p._id)
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
  };

  // Funciones para el manejo de ingredientes
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
        // Mover un ingrediente específico (desde el modal)
        const ingToMove = { ...ingrediente, selected: false };
        setIngredientesSeleccionados(prev => [...prev, ingToMove]);
        setIngredientesDisponibles(prev => 
          prev.filter(ing => ing._id !== ingrediente._id)
        );
      } else {
        // Mover todos los ingredientes seleccionados
        const toMove = ingredientesDisponibles.filter(ing => ing.selected);
        setIngredientesSeleccionados(prev => [...prev, ...toMove.map(ing => ({...ing, selected: false}))]);
        setIngredientesDisponibles(prev => prev.filter(ing => !ing.selected));
      }
    } else {
      // Mover de seleccionados a disponibles (izquierda)
      const toMove = ingredientesSeleccionados.filter(ing => ing.selected);
      setIngredientesDisponibles(prev => [...prev, ...toMove.map(ing => ({...ing, selected: false}))]);
      setIngredientesSeleccionados(prev => prev.filter(ing => !ing.selected));
    }
  };
  
  // También necesitamos la función handleMoveProductos
  const handleMoveProductos = (direction, producto = null) => {
    if (direction === 'right') {
      if (producto) {
        // Mover un producto específico (desde el modal)
        const prodToMove = { ...producto, selected: false };
        setProductosSeleccionados(prev => [...prev, prodToMove]);
        setProductosDisponibles(prev => 
          prev.filter(prod => prod._id !== producto._id)
        );
      } else {
        // Mover todos los productos seleccionados
        const toMove = productosDisponibles.filter(prod => prod.selected);
        setProductosSeleccionados(prev => [...prev, ...toMove.map(prod => ({...prod, selected: false}))]);
        setProductosDisponibles(prev => prev.filter(prod => !prod.selected));
      }
    } else {
      // Mover de seleccionados a disponibles (izquierda)
      const toMove = productosSeleccionados.filter(prod => prod.selected);
      setProductosDisponibles(prev => [...prev, ...toMove.map(prod => ({...prod, selected: false}))]);
      setProductosSeleccionados(prev => prev.filter(prod => !prod.selected));
    }
  };

  // Funciones para la gestión de selección y movimiento
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
            onFocus={(e) => {
              e.currentTarget.select();
            }}
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
            ) : productos.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">No se encontraron productos</td>
              </tr>
            ) : (
              productos.map((producto) => (
                <tr key={producto._id} 
                    className="border-t border-[#AAB99A] hover:bg-[#D0DDD0]">
                  <td className="px-4 py-3">{producto.nombre}</td>
                  <td className="px-4 py-3">{producto.subCategoria?.nombre}</td>
                  <td className="px-4 py-3 text-right">
                    {producto.precio?.toLocaleString('es-es', { style: 'currency', currency: 'eur' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {producto.costo?.toLocaleString('es-es', { style: 'currency', currency: 'eur' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {producto.stockActual} / {producto.stockMinimo}
                  </td>
                  <td className="px-4 py-3 text-center">
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
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleOpenDialog(producto)}
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
                              onClick={() => handleDelete(producto._id)}
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
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Columna izquierda - Datos básicos */}
              <div className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-sm font-medium text-[#727D73]">
                    Nombre
                  </label>
                  <Input 
                    ref={inputRef}
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="col-span-3 bg-white border-[#AAB99A]" 
                    required
                    onFocus={(e) => {
                      e.currentTarget.select();
                    }}
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-sm font-medium text-[#727D73]">
                    Subcategoría
                  </label>
                  <select
                    name="subCategoria"
                    value={formData.subCategoria}
                    onChange={handleInputChange}
                    className="col-span-3 bg-white border-[#AAB99A] rounded-md p-2"
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

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-sm font-medium text-[#727D73]">
                    Precio
                  </label>
                  <Input 
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    className="col-span-3 bg-white border-[#AAB99A]"
                    min="0"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-sm font-medium text-[#727D73]">
                    Costo
                  </label>
                  <Input 
                    type="number"
                    name="costo"
                    value={formData.costo}
                    onChange={handleInputChange}
                    className="col-span-3 bg-white border-[#AAB99A]"
                    min="0"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-sm font-medium text-[#727D73]">
                    Stock Actual
                  </label>
                  <Input 
                    type="number"
                    name="stockActual"
                    value={formData.stockActual}
                    onChange={handleInputChange}
                    className="col-span-3 bg-white border-[#AAB99A]"
                    min="0"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-sm font-medium text-[#727D73]">
                    Stock Mínimo
                  </label>
                  <Input 
                    type="number"
                    name="stockMinimo"
                    value={formData.stockMinimo}
                    onChange={handleInputChange}
                    className="col-span-3 bg-white border-[#AAB99A]"
                    min="0"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-sm font-medium text-[#727D73]">
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
              {/* Columna derecha - Ingredientes y Productos */}
              <div className="border-l border-[#AAB99A] pl-4 space-y-4">
                <div className="space-y-4">
                  {/* Sección de Ingredientes */}
                  <div>
                    <h3 className="text-sm font-medium text-[#727D73] mb-2">Ingredientes</h3>
                    <div className="flex space-x-4">
                      {/* Lista de ingredientes disponibles */}
                      <div className="flex-1">
                        <h4 className="text-xs text-[#727D73] mb-1">Disponibles</h4>
                        <div className="h-32 overflow-y-auto border rounded-md p-2 bg-white">
                          {ingredientesDisponibles.map(ingrediente => (
                            <div
                              key={ingrediente._id}
                              onClick={() => handleSelectIngrediente(ingrediente, 'disponibles')}
                              className={`p-1 cursor-pointer text-sm rounded-md ${
                                ingrediente.selected ? 'bg-[#D0DDD0]' : 'hover:bg-gray-100'
                              }`}
                            >
                              {ingrediente.nombre}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Botones de movimiento */}
                      <div className="flex flex-col justify-center space-y-2">
                        <Button
                          type="button"
                          onClick={() => {
                            const selectedIngs = ingredientesDisponibles.filter(ing => ing.selected);
                            selectedIngs.forEach(ing => handleIngredienteModalOpen(ing));
                          }}
                          className="bg-[#727D73] text-[#F0F0D7]"
                          size="sm"
                          disabled={!ingredientesDisponibles.some(ing => ing.selected)}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleMoveIngredientes('left')}
                          className="bg-[#727D73] text-[#F0F0D7]"
                          size="sm"
                          disabled={!ingredientesSeleccionados.some(ing => ing.selected)}
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Lista de ingredientes seleccionados */}
                      <div className="flex-1">
                        <h4 className="text-xs text-[#727D73] mb-1">Seleccionados</h4>
                        <div className="h-32 overflow-y-auto border rounded-md p-2 bg-white">
                          {ingredientesSeleccionados.map(ingrediente => (
                            <div
                              key={ingrediente._id}
                              onClick={() => handleSelectIngrediente(ingrediente, 'seleccionados')}
                              className={`p-1 cursor-pointer text-sm rounded-md ${
                                ingrediente.selected ? 'bg-[#D0DDD0]' : 'hover:bg-gray-100'
                              }`}
                            >
                              {ingrediente.nombre} - {ingrediente.cantidad} {ingrediente.unidad}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Sección de Productos */}
                  <div>
                    <h3 className="text-sm font-medium text-[#727D73] mb-2">Productos Relacionados</h3>
                    <div className="flex space-x-4">
                      {/* Lista de productos disponibles */}
                      <div className="flex-1">
                        <h4 className="text-xs text-[#727D73] mb-1">Disponibles</h4>
                        <div className="h-32 overflow-y-auto border rounded-md p-2 bg-white">
                          {productosDisponibles.map(producto => (
                            <div
                              key={producto._id}
                              onClick={() => handleSelectProducto(producto, 'disponibles')}
                              className={`p-1 cursor-pointer text-sm rounded-md ${
                                producto.selected ? 'bg-[#D0DDD0]' : 'hover:bg-gray-100'
                              }`}
                            >
                              {producto.nombre}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Botones de movimiento */}
                      <div className="flex flex-col justify-center space-y-2">
                        <Button
                          type="button"
                          onClick={() => {
                            const selectedProds = productosDisponibles.filter(p => p.selected);
                            selectedProds.forEach(p => handleProductoModalOpen(p));
                          }}
                          className="bg-[#727D73] text-[#F0F0D7]"
                          size="sm"
                          disabled={!productosDisponibles.some(p => p.selected)}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleMoveProductos('left')}
                          className="bg-[#727D73] text-[#F0F0D7]"
                          size="sm"
                          disabled={!productosSeleccionados.some(p => p.selected)}
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Lista de productos seleccionados */}
                      <div className="flex-1">
                        <h4 className="text-xs text-[#727D73] mb-1">Seleccionados</h4>
                        <div className="h-32 overflow-y-auto border rounded-md p-2 bg-white">
                          {productosSeleccionados.map(producto => (
                            <div
                              key={producto._id}
                              onClick={() => handleSelectProducto(producto, 'seleccionados')}
                              className={`p-1 cursor-pointer text-sm rounded-md ${
                                producto.selected ? 'bg-[#D0DDD0]' : 'hover:bg-gray-100'
                              }`}
                            >
                              {producto.nombre} - {producto.cantidad} unidades
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
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
      {/* Modal para cantidad de producto relacionado */}
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