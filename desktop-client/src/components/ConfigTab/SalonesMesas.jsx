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

// Importar servicios
import { 
  createSalon, 
  getSalones, 
  updateSalon, 
  deleteSalon, 
  toggleSalonActive 
} from '../../services/salonesService';

import { 
  createMesa, 
  getMesasBySalon, 
  updateMesa, 
  deleteMesa, 
  toggleMesaActive 
} from '../../services/mesasService';
import { useConfirm } from '../../context/ConfirmContext';

export const SalonesMesas = () => {
  const { showConfirm } = useConfirm();
  // Estados para salones
  const [salones, setSalones] = useState([]);
  const [searchSalon, setSearchSalon] = useState('');
  const [dialogSalonOpen, setDialogSalonOpen] = useState(false);
  const [salonForm, setSalonForm] = useState({ nombre: '', active: true });
  const [editingSalon, setEditingSalon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para mesas
  const [mesas, setMesas] = useState([]);
  const [searchMesa, setSearchMesa] = useState('');
  const [dialogMesaOpen, setDialogMesaOpen] = useState(false);
  const [mesaForm, setMesaForm] = useState({ numero: '', salon: '', active: true });
  const [editingMesa, setEditingMesa] = useState(null);
  const [salonSeleccionado, setSalonSeleccionado] = useState(null);

  // Cargar salones al inicio
  useEffect(() => {
    loadSalones();
  }, []);

  // Cargar mesas cuando se selecciona un salón
  useEffect(() => {
    if (salonSeleccionado) {
      loadMesas(salonSeleccionado._id);
    } else {
      setMesas([]);
    }
  }, [salonSeleccionado]);

  // Funciones para salones
  const loadSalones = async () => {
    try {
      setIsLoading(true);
      const data = await getSalones();
      setSalones(data);
    } catch (error) {
      toast.error('Error al cargar salones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalonSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSalon) {
        await updateSalon(editingSalon._id, salonForm);
        toast.success('Salón actualizado correctamente', {
          position: "top-right",
          autoClose: 3000
        });
      } else {
        await createSalon(salonForm);
        toast.success('Salón creado correctamente', {
          position: "top-right",
          autoClose: 3000
        });
      }
      setDialogSalonOpen(false);
      loadSalones();
      resetSalonForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al procesar la operación');
    }
  };

  const handleDeleteSalon = async (id) => {
    showConfirm('Eliminar Salon',
      '¿Estás seguro de eliminar este salón?',
      async ()=>{
        try {
          await deleteSalon(id);
          toast.success('Salón eliminado correctamente');
          loadSalones();
          if (salonSeleccionado?._id === id) {
            setSalonSeleccionado(null);
          }
        } catch (error) {
          toast.error('Error al eliminar el salón');
        }
      }
    )
  };

  const handleToggleSalon = async (id) => {
    try {
      await toggleSalonActive(id);
      loadSalones();
    } catch (error) {
      toast.error('Error al cambiar el estado del salón');
    }
  };

  // Funciones para mesas
  const loadMesas = async (salonId) => {
    try {
      const data = await getMesasBySalon(salonId);
      setMesas(data);
    } catch (error) {
      toast.error('Error al cargar mesas');
    }
  };

  const handleMesaSubmit = async (e) => {
    e.preventDefault();
    try {
      const mesaData = {
        ...mesaForm,
        salon: salonSeleccionado._id
      };

      if (editingMesa) {
        await updateMesa(editingMesa._id, mesaData);
        toast.success('Mesa actualizada correctamente');
      } else {
        await createMesa(mesaData);
        toast.success('Mesa creada correctamente');
      }
      setDialogMesaOpen(false);
      loadMesas(salonSeleccionado._id);
      resetMesaForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al procesar la operación');
    }
  };

  const handleDeleteMesa = async (id) => {
    showConfirm('Eliminar Mesa',
      '¿Estás seguro de eliminar esta Mesa?',
      async ()=>{
        try {
          await deleteMesa(id);
          toast.success('Mesa eliminada correctamente');
          loadMesas(salonSeleccionado._id);
        } catch (error) {
          toast.error('Error al eliminar la mesa');
        }
      }
    )
  };

  const handleToggleMesa = async (id) => {
    try {
      await toggleMesaActive(id);
      loadMesas(salonSeleccionado._id);
    } catch (error) {
      toast.error('Error al cambiar el estado de la mesa');
    }
  };

  // Funciones auxiliares
  const resetSalonForm = () => {
    setSalonForm({ nombre: '', active: true });
    setEditingSalon(null);
  };

  const resetMesaForm = () => {
    setMesaForm({ numero: '', salon: '', active: true });
    setEditingMesa(null);
  };

  const handleSalonSelected = (salon) => {
    // Si el salón que se clickea es el mismo que ya está seleccionado, lo deseleccionamos
    if (salonSeleccionado?._id === salon._id) {
      setSalonSeleccionado(null);
      setMesas([]); // Limpiamos las mesas mostradas
      return;
    }
  
    // Si es un salón diferente o no hay ninguno seleccionado, lo seleccionamos
    setSalonSeleccionado(salon);
  };

  const filteredSalones = salones.filter(salon => 
    salon.nombre.toLowerCase().includes(searchSalon.toLowerCase())
  );

  const filteredMesas = mesas.filter(mesa => 
    mesa.numero.toString().includes(searchMesa)
  );
  return (
    <div className="space-y-8 flex gap-8 ">
      <ToastContainer />
      
      {/* Sección de Salones */}
      <div className="space-y-4 w-1/2">
        <div className="flex flex-col gap-6 justify-between items-center">
          <h2 className="text-xl font-semibold text-[#727D73]">Salones</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar salón..."
                value={searchSalon}
                onChange={(e) => setSearchSalon(e.target.value)}
                className="pl-10 pr-4 py-2 border border-[#AAB99A] rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-[#727D73] bg-[#F0F0D7]"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-[#727D73]" />
            </div>
            <Button 
              onClick={() => {
                resetSalonForm();
                setDialogSalonOpen(true);
              }}
              className="flex items-center bg-[#727D73] text-[#F0F0D7] hover:bg-[#727D73]/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Salón
            </Button>
          </div>
        </div>

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
              ) : filteredSalones.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4">No se encontraron salones</td>
                </tr>
              ) : (
                filteredSalones.map((salon) => (
                  <tr 
                    key={salon._id} 
                    className={`border-t border-[#AAB99A] hover:bg-[#AAB99A] cursor-pointer
                      ${salonSeleccionado?._id === salon._id ? 'bg-[#AAB99A]' : ''}`}
                    onClick={() => handleSalonSelected(salon)}
                  >
                    <td className="px-4 py-3">{salon.nombre}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSalon(salon._id);
                        }}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs
                          ${salon.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'}`}
                      >
                        {salon.active ? (
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSalon(salon);
                            setSalonForm(salon);
                            setDialogSalonOpen(true);
                          }}
                          className="text-[#727D73] hover:text-[#727D73]/90 hover:bg-[#D0DDD0]"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSalon(salon._id);
                          }}
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
      </div>

      {/* Sección de Mesas */}
      <div className="space-y-4 w-1/2">
        <div className="flex flex-col gap-6 justify-between items-center">
          <h2 className="text-xl font-semibold text-[#727D73]">
            Mesas {salonSeleccionado ? `- ${salonSeleccionado.nombre}` : ''}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar mesa..."
                value={searchMesa}
                onChange={(e) => setSearchMesa(e.target.value)}
                className="pl-10 pr-4 py-2 border border-[#AAB99A] rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-[#727D73] bg-[#F0F0D7]"
                disabled={!salonSeleccionado}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-[#727D73]" />
            </div>
            <Button 
              onClick={() => {
                resetMesaForm();
                setDialogMesaOpen(true);
              }}
              className="flex items-center bg-[#727D73] text-[#F0F0D7] hover:bg-[#727D73]/90"
              disabled={!salonSeleccionado}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Mesa
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[#AAB99A]">
          <table className="w-full">
            <thead>
              <tr className="bg-[#AAB99A] bg-opacity-30">
                <th className="px-4 py-3 text-left text-sm font-medium text-[#727D73]">Número</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-[#727D73]">Estado</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-[#727D73]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!salonSeleccionado ? (
                <tr>
                  <td colSpan="3" className="text-center py-4">Seleccione un salón para ver sus mesas</td>
                </tr>
              ) : filteredMesas.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4">No se encontraron mesas</td>
                </tr>
              ) : (
                filteredMesas.map((mesa) => (
                  <tr key={mesa._id} className="border-t border-[#AAB99A] hover:bg-[#D0DDD0]">
                    <td className="px-4 py-3">Mesa {mesa.numero}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleMesa(mesa._id)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs
                          ${mesa.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'}`}
                      >
                        {mesa.active ? (
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
                          onClick={() => {
                            setEditingMesa(mesa);
                            setMesaForm(mesa);
                            setDialogMesaOpen(true);
                          }}
                          className="text-[#727D73] hover:text-[#727D73]/90 hover:bg-[#D0DDD0]"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteMesa(mesa._id)}
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
      </div>

      {/* Diálogo para Salones */}
      <Dialog open={dialogSalonOpen} onOpenChange={setDialogSalonOpen}>
        <DialogContent className="bg-[#F0F0D7] max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSalon ? 'Editar Salón' : 'Nuevo Salón'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSalonSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#727D73]">Nombre</label>
              <Input
                value={salonForm.nombre}
                onChange={(e) => setSalonForm({ ...salonForm, nombre: e.target.value })}
                className="mt-1 bg-white border-[#AAB99A]"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={salonForm.active}
                onCheckedChange={(checked) => setSalonForm({ ...salonForm, active: checked })}
              />
              <span className="text-sm text-[#727D73]">
                {salonForm.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogSalonOpen(false)}
                className="border-[#727D73] text-[#727D73] hover:bg-[#D0DDD0]"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-[#727D73] text-[#F0F0D7] hover:bg-[#727D73]/90"
              >
                {editingSalon ? 'Guardar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para Mesas */}
      <Dialog open={dialogMesaOpen} onOpenChange={setDialogMesaOpen}>
        <DialogContent className="bg-[#F0F0D7] max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMesa ? 'Editar Mesa' : 'Nueva Mesa'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMesaSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#727D73]">Número</label>
              <Input
                type="number"
                value={mesaForm.numero}
                onChange={(e) => setMesaForm({ ...mesaForm, numero: e.target.value })}
                className="mt-1 bg-white border-[#AAB99A]"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={mesaForm.active}
                onCheckedChange={(checked) => setMesaForm({ ...mesaForm, active: checked })}
              />
              <span className="text-sm text-[#727D73]">
                {mesaForm.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogMesaOpen(false)}
                className="border-[#727D73] text-[#727D73] hover:bg-[#D0DDD0]"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-[#727D73] text-[#F0F0D7] hover:bg-[#727D73]/90"
              >
                {editingMesa ? 'Guardar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )};