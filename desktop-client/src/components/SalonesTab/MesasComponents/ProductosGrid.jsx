import React from 'react';
import ProductoCard from './ProductoCard';

const ProductosGrid = ({
  productos,
  subcategoriaActiva,
  onProductoClick
}) => {
  // Filtramos los productos por la subcategoría activa
  const productosFiltrados = productos.filter(
    producto => producto.subCategoria._id === subcategoriaActiva
  );

  if (!subcategoriaActiva) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center text-[#727D73]">
        Seleccione una subcategoría
      </div>
    );
  }

  if (productosFiltrados.length === 0) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center text-[#727D73]">
        No hay productos disponibles en esta subcategoría
      </div>
    );
  }

  return (
    <div className="flex-1 p-4">
      <div className="grid grid-cols-8 gap-2 auto-rows-min">
        {productosFiltrados.map((producto) => (
          <ProductoCard
            key={producto._id}
            producto={producto}
            onProductoClick={onProductoClick}
          />
        ))}
      </div>

      {/* Sección de información adicional si es necesaria */}
      {productosFiltrados.some(p => p.alergenos?.length > 0) && (
        <div className="mt-4 text-xs text-[#727D73] border-t border-[#AAB99A] pt-2">
          <span className="font-medium">Nota:</span> Algunos productos pueden contener alérgenos. 
          Consulte con el personal para más información.
        </div>
      )}
    </div>
  );
};

export default ProductosGrid;