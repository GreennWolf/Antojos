import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Componente CodigoInput
export const CodigoInput = ({ value, onChange, disabled }) => {
    const [showCodigo, setShowCodigo] = useState(false);

    const handleInputChange = (e) => {
        // Solo permitir números
        const inputValue = e.target.value.replace(/\D/g, '');
        // Limitar a 4 dígitos
        if (inputValue.length <= 4 ) {
            onChange(inputValue);
        }
    };

    return (
        <>
            <label className="text-sm font-medium text-[#727D73]">
                Código
            </label>
            <div className="col-span-3 relative">
                <input
                    type={showCodigo ? "text" : "password"}
                    value={value || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pr-10 rounded-md bg-white border border-[#AAB99A] focus:outline-none focus:ring-2 focus:ring-[#727D73]"
                    placeholder="Ingrese de 2 a 4 números"
                    maxLength={4}
                    disabled={disabled}
                    inputMode="numeric"
                    pattern="[0-9]*"
                />
                <button
                    type="button"
                    onClick={() => setShowCodigo(!showCodigo)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#727D73] hover:text-[#727D73]/90"
                >
                    {showCodigo ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
        </>
    );
};