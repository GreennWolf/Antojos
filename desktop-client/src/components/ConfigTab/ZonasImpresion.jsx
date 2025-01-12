import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Check, X, Printer as PrinterIcon } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePrinters } from '../../hooks/usePrinters';
import { useConfirm } from '../../context/ConfirmContext';

import { 
  createZona,
  getZonas,
  updateZona,
  deleteZona,
  toggleZonaActive
} from '../../services/zonasService';

export const ZonasImpresion = () => {
  const { showConfirm } = useConfirm();
  // Estados
  const [zonas, setZonas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZona, setEditingZona] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    impresora: '',
    cobro: false,
    active: true
  });

  // Cargar impresoras disponibles
  const { printers, isLoading: loadingPrinters } = usePrinters();

  // Cargar zonas al inicio
  useEffect(() => {
    loadZonas();
  }, []);

  const loadZonas = async () => {
    try {
      setIsLoading(true);
      const data = await getZonas();
      setZonas(data);
    } catch (error) {
      toast.error('Error al cargar las zonas de impresión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.impresora) {
      toast.error('Debe seleccionar una impresora');
      return;
    }

    try {
      if (editingZona) {
        await updateZona(editingZona._id, formData);
        toast.success('Zona de impresión actualizada correctamente');
      } else {
        await createZona(formData);
        toast.success('Zona de impresión creada correctamente');
      }
      handleCloseDialog();
      loadZonas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al procesar la operación');
    }
  };

  const handleDelete = async (id) => {
    showConfirm('Eliminar Zona de Impresion',
      '¿Estas seguro que quieres eliminar esta zona?',
      async ()=>{
        try {
          await deleteZona(id);
          toast.success('Zona de impresión eliminada correctamente');
          loadZonas();
        } catch (error) {
          toast.error('Error al eliminar la zona de impresión');
        }
      }
    )
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleZonaActive(id);
      loadZonas();
    } catch (error) {
      toast.error('Error al cambiar el estado de la zona de impresión');
    }
  };

  const handleOpenDialog = (zona = null) => {
    if (zona) {
      setFormData({
        nombre: zona.nombre,
        impresora: zona.impresora,
        cobro: zona.cobro,
        active: zona.active
      });
      setEditingZona(zona);
    } else {
      setFormData({
        nombre: '',
        impresora: '',
        cobro: false,
        active: true
      });
      setEditingZona(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingZona(null);
    setFormData({
      nombre: '',
      impresora: '',
      cobro: false,
      active: true
    });
    setIsDialogOpen(false);
  };

  const filteredZonas = zonas.filter(zona => 
    zona.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="space-y-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      {/* Header con búsqueda y botón de agregar */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar zona de impresión..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-[#AAB99A] rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-[#727D73] bg-[#F0F0D7]"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-[#727D73]" />
        </div>
        <Button 
          onClick={() => handleOpenDialog()}
          className="flex items-center bg-[#727D73] text-[#F0F0D7] hover:bg-[#727D73]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Zona
        </Button>
      </div>

      {/* Tabla de zonas de impresión */}
      <div className="overflow-x-auto rounded-lg border border-[#AAB99A]">
        <table className="w-full">
          <thead>
            <tr className="bg-[#AAB99A] bg-opacity-30">
              <th className="px-4 py-3 text-left text-sm font-medium text-[#727D73]">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#727D73]">Impresora</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#727D73]">Cobro</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-[#727D73]">Estado</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-[#727D73]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" className="text-center py-4">Cargando...</td>
              </tr>
            ) : filteredZonas.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4">No se encontraron zonas de impresión</td>
              </tr>
            ) : (
              filteredZonas.map((zona) => (
                <tr key={zona._id} className="border-t border-[#AAB99A] hover:bg-[#D0DDD0]">
                  <td className="px-4 py-3">{zona.nombre}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <PrinterIcon className="w-4 h-4 mr-2 text-[#727D73]" />
                      {zona.impresora}
                    </div>
                  </td>
                  <td className="px-4 py-3">{zona.cobro ? 'SI' : 'NO'}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleActive(zona._id)}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs
                        ${zona.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'}`}
                    >
                      {zona.active ? (
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleOpenDialog(zona)}
                        className="text-[#727D73] hover:text-[#727D73]/90 hover:bg-[#D0DDD0]"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(zona._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para crear/editar zona */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#F0F0D7] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#727D73]">
              {editingZona ? 'Editar Zona de Impresión' : 'Nueva Zona de Impresión'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-[#727D73]">
                Nombre
              </label>
              <Input 
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="col-span-3 bg-white border-[#AAB99A]" 
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-[#727D73]">
                Impresora
              </label>
              <Select 
                value={formData.impresora}
                onValueChange={(value) => setFormData(prev => ({ ...prev, impresora: value }))}
              >
                <SelectTrigger className="col-span-3 bg-white border-[#AAB99A]">
                  <SelectValue placeholder="Selecciona una impresora" />
                </SelectTrigger>
                <SelectContent>
                  {printers.map((printer) => (
                    <SelectItem key={printer.name} value={printer.name}>
                      {printer.displayName || printer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-[#727D73]">
                Zona de Cobro 
              </label>
              <div className="flex items-center space-x-2">
                <Switch 
                  className="bg-gray-400"
                  checked={formData.cobro}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, cobro: checked }))
                  }
                />
                <span className="text-sm text-[#727D73]">
                  {formData.cobro ? 'SI' : 'NO'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-[#727D73]">
                Estado
              </label>
              <div className="flex items-center space-x-2">
                <Switch 
                  className="bg-gray-400"
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
                {editingZona ? 'Guardar Cambios' : 'Crear Zona'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
};