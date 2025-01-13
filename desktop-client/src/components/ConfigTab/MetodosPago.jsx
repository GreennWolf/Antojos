import React, { useState, useEffect } from 'react';
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
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useConfirm } from '../../context/ConfirmContext';

import { 
  createMetodoPago,
  getMetodosPago,
  updateMetodoPago,
  deleteMetodoPago,
  toggleMetodoPagoActive
} from '../../services/metodosDePagoService';

export const MetodosPago = () => {
  // Estados
  const { showConfirm } = useConfirm();
  const [metodosPago, setMetodosPago] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMetodo, setEditingMetodo] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    active: true
  });

  // Cargar métodos al inicio
  useEffect(() => {
    loadMetodosPago();
  }, []);

  const loadMetodosPago = async () => {
    try {
      setIsLoading(true);
      const data = await getMetodosPago();
      setMetodosPago(data);
    } catch (error) {
      toast.error('Error al cargar los métodos de pago');
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
    try {
      if (editingMetodo) {
        await updateMetodoPago(editingMetodo._id, formData);
        toast.success('Método de pago actualizado correctamente');
      } else {
        await createMetodoPago(formData);
        toast.success('Método de pago creado correctamente');
      }
      handleCloseDialog();
      loadMetodosPago();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al procesar la operación');
    }
  };

  const handleDelete = async (id) => {
    showConfirm('eliminar metodo de pago',
      '¿Estás seguro de eliminar este método de pago?',
      async () =>{
        try {
          await deleteMetodoPago(id);
          toast.success('Método de pago eliminado correctamente');
          loadMetodosPago();
        } catch (error) {
          toast.error('Error al eliminar el método de pago');
        }
      }
    )

  };

  const handleToggleActive = async (id) => {
    try {
      await toggleMetodoPagoActive(id);
      loadMetodosPago();
    } catch (error) {
      toast.error('Error al cambiar el estado del método de pago');
    }
  };

  const handleOpenDialog = (metodo = null) => {
    if (metodo) {
      setFormData({
        nombre: metodo.nombre,
        active: metodo.active
      });
      setEditingMetodo(metodo);
    } else {
      setFormData({
        nombre: '',
        active: true
      });
      setEditingMetodo(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingMetodo(null);
    setFormData({
      nombre: '',
      active: true
    });
    setIsDialogOpen(false);
  };

  const filteredMetodos = metodosPago.filter(metodo => 
    metodo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Buscar método de pago..."
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
          Nuevo Método
        </Button>
      </div>

      {/* Tabla de métodos de pago */}
      <div className="overflow-x-auto rounded-lg border border-[#AAB99A]">
        <table className="w-full">
          <thead>
            <tr className="bg-[#AAB99A] bg-opacity-30">
              <th className="px-4 py-3 text-left text-sm font-medium text-[#727D73]">Nombre</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-[#727D73]">Estado</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-[#727D73]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="3" className="text-center py-4">Cargando...</td>
              </tr>
            ) : filteredMetodos.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-4">No se encontraron métodos de pago</td>
              </tr>
            ) : (
              filteredMetodos.map((metodo) => (
                <tr key={metodo._id} className="border-t border-[#AAB99A] hover:bg-[#D0DDD0]">
                  <td className="px-4 py-3">{metodo.nombre}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleActive(metodo._id)}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs
                        ${metodo.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'}`}
                    >
                      {metodo.active ? (
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
                        onClick={() => handleOpenDialog(metodo)}
                        className="text-[#727D73] hover:text-[#727D73]/90 hover:bg-[#D0DDD0]"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(metodo._id)}
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

      {/* Modal para crear/editar método de pago */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#F0F0D7] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#727D73]">
              {editingMetodo ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
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
                {editingMetodo ? 'Guardar Cambios' : 'Crear Método'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
};