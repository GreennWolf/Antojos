import React from 'react';
import { ChevronLeft } from 'lucide-react';

const HeaderMesa = ({ 
  numeroMesa, 
  nombreCamarero, 
  onBackClick 
}) => {
  return (
    <div className="bg-white border-b border-[#AAB99A] p-2 flex justify-between items-center">
      {/* Botón de retorno y número de mesa */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBackClick}
          className="bg-[#727D73] text-white p-1.5 rounded hover:bg-[#727D73]/90 
            transition-colors flex items-center justify-center"
          aria-label="Volver atrás"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl text-[#727D73]">
          Mesa {numeroMesa}
        </h1>
      </div>

      {/* Información del camarero */}
      <div className="text-[#727D73]">
        Mozo: {nombreCamarero || "No asignado"}
      </div>
    </div>
  );
};


export default HeaderMesa;