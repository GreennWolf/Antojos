import React from 'react';
import CategoriasList from './CategoriasList';
import SubcategoriasList from './SubcategoriasList';

const CategoriasSidebar = ({
  categorias,
  subcategorias,
  categoriaActiva,
  subcategoriaActiva,
  onCategoriaClick,
  onSubcategoriaClick
}) => {
  return (
    <div className="w-32 bg-white border-r border-[#AAB99A] flex flex-col h-full">
      {/* Panel de Categorías */}
      <div className="h-1/2 flex flex-col">
        <div className="px-2 py-1.5 bg-[#F0F0D7] border-b border-[#AAB99A] text-[#727D73] text-sm font-medium">
          Categorías
        </div>
        <CategoriasList
          categorias={categorias}
          categoriaActiva={categoriaActiva}
          onCategoriaClick={onCategoriaClick}
        />
      </div>

      {/* Panel de Subcategorías */}
      <div className="h-1/2 flex flex-col">
        <div className="px-2 py-1.5 bg-[#F0F0D7] border-y border-[#AAB99A] text-[#727D73] text-sm font-medium">
          Subcategorías
        </div>
        <SubcategoriasList
          subcategorias={subcategorias}
          categoriaActiva={categoriaActiva}
          subcategoriaActiva={subcategoriaActiva}
          onSubcategoriaClick={onSubcategoriaClick}
        />
      </div>
    </div>
  );
};

export default CategoriasSidebar;