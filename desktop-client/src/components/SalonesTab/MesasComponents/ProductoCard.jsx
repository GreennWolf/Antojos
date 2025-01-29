import React from 'react';

const ProductoCard = ({ producto, onProductoClick }) => {
  const handleClick = () => {
    if (producto.active) {
      onProductoClick(producto);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!producto.active}
      className={`
        p-2 bg-white rounded border border-[#AAB99A] 
        text-[#727D73] transition-colors text-sm text-center 
        min-h-[60px] flex flex-col items-center justify-center
        ${producto.active 
          ? 'hover:bg-[#D0DDD0]' 
          : 'opacity-50 cursor-not-allowed'}
      `}
    >
      <span className="break-words w-full">{producto.nombre}</span>
      <span className="text-xs text-gray-500">
        {producto.precio?.toLocaleString('es-ES', {
          style: 'currency',
          currency: 'EUR'
        })}
      </span>
    </button>
  );
};


export default ProductoCard;