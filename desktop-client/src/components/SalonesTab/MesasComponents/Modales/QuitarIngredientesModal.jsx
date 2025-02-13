// QuitarIngredientesModal.jsx
import React from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";

const QuitarIngredientesModal = ({
  isOpen,
  onClose,
  producto,
  ingredientes, // Lista de ingredientes permitidos (por ejemplo, de la subcategoría)
  onIngredienteSelect,
}) => {
  if (!producto) return null;

  /**
   * Armamos un arreglo de "ingredientes quitables" combinando:
   * - Los ingredientes base del producto (producto.producto.ingredientes)
   * - Los ingredientes extras (producto.ingredientes.extras)
   * Cada entrada contiene:
   *    - ingrediente: objeto con _id y nombre (nos aseguramos de que sea un objeto)
   *    - cantidadBase: cantidad original (de la receta base)
   *    - cantidadExtra: cantidad agregada como extra
   */
  const ingredientesQuitables = [
    // Ingredientes base del producto
    ...(producto.producto.ingredientes?.map(ing => {
      // Si ing.ingrediente es un string, lo envolvemos en un objeto.
      const ingredienteObj =
        typeof ing.ingrediente === 'string'
          ? { _id: ing.ingrediente }
          : { ...ing.ingrediente };
      return {
        ingrediente: ingredienteObj,
        cantidadBase: ing.cantidad,
        cantidadExtra: 0,
      };
    }) || []),
    // Ingredientes extras agregados al producto
    ...((producto.ingredientes.extras || []).map(extra => ({
      ingrediente: {
        _id: extra.ingrediente,
        nombre: extra.nombre,
      },
      cantidadBase: 0,
      cantidadExtra: extra.cantidad,
    })))
  ].reduce((acc, curr) => {
    // Si el ingrediente ya existe, sumamos las cantidades
    const existente = acc.find(item =>
      item.ingrediente._id.toString() === curr.ingrediente._id.toString()
    );
    if (existente) {
      existente.cantidadBase += curr.cantidadBase;
      existente.cantidadExtra += curr.cantidadExtra;
    } else {
      acc.push(curr);
    }
    return acc;
  }, []);

  // Filtramos para que queden solo los ingredientes que estén en la lista de permitidos
  const ingredientesPermitidosIds = ingredientes.map(item => item._id.toString());
  const ingredientesFiltradosPermitidos = ingredientesQuitables.filter(ing =>
    ingredientesPermitidosIds.includes(ing.ingrediente._id.toString())
  );

  // Actualizamos el nombre basado en la lista de ingredientes permitidos
  const ingredientesConNombreActualizado = ingredientesFiltradosPermitidos.map(ing => {
    const ingredientePermitido = ingredientes.find(
      item => item._id.toString() === ing.ingrediente._id.toString()
    );
    return {
      ...ing,
      ingrediente: {
        ...ing.ingrediente,
        nombre: ingredientePermitido ? ingredientePermitido.nombre : ing.ingrediente.nombre
      }
    };
  });

  // Filtramos los ingredientes que aún tienen cantidad disponible para quitar.
  // Se tiene en cuenta si ya han sido "excluidos" (quitados).
  const ingredientesFinales = ingredientesConNombreActualizado.filter(ing => {
    const exclusionExistente = (producto.ingredientes.excluidos || []).find(
      exc => exc.ingrediente.toString() === ing.ingrediente._id.toString()
    );
    const cantidadTotal = ing.cantidadBase + ing.cantidadExtra;
    // Se muestra el ingrediente si no existe exclusión o si la cantidad excluida es menor al total.
    return !exclusionExistente || (exclusionExistente.cantidad < cantidadTotal);
  });

  // console.log(ingredientes,ingredientesFiltradosPermitidos,ingredientesFinales)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay 
          className="bg-black/80" 
          onClick={(e) => e.stopPropagation()}
        />
        <DialogContent
          className="bg-[#F0F0D7] border border-[#AAB99A]"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold leading-none tracking-tight text-[#727D73]">
              Quitar ingredientes de {producto.producto.nombre}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-4 gap-2 p-4">
            {ingredientesFinales.length > 0 ? (
              ingredientesFinales.map((ing) => {
                // Buscamos si existe exclusión para este ingrediente
                const exclusionExistente = (producto.ingredientes.excluidos || []).find(
                  exc => exc.ingrediente.toString() === ing.ingrediente._id.toString()
                );
                const cantidadTotal = ing.cantidadBase + ing.cantidadExtra;
                const cantidadDisponible = cantidadTotal - (exclusionExistente?.cantidad || 0);

                return (
                  <button
                    key={ing.ingrediente._id}
                    onClick={() => onIngredienteSelect(ing.ingrediente)}
                    className="p-2 bg-white rounded border border-[#AAB99A] text-[#727D73] 
                      hover:bg-[#D0DDD0] transition-colors text-sm flex flex-col items-center"
                  >
                    <span>{ing.ingrediente.nombre}</span>
                    <span className="text-xs text-gray-500">
                      Disponible: {cantidadDisponible}
                      {exclusionExistente && (
                        <span className="text-red-500 ml-1">
                          (-{exclusionExistente.cantidad})
                        </span>
                      )}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="col-span-4 text-center text-[#727D73] p-4">
                No hay ingredientes disponibles para quitar
              </div>
            )}
          </div>

          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 
              transition-opacity hover:opacity-100 focus:outline-none 
              focus:ring-2 focus:ring-[#AAB99A] focus:ring-offset-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </button>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default QuitarIngredientesModal;
