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

import {
 createCategoria,
 getCategorias,
 updateCategoria,
 deleteCategoria,
 toggleCategoriaActive
} from '../../services/categoriasService';
import { useConfirm } from '../../context/ConfirmContext';

const TabButton = ({ isActive, onClick, children }) => (
 <button
   onClick={onClick}
   className={`px-4 py-2 text-sm font-medium rounded-md transition-colors 
     ${isActive 
       ? 'bg-[#727D73] text-[#F0F0D7]' 
       : 'text-[#727D73] hover:bg-[#D0DDD0]'}`}
 >
   {children}
 </button>
);

export const Categorias = () => {
  const { showConfirm } = useConfirm();
 const [categorias, setCategorias] = useState([]);
 const [searchTerm, setSearchTerm] = useState('');
 const [isLoading, setIsLoading] = useState(true);
 const [isDialogOpen, setIsDialogOpen] = useState(false);
 const [editingCategoria, setEditingCategoria] = useState(null);
 const [activeTab, setActiveTab] = useState('productos');
 const [formData, setFormData] = useState({
   nombre: '',
   ingrediente: false,
   active: true
 });

 useEffect(() => {
   loadCategorias();
 }, []);

 useEffect(() => {
   const handleForceUpdate = () => {
     if (isDialogOpen) {
       setIsDialogOpen(false);
       requestAnimationFrame(() => {
         setIsDialogOpen(true);
       });
     }
   };

   const handleFocus = () => {
     handleForceUpdate();
   };

   window.electronAPI?.onForceUpdate?.(handleForceUpdate);
   window.electronAPI?.onWindowFocus?.(handleFocus);

   return () => {
     window.electronAPI?.removeListeners?.();
   };
 }, [isDialogOpen]);

 const loadCategorias = async () => {
   try {
     setIsLoading(true);
     const data = await getCategorias();
     setCategorias(data);
   } catch (error) {
     toast.error('Error al cargar las categorías');
   } finally {
     setIsLoading(false);
   }
 };

 const handleSubmit = async (e) => {
   e.preventDefault();
   try {
     const dataToSend = {
       ...formData,
       ingrediente: activeTab === 'ingredientes'
     };

     if (editingCategoria) {
       await updateCategoria(editingCategoria._id, dataToSend);
       toast.success('Categoría actualizada correctamente');
     } else {
       await createCategoria(dataToSend);
       toast.success('Categoría creada correctamente');
     }
     handleCloseDialog();
     loadCategorias();
   } catch (error) {
     toast.error(error.message || 'Error al procesar la operación');
   }
 };

 const handleDelete = async (id) => {
    showConfirm('Eliminar Categoria',
      '¿Estas seguro que quieres eliminar esta categoria?',
      async ()=>{ try {
        await deleteCategoria(id);
        toast.success('Categoría eliminada correctamente');
        setFormData({
          nombre: '',
          ingrediente: activeTab === 'ingredientes',
          active: true
        });
        setEditingCategoria(null);
        await loadCategorias();
      } catch (error) {
        toast.error('Error al eliminar la categoría');
      }}
    )
 };


 const handleToggleActive = async (id) => {
   try {
     await toggleCategoriaActive(id);
     loadCategorias();
   } catch (error) {
     toast.error('Error al cambiar el estado de la categoría');
   }
 };

 const handleOpenDialog = (categoria = null) => {
   if (categoria) {
     setFormData({
       nombre: categoria.nombre || '',
       ingrediente: categoria.ingrediente || activeTab === 'ingredientes',
       active: typeof categoria.active === 'boolean' ? categoria.active : true
     });
     setEditingCategoria(categoria);
   } else {
     setFormData({
       nombre: '',
       ingrediente: activeTab === 'ingredientes',
       active: true
     });
     setEditingCategoria(null);
   }
   setIsDialogOpen(true);
 };

 const handleCloseDialog = () => {
   setEditingCategoria(null);
   setFormData({
     nombre: '',
     ingrediente: activeTab === 'ingredientes',
     active: true
   });
   setIsDialogOpen(false);
 };

 const filteredCategorias = categorias
   .filter(categoria => categoria.ingrediente === (activeTab === 'ingredientes'))
   .filter(categoria => categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

 return (
   <div className="space-y-4">
     <ToastContainer />
     
     {/* Tabs */}
     <div className="border-b border-[#AAB99A] mb-4">
       <div className="flex space-x-4">
         <TabButton
           isActive={activeTab === 'productos'}
           onClick={() => setActiveTab('productos')}
         >
           Productos
         </TabButton>
         <TabButton
           isActive={activeTab === 'ingredientes'}
           onClick={() => setActiveTab('ingredientes')}
         >
           Ingredientes
         </TabButton>
       </div>
     </div>

     {/* Barra superior con búsqueda y botón de agregar */}
     <div className="flex justify-between items-center">
       <div className="relative">
         <Input
           type="text"
           placeholder="Buscar categoría..."
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
         Nueva Categoría
       </Button>
     </div>

     {/* Tabla de categorías */}
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
           ) : filteredCategorias.length === 0 ? (
             <tr>
               <td colSpan="3" className="text-center py-4">No se encontraron categorías</td>
             </tr>
           ) : (
             filteredCategorias.map((categoria) => (
               <tr key={categoria._id} className="border-t border-[#AAB99A] hover:bg-[#D0DDD0]">
                 <td className="px-4 py-3">{categoria.nombre}</td>
                 <td className="px-4 py-3 text-center">
                   <button
                     onClick={() => handleToggleActive(categoria._id)}
                     className={`inline-flex items-center px-2 py-1 rounded-full text-xs
                       ${categoria.active 
                         ? 'bg-green-100 text-green-800' 
                         : 'bg-red-100 text-red-800'}`}
                   >
                     {categoria.active ? (
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
                       onClick={() => handleOpenDialog(categoria)}
                       className="text-[#727D73] hover:text-[#727D73]/90 hover:bg-[#D0DDD0]"
                     >
                       <Edit className="w-4 h-4" />
                     </Button>
                     <Button 
                       variant="ghost" 
                       size="sm"
                       onClick={() => handleDelete(categoria._id)}
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

     {/* Modal para crear/editar categoría */}
     <Dialog 
       open={isDialogOpen} 
       onOpenChange={(open) => {
         if (!open) handleCloseDialog();
       }}
     >
       <DialogContent 
         className="bg-[#F0F0D7] max-w-md"
         onInteractOutside={(e) => e.preventDefault()}
       >
         <DialogHeader>
           <DialogTitle className="text-[#727D73]">
             {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
           </DialogTitle>
         </DialogHeader>
         
         <form onSubmit={handleSubmit} className="grid gap-4 py-4">
           <div className="grid grid-cols-4 items-center gap-4">
             <label className="text-sm font-medium text-[#727D73]">
               Nombre
             </label>
             <Input 
               name="nombre"
               autoFocus
               value={formData.nombre}
               onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
               className="col-span-3 bg-white border-[#AAB99A]" 
               required
               onClick={(e) => e.target.focus()}
               onFocus={(e) => {
                 e.target.select();
                 e.target.focus();
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
               {editingCategoria ? 'Guardar Cambios' : 'Crear Categoría'}
             </Button>
           </DialogFooter>
         </form>
       </DialogContent>
     </Dialog>
   </div>
 );
};