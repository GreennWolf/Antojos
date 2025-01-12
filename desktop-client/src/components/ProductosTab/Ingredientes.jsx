import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit, Trash2, Check, X } from 'lucide-react';
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
  createIngrediente,
  getIngredientes,
  updateIngrediente,
  deleteIngrediente,
  toggleIngredienteActive,
} from '../../services/ingredientesService';
import { getCategorias } from '../../services/categoriasService';
import { useConfirm } from '../../context/ConfirmContext';

export const Ingredientes = () => {
  const { showConfirm } = useConfirm();
  const inputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Estados principales
  const [ingredientes, setIngredientes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIngrediente, setEditingIngrediente] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    precio: 0,
    costo: 0,
    stockActual: 0,
    stockMinimo: 0,
    categoria: '',
    active: true,
    ingredientes: []
  });

  // Efecto inicial para cargar datos
  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para cargar todos los datos necesarios
  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      const [categoriasData, ingredientesData] = await Promise.all([
        getCategorias(),
        getIngredientes()
      ]);
      
      setCategorias(categoriasData.filter(cat => cat.ingrediente));
      setIngredientes(ingredientesData);
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
      if (editingIngrediente) {
        await updateIngrediente(editingIngrediente._id, formData);
        toast.success('Ingrediente actualizado correctamente');
      } else {
        await createIngrediente(formData);
        toast.success('Ingrediente creado correctamente');
      }
      handleCloseDialog();
      cargarDatos();
    } catch (error) {
      toast.error(error.message || 'Error al procesar la operación');
    }
  };

  const handleDelete = async (id) => {
    showConfirm(
      'Eliminar Ingrediente',
      '¿Estás seguro de eliminar este ingrediente?',
      async () => {
        try {
          await deleteIngrediente(id);
          toast.success('Ingrediente eliminado correctamente');
          await cargarDatos();
        } catch (error) {
          toast.error('Error al eliminar el ingrediente');
        }
      }
    );
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleIngredienteActive(id);
      cargarDatos();
    } catch (error) {
      toast.error('Error al cambiar el estado del ingrediente');
    }
  };

  // Funciones para manejar el diálogo
  const handleOpenDialog = (ingrediente = null) => {
    if (ingrediente) {
      setFormData({
        nombre: ingrediente.nombre,
        precio: ingrediente.precio,
        costo: ingrediente.costo,
        stockActual: ingrediente.stockActual,
        stockMinimo: ingrediente.stockMinimo,
        categoria: ingrediente.categoria?._id || '',
        active: ingrediente.active,
        ingredientes: ingrediente.ingredientes || []
      });
      setEditingIngrediente(ingrediente);
    } else {
      setFormData({
        nombre: '',
        precio: 0,
        costo: 0,
        stockActual: 0,
        stockMinimo: 0,
        categoria: '',
        active: true,
        ingredientes: []
      });
      setEditingIngrediente(null);
    }
    setIsDialogOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingIngrediente(null);
    setFormData({
      nombre: '',
      precio: 0,
      costo: 0,
      stockActual: 0,
      stockMinimo: 0,
      categoria: '',
      active: true,
      ingredientes: []
    });
  };

  // Filtrado de ingredientes
  const filteredIngredientes = ingredientes.filter(ingrediente => {
    const searchString = searchTerm.toLowerCase();
    return (
      ingrediente.nombre.toLowerCase().includes(searchString) ||
      ingrediente.categoria?.nombre?.toLowerCase().includes(searchString) ||
      ingrediente.precio?.toString().includes(searchString) ||
      ingrediente.costo?.toString().includes(searchString)
    );
  });
  return (
    <div className="space-y-4">
      {/* Barra superior */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar ingrediente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-64"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-[#727D73]" />
        </div>
        <Button 
          onClick={() => handleOpenDialog()}
          className="flex items-center bg-[#727D73] text-[#F0F0D7] hover:bg-[#727D73]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Ingrediente
        </Button>
      </div>

      {/* Tabla de ingredientes */}
      <div className="overflow-x-auto rounded-lg border border-[#AAB99A]">
        <table className="w-full">
          <thead>
            <tr className="bg-[#AAB99A] bg-opacity-30">
              <th className="px-4 py-3 text-left text-sm font-medium text-[#727D73]">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#727D73]">Categoría</th>
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
            ) : filteredIngredientes.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">No se encontraron ingredientes</td>
              </tr>
            ) : (
              filteredIngredientes.map((ingrediente) => (
                <tr key={ingrediente._id} 
                    className="border-t border-[#AAB99A] hover:bg-[#D0DDD0]">
                  <td className="px-4 py-3">{ingrediente.nombre}</td>
                  <td className="px-4 py-3">{ingrediente.categoria?.nombre}</td>
                  <td className="px-4 py-3 text-right">
                    {ingrediente.precio?.toLocaleString('es-PY', { style: 'currency', currency: 'PYG' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {ingrediente.costo?.toLocaleString('es-PY', { style: 'currency', currency: 'PYG' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {ingrediente.stockActual} / {ingrediente.stockMinimo}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleActive(ingrediente._id)}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs
                        ${ingrediente.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'}`}
                    >
                      {ingrediente.active ? (
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
                              onClick={() => handleOpenDialog(ingrediente)}
                              className="text-[#727D73] hover:text-[#727D73]/90 hover:bg-[#D0DDD0]"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar Ingrediente</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete(ingrediente._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Eliminar Ingrediente</p>
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

      {/* Modal de crear/editar ingrediente */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#F0F0D7] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#727D73]">
              {editingIngrediente ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Primera columna */}
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
                    {categorias.map(categoria => (
                      <option key={categoria._id} value={categoria._id}>
                        {categoria.nombre}
                      </option>
                    ))}
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
              </div>

              {/* Segunda columna */}
              <div className="space-y-4">
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
                {editingIngrediente ? 'Guardar Cambios' : 'Crear Ingrediente'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
