import React, { useState, useEffect } from 'react';
import { Edit, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { createOrUpdateComercio, getComercio, uploadLogo } from '../../services/comercioService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const EditableField = ({ label, value, name, onSave, type = "text" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleSave = async () => {
    try {
      await onSave(name, tempValue);
      setIsEditing(false);
    } catch (error) {
      toast.error('Error al guardar el cambio');
    }
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-[#AAB99A]">
      <div className="flex flex-col flex-1">
        <span className="text-sm font-medium text-[#727D73]">{label}</span>
        {isEditing ? (
          <input
            type={type}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="mt-1 px-2 py-1 border border-[#AAB99A] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#727D73]"
            required
          />
        ) : (
          <span className="mt-1">{value || '---'}</span>
        )}
      </div>
      <div>
        {isEditing ? (
          <div className="flex space-x-2">
            <button onClick={handleCancel} className="p-1 text-red-600 hover:bg-red-50 rounded">
              <X className="w-4 h-4" />
            </button>
            <button onClick={handleSave} className="p-1 text-green-600 hover:bg-green-50 rounded">
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="p-1 text-[#727D73] hover:bg-[#D0DDD0] rounded">
            <Edit className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const ImageUploader = ({ initialImage, onSave }) => {
  const [previewUrl, setPreviewUrl] = useState(initialImage || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (initialImage) {
      setPreviewUrl(initialImage);
    }
  }, [initialImage]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validaciones
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB');
      return;
    }

    // Guardar el archivo seleccionado
    setSelectedFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // Notificar al componente padre
    onSave(file);
  };

  return (
    <div className="p-4 border-b border-[#AAB99A]">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium text-[#727D73]">Logo del Comercio</span>
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#727D73] text-[#F0F0D7] hover:bg-[#727D73]/90"
        >
          {previewUrl ? 'Cambiar Logo' : 'Subir Logo'}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />
      </div>

      <div className="relative w-48 h-48 mx-auto border border-[#AAB99A] rounded-lg overflow-hidden">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Logo del comercio"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#727D73]">
            Sin logo
          </div>
        )}
      </div>
    </div>
  );
};

const EditableDireccion = ({ direccion, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempDireccion, setTempDireccion] = useState(direccion || {
    calle: '',
    numero: '',
    codigoPostal: '',
    localidad: '',
    provincia: ''
  });

  useEffect(() => {
    setTempDireccion(direccion || {
      calle: '',
      numero: '',
      codigoPostal: '',
      localidad: '',
      provincia: ''
    });
  }, [direccion]);

  const handleSave = async () => {
    try {
      await onSave('direccionFiscal', tempDireccion);
      setIsEditing(false);
    } catch (error) {
      toast.error('Error al guardar la dirección');
    }
  };

  const handleCancel = () => {
    setTempDireccion(direccion);
    setIsEditing(false);
  };

  return (
    <div className="p-4 border-b border-[#AAB99A]">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-[#727D73]">Dirección Fiscal</span>
        {isEditing ? (
          <div className="flex space-x-2">
            <button onClick={handleCancel} className="p-1 text-red-600 hover:bg-red-50 rounded">
              <X className="w-4 h-4" />
            </button>
            <button onClick={handleSave} className="p-1 text-green-600 hover:bg-green-50 rounded">
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="p-1 text-[#727D73] hover:bg-[#D0DDD0] rounded">
            <Edit className="w-4 h-4" />
          </button>
        )}
      </div>
      {isEditing ? (
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <label className="text-sm text-[#727D73]">Calle</label>
            <Input
              value={tempDireccion.calle || ''}
              onChange={(e) => setTempDireccion({...tempDireccion, calle: e.target.value})}
              className="border-[#AAB99A]"
              required
            />
          </div>
          <div>
            <label className="text-sm text-[#727D73]">Número</label>
            <Input
              value={tempDireccion.numero || ''}
              onChange={(e) => setTempDireccion({...tempDireccion, numero: e.target.value})}
              className="border-[#AAB99A]"
              required
            />
          </div>
          <div>
            <label className="text-sm text-[#727D73]">Código Postal</label>
            <Input
              value={tempDireccion.codigoPostal || ''}
              onChange={(e) => setTempDireccion({...tempDireccion, codigoPostal: e.target.value})}
              className="border-[#AAB99A]"
              required
            />
          </div>
          <div>
            <label className="text-sm text-[#727D73]">Localidad</label>
            <Input
              value={tempDireccion.localidad || ''}
              onChange={(e) => setTempDireccion({...tempDireccion, localidad: e.target.value})}
              className="border-[#AAB99A]"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm text-[#727D73]">Provincia</label>
            <Input
              value={tempDireccion.provincia || ''}
              onChange={(e) => setTempDireccion({...tempDireccion, provincia: e.target.value})}
              className="border-[#AAB99A]"
              required
            />
          </div>
        </div>
      ) : (
        <p className="mt-2">
          {direccion ? `${direccion.calle}, ${direccion.numero}, ${direccion.codigoPostal} ${direccion.localidad}, ${direccion.provincia}` : '---'}
        </p>
      )}
    </div>
  );
};


export const Comercio = () => {
  const [comercio, setComercio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLogo, setSelectedLogo] = useState(null);

  useEffect(() => {
    loadComercio();
  }, []);

  const loadComercio = async () => {
    try {
      setLoading(true);
      const data = await getComercio();
      setComercio(data);
    } catch (error) {
      console.error('Error al cargar los datos del comercio:', error);
      setComercio(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComercio = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        nombre: e.target.nombre.value,
        razonSocial: e.target.razonSocial.value,
        nif: e.target.nif.value,
        direccionFiscal: {
          calle: e.target.calle.value,
          numero: e.target.numero.value,
          codigoPostal: e.target.codigoPostal.value,
          localidad: e.target.localidad.value,
          provincia: e.target.provincia.value
        },
        telefono: e.target.telefono.value,
        email: e.target.email.value
      };

      const data = await createOrUpdateComercio(formData);

      // Si hay logo seleccionado, subirlo después de crear el comercio
      if (selectedLogo) {
        await uploadLogo(selectedLogo);
      }

      setComercio(data);
      toast.success('Comercio configurado correctamente');
    } catch (error) {
      toast.error(error.message || 'Error al configurar el comercio');
    }
  };

  const handleSaveField = async (name, value) => {
    try {
      if (name === 'logo') {
        await uploadLogo(value);
        await loadComercio(); // Recargar los datos para obtener la nueva URL del logo
        toast.success('Logo actualizado correctamente');
      } else {
        const updatedData = await createOrUpdateComercio({
          ...comercio,
          [name]: value
        });
        setComercio(updatedData);
        toast.success('Dato actualizado correctamente');
      }
    } catch (error) {
      toast.error(error.message || 'Error al actualizar el dato');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Cargando...</div>;
  }

  // Si no hay comercio, mostrar el formulario inicial
  if (!comercio || !comercio.nombre) {
    return (
      <div className="max-w-2xl mx-auto">
        <form 
          onSubmit={handleCreateComercio}
          className="bg-white rounded-lg shadow p-6"
        >
          <h2 className="text-2xl font-semibold text-[#727D73] mb-6">
            Configurar Comercio
          </h2>

          <div className="space-y-6">
            <ImageUploader
              initialImage={null}
              onSave={setSelectedLogo}
            />

            <div>
              <label className="block text-sm font-medium text-[#727D73] mb-2">
                Nombre del Comercio
              </label>
              <Input
                name="nombre"
                className="border-[#AAB99A]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#727D73] mb-2">
                Razón Social
              </label>
              <Input
                name="razonSocial"
                className="border-[#AAB99A]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#727D73] mb-2">
                NIF
              </label>
              <Input
                name="nif"
                className="border-[#AAB99A]"
                required
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-[#727D73]">
                Dirección Fiscal
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#727D73] mb-2">Calle</label>
                  <Input
                    name="calle"
                    className="border-[#AAB99A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#727D73] mb-2">Número</label>
                  <Input
                    name="numero"
                    className="border-[#AAB99A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#727D73] mb-2">Código Postal</label>
                  <Input
                    name="codigoPostal"
                    className="border-[#AAB99A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#727D73] mb-2">Localidad</label>
                  <Input
                    name="localidad"
                    className="border-[#AAB99A]"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm text-[#727D73] mb-2">Provincia</label>
                  <Input
                    name="provincia"
                    className="border-[#AAB99A]"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#727D73] mb-2">
                Teléfono
              </label>
              <Input
                type="tel"
                name="telefono"
                className="border-[#AAB99A]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#727D73] mb-2">
                Email
              </label>
              <Input
                type="email"
                name="email"
                className="border-[#AAB99A]"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              className="bg-[#727D73] text-[#F0F0D7] hover:bg-[#727D73]/90"
            >
              Guardar Comercio
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Si hay comercio, mostrar la vista de edición
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-[#727D73] mb-6">
          Datos del Comercio
        </h2>
        
        <div className="space-y-4">
          <ImageUploader
            initialImage={comercio.logoUrl}
            onSave={(file) => handleSaveField('logo', file)}
          />

          <EditableField
            label="Nombre del Comercio"
            value={comercio.nombre}
            name="nombre"
            onSave={handleSaveField}
          />
          
          <EditableField
            label="Razón Social"
            value={comercio.razonSocial}
            name="razonSocial"
            onSave={handleSaveField}
          />
          
          <EditableField
            label="NIF"
            value={comercio.nif}
            name="nif"
            onSave={handleSaveField}
          />
          
          <EditableDireccion
            direccion={comercio.direccionFiscal}
            onSave={handleSaveField}
          />
          
          <EditableField
            label="Teléfono"
            value={comercio.telefono}
            name="telefono"
            type="tel"
            onSave={handleSaveField}
          />
          
          <EditableField
            label="Email"
            value={comercio.email}
            name="email"
            type="email"
            onSave={handleSaveField}
          />
        </div>
      </div>
    </div>
  );
};