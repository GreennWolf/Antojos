import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit, Trash2, Check, X, ArrowRight, ArrowLeft, RefreshCw, MoveRight, Eye } from 'lucide-react';
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
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getZonas } from '../../services/zonasService';

import {
  createSubCategoria,
  getSubCategorias,
  updateSubCategoria,
  deleteSubCategoria,
  toggleSubCategoriaActive,
} from '../../services/subCategoriasService';
import { getCategorias } from '../../services/categoriasService';
import { getIngredientes } from '../../services/ingredientesService';
import { useConfirm } from '../../context/ConfirmContext';

export const SubCategorias = () => {
  const { showConfirm } = useConfirm();
  const inputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Estados principales
  const [subCategorias, setSubCategorias] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingSubCategoria, setEditingSubCategoria] = useState(null);
  const [viewingSubCategoria, setViewingSubCategoria] = useState(null);

  // Estados para el manejo de ingredientes
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState([]);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState([]);
  const [todosLosIngredientes, setTodosLosIngredientes] = useState([]);
  const [zonas, setZonas] = useState([]);
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    iva: 10,
    active: true,
    ingredientesPermitidos: [],
    Zona: '' // Agregamos este campo
  });

  // Efecto inicial para cargar datos
  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para cargar todos los datos necesarios
  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      const [categoriasData, subCategoriasData, ingredientesData, zonasData] = await Promise.all([
        getCategorias(),
        getSubCategorias(),
        getIngredientes(),
        getZonas()
      ]);
      
      setCategorias(categoriasData.filter(cat => cat.ingrediente == false));
      setSubCategorias(subCategoriasData);
      setTodosLosIngredientes(ingredientesData);
      setIngredientesDisponibles(ingredientesData.map(ing => ({...ing, selected: false})));
      setZonas(zonasData);
    } catch (error) {
      toast.error('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejadores de vista detalle
  const handleOpenViewDialog = (subCategoria) => {
    setViewingSubCategoria(subCategoria);
    setIsViewDialogOpen(true);
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
    if (!formData.categoria) {
      toast.error('Debe seleccionar una categoría');
      return;
    }
    try {
      const dataToSend = {
        ...formData,
        ingredientesPermitidos: ingredientesSeleccionados.map(ing => ing._id)
      };

      if (editingSubCategoria) {
        await updateSubCategoria(editingSubCategoria._id, dataToSend);
        toast.success('Subcategoría actualizada correctamente');
      } else {
        await createSubCategoria(dataToSend);
        toast.success('Subcategoría creada correctamente');
      }
      handleCloseDialog();
      cargarDatos();
    } catch (error) {
      toast.error(error.message || 'Error al procesar la operación');
    }
};

  const handleDelete = async (id) => {
    showConfirm(
      'Eliminar Subcategoría',
      '¿Estás seguro de eliminar esta subcategoría?',
      async () => {
        try {
          await deleteSubCategoria(id);
          toast.success('Subcategoría eliminada correctamente');
          await cargarDatos();
        } catch (error) {
          toast.error('Error al eliminar la subcategoría');
        }
      }
    );
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleSubCategoriaActive(id);
      cargarDatos();
    } catch (error) {
      toast.error('Error al cambiar el estado de la subcategoría');
    }
  };

  // Funciones para manejar el diálogo
  const handleOpenDialog = (subCategoria = null) => {
    if (subCategoria) {
      const permitidosIds = subCategoria.ingredientesPermitidos.map(ing => 
        typeof ing === 'string' ? ing : ing._id
      );
      
      const selectedIngs = todosLosIngredientes.filter(ing => 
        permitidosIds.includes(ing._id)
      );
      const availableIngs = todosLosIngredientes.filter(ing => 
        !permitidosIds.includes(ing._id)
      );
  
      setFormData({
        nombre: subCategoria.nombre,
        descripcion: subCategoria.descripcion,
        categoria: subCategoria.categoria?._id || '',
        iva: subCategoria.iva,
        active: subCategoria.active,
        ingredientesPermitidos: subCategoria.ingredientesPermitidos || [],
        Zona: subCategoria.Zona?._id || '' // Agregamos esto
      });
  
      setEditingSubCategoria(subCategoria);
      setIngredientesSeleccionados(selectedIngs.map(ing => ({...ing, selected: false})));
      setIngredientesDisponibles(availableIngs.map(ing => ({...ing, selected: false})));
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        categoria: '',
        iva: 10,
        active: true,
        ingredientesPermitidos: [],
        Zona: '' // Agregamos esto
      });
      setEditingSubCategoria(null);
      setIngredientesSeleccionados([]);
      const resetIngs = todosLosIngredientes.map(ing => ({...ing, selected: false}));
      setIngredientesDisponibles(resetIngs);
    }
    
    setIsDialogOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSubCategoria(null);
    setFormData({
      nombre: '',
      descripcion: '',
      categoria: '',
      iva: 10,
      active: true,
      ingredientesPermitidos: []
    });
  };

  // Funciones para la gestión de ingredientes
  const handleResetIngredientes = () => {
    setIngredientesDisponibles(todosLosIngredientes.map(ing => ({...ing, selected: false})));
    setIngredientesSeleccionados([]);
    setFormData(prev => ({
      ...prev,
      ingredientesPermitidos: []
    }));
  };

  const handleTransferirTodos = () => {
    setIngredientesSeleccionados(todosLosIngredientes.map(ing => ({...ing, selected: false})));
    setIngredientesDisponibles([]);
    setFormData(prev => ({
      ...prev,
      ingredientesPermitidos: todosLosIngredientes.map(ing => ing._id)
    }));
  };

  const handleMoveIngredientes = (direction) => {
    if (direction === 'right') {
      const toMove = ingredientesDisponibles.filter(ing => ing.selected);
      setIngredientesSeleccionados(prev => [...prev, ...toMove.map(ing => ({...ing, selected: false}))]);
      setIngredientesDisponibles(prev => prev.filter(ing => !ing.selected));
      setFormData(prev => ({
        ...prev,
        ingredientesPermitidos: [...prev.ingredientesPermitidos, ...toMove.map(ing => ing._id)]
      }));
    } else {
      const toMove = ingredientesSeleccionados.filter(ing => ing.selected);
      setIngredientesDisponibles(prev => [...prev, ...toMove.map(ing => ({...ing, selected: false}))]);
      setIngredientesSeleccionados(prev => prev.filter(ing => !ing.selected));
      // Aquí está el cambio principal
      const moveIds = toMove.map(ing => ing._id);
      setFormData(prev => ({
        ...prev,
        ingredientesPermitidos: prev.ingredientesPermitidos.filter(id => !moveIds.includes(id))
      }));
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

  // Filtrado de subcategorías
  const filteredSubCategorias = subCategorias.filter(subCategoria => {
    const searchString = searchTerm.toLowerCase();
    return (
      subCategoria.nombre.toLowerCase().includes(searchString) ||
      subCategoria.categoria?.nombre?.toLowerCase().includes(searchString) ||
      subCategoria.Zona?.nombre?.toLowerCase().includes(searchString) ||
      subCategoria.iva?.toString().includes(searchString)
    );
  });

  return (
    <div className="space-y-4">
      <ToastContainer />

      {/* Barra superior */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar subcategoría..."
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
          Nueva Subcategoría
        </Button>
      </div>

      {/* Tabla de subcategorías */}
      <div className="overflow-x-auto rounded-lg border border-[#AAB99A]">
        <table className="w-full">
          <thead>
            <tr className="bg-[#AAB99A] bg-opacity-30">
              <th className="px-4 py-3 text-left text-sm font-medium text-[#727D73]">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#727D73]">Categoría</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#727D73]">Zona</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#727D73]">IVA</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-[#727D73]">Estado</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-[#727D73]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">Cargando...</td>
              </tr>
            ) : filteredSubCategorias.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">No se encontraron subcategorías</td>
              </tr>
            ) : (
              filteredSubCategorias.map((subCategoria) => (
                <tr key={subCategoria._id} 
                    className="border-t border-[#AAB99A] hover:bg-[#D0DDD0] cursor-pointer"
                    onClick={() => handleOpenViewDialog(subCategoria)}>
                  <td className="px-4 py-3">{subCategoria.nombre}</td>
                  <td className="px-4 py-3">{subCategoria.categoria?.nombre}</td>
                  <td className="px-4 py-3">{subCategoria.Zona.nombre}</td>
                  <td className="px-4 py-3">{subCategoria.iva}%</td>
                  <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleToggleActive(subCategoria._id)}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs
                        ${subCategoria.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'}`}
                    >
                  {subCategoria.active ? (
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
                              onClick={() => handleOpenDialog(subCategoria)}
                              className="text-[#727D73] hover:text-[#727D73]/90 hover:bg-[#D0DDD0]"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar Subcategoría</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete(subCategoria._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Eliminar Subcategoría</p>
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
              Detalles de Subcategoría
            </DialogTitle>
          </DialogHeader>
          
          {viewingSubCategoria && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-[#727D73]">Información General</h3>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Nombre:</span> {viewingSubCategoria.nombre}</p>
                    <p><span className="font-medium">Categoría:</span> {viewingSubCategoria.categoria?.nombre}</p>
                    <p><span className="font-medium">Zona de Impresión:</span> {viewingSubCategoria.Zona?.nombre}</p>
                    <p><span className="font-medium">IVA:</span> {viewingSubCategoria.iva}%</p>
                    <p><span className="font-medium">Estado:</span> {viewingSubCategoria.active ? 'Activo' : 'Inactivo'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-[#727D73]">Ingredientes Permitidos</h3>
                  <div className="mt-2 max-h-60 overflow-y-auto border rounded-md p-2 bg-white">
                    {viewingSubCategoria.ingredientesPermitidos?.length > 0 ? (
                      viewingSubCategoria.ingredientesPermitidos.map(ingrediente => (
                        <div key={ingrediente._id} className="py-1">
                          {ingrediente.nombre}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No hay ingredientes permitidos</p>
                    )}
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

      {/* Modal de crear/editar subcategoría */}
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
              {editingSubCategoria ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Columna izquierda */}
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
                    Categoría
                  </label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    className="col-span-3 bg-white border-[#AAB99A] rounded-md p-2"
                    required
                  >
                    <option value="">Seleccione una categoría</option>
                    {categorias.length > 0 ? (
                      categorias
                        .filter(cat => cat.active)
                        .map(categoria => (
                          <option key={categoria._id} value={categoria._id}>
                            {categoria.nombre}
                          </option>
                        ))
                    ) : (
                      <option value="" disabled>Cargando categorías...</option>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-sm font-medium text-[#727D73]">
                    Zona de Impresión
                  </label>
                  <select
                    name="Zona"
                    value={formData.Zona}
                    onChange={handleInputChange}
                    className="col-span-3 bg-white border-[#AAB99A] rounded-md p-2"
                    required
                  >
                    <option value="">Seleccione una zona</option>
                    {zonas.length > 0 ? (
                      zonas
                        .filter(zona => zona.active)
                        .map(zona => (
                          <option key={zona._id} value={zona._id}>
                            {zona.nombre}
                          </option>
                        ))
                    ) : (
                      <option value="" disabled>Cargando zonas...</option>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-sm font-medium text-[#727D73]">
                    IVA
                  </label>
                  <Input 
                    type="number"
                    name="iva"
                    value={formData.iva}
                    onChange={handleInputChange}
                    className="col-span-3 bg-white border-[#AAB99A]"
                    min="0"
                    max="100"
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

              {/* Columna derecha - Selector de ingredientes */}
              <div className="border-l border-[#AAB99A] pl-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-[#727D73]">Ingredientes Permitidos</h3>
                  <div className="flex space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            onClick={handleResetIngredientes}
                            variant="outline"
                            size="sm"
                            className="text-[#727D73]"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Reiniciar ingredientes</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            onClick={handleTransferirTodos}
                            variant="outline"
                            size="sm"
                            className="text-[#727D73]"
                          >
                            <MoveRight className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Transferir todos los ingredientes</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <div className="flex space-x-4">
                  {/* Lista de ingredientes disponibles */}
                  <div className="flex-1 space-y-2">
                    <h4 className="text-sm text-[#727D73]">Disponibles</h4>
                    <div className="h-64 overflow-y-auto border rounded-md p-2 bg-white">
                      {ingredientesDisponibles.map(ingrediente => (
                        <div
                          key={ingrediente._id}
                          onClick={() => handleSelectIngrediente(ingrediente, 'disponibles')}
                          className={`p-2 cursor-pointer rounded-md ${
                            ingrediente.selected ? 'bg-[#D0DDD0]' : 'hover:bg-gray-100'
                          }`}
                        >
                          {ingrediente.nombre}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botones de transferencia */}
                  <div className="flex flex-col justify-center space-y-2">
                    <Button
                      type="button"
                      onClick={() => handleMoveIngredientes('right')}
                      className="bg-[#727D73] text-[#F0F0D7]"
                      size="sm"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleMoveIngredientes('left')}
                      className="bg-[#727D73] text-[#F0F0D7]"
                      size="sm"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Lista de ingredientes seleccionados */}
                  <div className="flex-1 space-y-2">
                    <h4 className="text-sm text-[#727D73]">Seleccionados</h4>
                    <div className="h-64 overflow-y-auto border rounded-md p-2 bg-white">
                      {ingredientesSeleccionados.map(ingrediente => (
                        <div
                          key={ingrediente._id}
                          onClick={() => handleSelectIngrediente(ingrediente, 'seleccionados')}
                          className={`p-2 cursor-pointer rounded-md ${
                            ingrediente.selected ? 'bg-[#D0DDD0]' : 'hover:bg-gray-100'
                          }`}
                        >
                          {ingrediente.nombre}
                        </div>
                      ))}
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
                {editingSubCategoria ? 'Guardar Cambios' : 'Crear Subcategoría'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};