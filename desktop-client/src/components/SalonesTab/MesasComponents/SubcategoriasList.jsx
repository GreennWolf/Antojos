import React from 'react';

const SubcategoriasList = ({
  subcategorias,
  categoriaActiva,
  subcategoriaActiva,
  onSubcategoriaClick
}) => {
  const subcategoriasFiltradas = subcategorias.filter(
    subcat => subcat.categoria._id === categoriaActiva && subcat.active
  );

  if (!categoriaActiva) {
    return (
      <div className="p-2 text-sm text-gray-500 text-center">
        Seleccione una categoría
      </div>
    );
  }

  if (subcategoriasFiltradas.length === 0) {
    return (
      <div className="p-2 text-sm text-gray-500 text-center">
        No hay subcategorías disponibles
      </div>
    );
  }

  return (
    <div className="border-t border-[#AAB99A] overflow-y-auto flex-1">
      {subcategoriasFiltradas.map((subcategoria) => (
        <button
          key={subcategoria._id}
          onClick={() => onSubcategoriaClick(subcategoria._id)}
          className={`
            w-full text-left px-2 py-1.5 text-sm transition-colors
            ${subcategoriaActiva === subcategoria._id
              ? 'bg-[#727D73] text-white'
              : 'text-[#727D73] hover:bg-[#D0DDD0]'
            }
            ${!subcategoria.active && 'opacity-50 cursor-not-allowed'}
          `}
          disabled={!subcategoria.active}
        >
          <div className="flex items-center justify-between">
            <span>{subcategoria.nombre}</span>
            {subcategoria.productsCount > 0 && (
              <span className={`
                text-xs px-1.5 py-0.5 rounded-full
                ${subcategoriaActiva === subcategoria._id
                  ? 'bg-white text-[#727D73]'
                  : 'bg-[#727D73] text-white'
                }
              `}>
                {subcategoria.productsCount}
              </span>
            )}
          </div>

          {subcategoria.precioBase > 0 && (
            <div className="text-xs opacity-75">
              Desde {subcategoria.precioBase.toLocaleString('es-ES', {
                style: 'currency',
                currency: 'EUR'
              })}
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default SubcategoriasList;