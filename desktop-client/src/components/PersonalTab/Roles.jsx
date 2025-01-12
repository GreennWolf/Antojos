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
  createRol,
  getRoles,
  updateRol,
  deleteRol,
  toggleRolActive,
  getAllPrivileges,
  updateRolPermissions
} from '../../services/rolesService';
import { useConfirm } from '../../context/ConfirmContext';
import { toast } from 'react-toastify';

export const Roles = () => {
  const { showConfirm } = useConfirm();
  const inputRef = useRef(null);
  const searchInputRef = useRef(null);
  const descripcionRef = useRef(null);

  // Estados
  const [roles, setRoles] = useState([]);
  const [privileges, setPrivileges] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    active: true,
    permisos: {}
  });

  // Efecto para manejar el foco de la ventana
  useEffect(() => {
    const handleWindowFocus = () => {
      if (document.activeElement === searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
    };

    window.electronAPI?.onWindowFocus(handleWindowFocus);

    return () => {
      window.electronAPI?.removeListeners?.();
    };
  }, []);

  // Cargar roles y privilegios
  useEffect(() => {
    loadRolesAndPrivileges();
  }, []);

  const loadRolesAndPrivileges = async () => {
    try {
      setIsLoading(true);
      const [rolesData, privilegesData] = await Promise.all([
        getRoles(),
        getAllPrivileges()
      ]);
      setRoles(rolesData);
      setPrivileges(privilegesData);
    } catch (error) {
      toast.error('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejadores de formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTogglePermiso = (categoria, permiso) => {
    setFormData(prev => ({
      ...prev,
      permisos: {
        ...prev.permisos,
        [categoria]: {
          ...prev.permisos[categoria],
          [permiso]: !prev.permisos[categoria]?.[permiso]
        }
      }
    }));
  };

  // Acciones CRUD
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await updateRol(editingRole._id, formData);
        await updateRolPermissions(editingRole._id, formData.permisos);
        toast.success('Rol actualizado correctamente');
      } else {
        await createRol(formData);
        toast.success('Rol creado correctamente');
      }
      handleCloseDialog();
      loadRolesAndPrivileges();
    } catch (error) {
      toast.error(error.message || 'Error al procesar la operación');
    }
  };

  const handleDelete = async (id) => {
    showConfirm(
      'Eliminar Rol',
      '¿Estás seguro de eliminar este Rol?',
      async () => {
        try {
          await deleteRol(id);
          toast.success('Rol eliminado correctamente');
          await loadRolesAndPrivileges();
        } catch (error) {
          toast.error('Error al eliminar el rol');
        }
      }
    );
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleRolActive(id);
      loadRolesAndPrivileges();
    } catch (error) {
      toast.error('Error al cambiar el estado del rol');
    }
  };

  const handleOpenDialog = (role = null) => {
    if (role) {
      setFormData({
        nombre: role.nombre,
        descripcion: role.descripcion,
        active: role.active,
        permisos: role.permisos
      });
      setEditingRole(role);
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        active: true,
        permisos: {}
      });
      setEditingRole(null);
    }
    setIsDialogOpen(true);
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 100);
  };

  const handleCloseDialog = () => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
    setEditingRole(null);
    setFormData({
      nombre: '',
      descripcion: '',
      active: true,
      permisos: {}
    });
    setIsDialogOpen(false);
  };

  // Filtrado de roles
  const filteredRoles = roles.filter(role => 
    role.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="space-y-4">
      {/* Barra superior */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar rol..."
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
          Nuevo Rol
        </Button>
      </div>

      {/* Tabla de roles */}
      <div className="overflow-x-auto rounded-lg border border-[#AAB99A]">
        <table className="w-full">
          <thead>
            <tr className="bg-[#AAB99A] bg-opacity-30">
              <th className="px-4 py-3 text-left text-sm font-medium text-[#727D73]">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#727D73]">Descripción</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[#727D73]">Creado por</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-[#727D73]">Estado</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-[#727D73]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">Cargando...</td>
              </tr>
            ) : filteredRoles.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">No se encontraron roles</td>
              </tr>
            ) : (
              filteredRoles.map((role) => (
                <tr key={role._id} className="border-t border-[#AAB99A] hover:bg-[#D0DDD0]">
                  <td className="px-4 py-3">{role.nombre}</td>
                  <td className="px-4 py-3">{role.descripcion}</td>
                  <td className="px-4 py-3">{role.createdBy?.nombre || 'Sistema'}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleActive(role._id)}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs
                        ${role.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'}`}
                    >
                      {role.active ? (
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
                        onClick={() => handleOpenDialog(role)}
                        className="text-[#727D73] hover:text-[#727D73]/90 hover:bg-[#D0DDD0]"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(role._id)}
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

      {/* Modal de crear/editar rol */}
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          if (!open) handleCloseDialog();
        }}
      >
        <DialogContent 
          className="bg-[#F0F0D7] max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-[#727D73]">
              {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    descripcionRef.current?.focus();
                  }
                }}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium text-[#727D73]">
                Descripción
              </label>
              <Input 
                ref={descripcionRef}
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                className="col-span-3 bg-white border-[#AAB99A]" 
                required
                onFocus={(e) => {
                  e.currentTarget.select();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    handleCloseDialog();
                  }
                }}
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
                  Activo
                </span>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-[#727D73] block mb-2">
                Privilegios
              </label>
              <div className="bg-white p-4 rounded-md border border-[#AAB99A] max-h-60 overflow-y-auto">
                <div className="space-y-4">
                  {Object.entries(privileges).map(([categoria, permisos]) => (
                    <div key={categoria}>
                      <h4 className="font-medium text-[#727D73] mb-2">
                        {categoria}
                      </h4>
                      <div className="ml-4 space-y-2">
                        {Object.entries(permisos).map(([permiso, descripcion]) => (
                          <label key={permiso} className="flex items-center space-x-2">
                            <input 
                              type="checkbox"
                              checked={formData.permisos[categoria]?.[permiso] || false}
                              onChange={() => handleTogglePermiso(categoria, permiso)}
                              className="rounded border-[#AAB99A]"
                            />
                            <span className="text-sm text-[#727D73]">{descripcion}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
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
                {editingRole ? 'Guardar Cambios' : 'Crear Rol'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};