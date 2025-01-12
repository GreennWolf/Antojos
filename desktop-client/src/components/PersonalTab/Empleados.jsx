import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { 
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  toggleUserActive
} from '../../services/userService';

import { getRoles } from '../../services/rolesService';
import { CodigoInput } from '../CodigoInput';
import { useConfirm } from '../../context/ConfirmContext';

export const Empleados = () => {
  const { showConfirm } = useConfirm();
  const [empleados, setEmpleados] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    rol: '',
    active: true
  });

  useEffect(() => {
    loadEmpleadosAndRoles();
  }, []);

  const loadEmpleadosAndRoles = async () => {
    try {
      setIsLoading(true);
      const [empleadosData, rolesData] = await Promise.all([
        getUsers(),
        getRoles()
      ]);
      setEmpleados(empleadosData);
      setRoles(rolesData);
    } catch (error) {
      toast.error('Error al cargar los datos', {
        title: "Error",
        position: "top-right",
        autoClose: 3000,
      });
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

  const isValidCode = (code) => {
    return code === '' || code.length >= 2;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!isValidCode(formData.codigo)) {
        toast.error('El código debe estar vacío o tener entre 2 y 4 dígitos', {
          title: "Error",
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (editingEmpleado) {
        await updateUser(editingEmpleado._id, formData);
        toast.success('Empleado actualizado correctamente', {
          title: "Éxito",
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        await createUser(formData);
        toast.success('Empleado creado correctamente', {
          title: "Éxito",
          position: "top-right",
          autoClose: 3000,
        });
      }
      handleCloseDialog();
      loadEmpleadosAndRoles();
    } catch (error) {
      toast.error( "Error al Actualiar o Crear Empleado", {
        title: "Error",
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleDelete = async (id) => {
    showConfirm('Eliminar Empleado',
      '¿Estás seguro de eliminar este empleado?',
      async ()=>{
        try {
          await deleteUser(id);
          toast.success('Empleado eliminado correctamente', {
            title: "Éxito",
            position: "top-right",
            autoClose: 3000,
          });
          loadEmpleadosAndRoles();
        } catch (error) {
          toast.error('Error al eliminar empleado', {
            title: "Error",
            position: "top-right",
            autoClose: 3000,
          });
        }
      }

    )
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleUserActive(id);
      loadEmpleadosAndRoles();
    } catch (error) {
      toast.error('Error al cambiar el estado del empleado', {
        title: "Error",
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleOpenDialog = (empleado = null) => {
    if (empleado) {
      setFormData({
        nombre: empleado.nombre,
        codigo: empleado.codigo,
        rol: empleado.rol._id,
        active: empleado.active
      });
      setEditingEmpleado(empleado);
    } else {
      setFormData({
        nombre: '',
        codigo: '',
        rol: '',
        active: true
      });
      setEditingEmpleado(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingEmpleado(null);
    setFormData({
      nombre: '',
      codigo: '',
      rol: '',
      active: true
    });
    setIsDialogOpen(false);
  };

  const filteredEmpleados = empleados.filter(empleado => 
    empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase())
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
      
      <div className="flex justify-between items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar empleado..."
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
          Nuevo Empleado
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#AAB99A]">
        <table className="w-full">
          <thead>
            <tr className="bg-[#AAB99A] bg-opacity-30">
              <th className="px-4 py-3 text-left text-sm font-medium text-[#727D73]">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#727D73]">Rol</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-[#727D73]">Estado</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-[#727D73]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">Cargando...</td>
              </tr>
            ) : filteredEmpleados.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">No se encontraron empleados</td>
              </tr>
            ) : (
              filteredEmpleados.map((empleado) => (
                <tr key={empleado._id} className="border-t border-[#AAB99A] hover:bg-[#D0DDD0]">
                  <td className="px-4 py-3">{empleado.nombre}</td>
                  <td className="px-4 py-3">{empleado.rol?.nombre || 'Sin rol'}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleActive(empleado._id)}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs
                        ${empleado.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'}`}
                    >
                      {empleado.active ? (
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
                        onClick={() => handleOpenDialog(empleado)}
                        className="text-[#727D73] hover:text-[#727D73]/90 hover:bg-[#D0DDD0]"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(empleado._id)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#F0F0D7] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#727D73]">
              {editingEmpleado ? 'Editar Empleado' : 'Nuevo Empleado'}
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
              <CodigoInput
                value={formData.codigo}
                onChange={(value) => setFormData(prev => ({ ...prev, codigo: value }))}
                disabled={false}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-[#727D73]">
                Rol
              </label>
              <Select 
                value={formData.rol}
                onValueChange={(value) => setFormData(prev => ({ ...prev, rol: value }))}
              >
                <SelectTrigger className="col-span-3 bg-white border-[#AAB99A]">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((rol) => (
                    <SelectItem key={rol._id} value={rol._id}>
                      {rol.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                disabled={formData?.codigo?.length === 1}
                className="bg-[#727D73] text-[#F0F0D7] hover:bg-[#727D73]/90 disabled:opacity-50"
              >
                {editingEmpleado ? 'Guardar Cambios' : 'Crear Empleado'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};