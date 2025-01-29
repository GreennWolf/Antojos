import React from 'react';

const CategoriasList = ({
  categorias,
  categoriaActiva,
  onCategoriaClick
}) => {
  if (!categorias || categorias.length === 0) {
    return (
      <div className="p-2 text-sm text-gray-500 text-center">
        No hay categorías disponibles
      </div>
    );
  }

  return (
    <div className="overflow-y-auto flex-1">
      {categorias.map((categoria) => (
        <button
          key={categoria._id}
          onClick={() => onCategoriaClick(categoria._id)}
          className={`
            w-full text-left px-2 py-1.5 text-sm transition-colors
            ${categoriaActiva === categoria._id
              ? 'bg-[#727D73] text-white'
              : 'text-[#727D73] hover:bg-[#D0DDD0]'
            }
            ${!categoria.active && 'opacity-50 cursor-not-allowed'}
          `}
          disabled={!categoria.active}
        >
          <div className="flex items-center justify-between">
            <span>{categoria.nombre}</span>
            {categoria.productsCount > 0 && (
              <span className={`
                text-xs px-1.5 py-0.5 rounded-full
                ${categoriaActiva === categoria._id
                  ? 'bg-white text-[#727D73]'
                  : 'bg-[#727D73] text-white'
                }
              `}>
                {categoria.productsCount}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default CategoriasList;