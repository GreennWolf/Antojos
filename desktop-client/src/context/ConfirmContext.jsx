// ConfirmContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const showConfirm = (title, message, onConfirm, onCancel = () => {}) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      onConfirm,
      onCancel
    });
  };

  const handleClose = () => {
    setConfirmConfig(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  const handleConfirm = async () => {
    await confirmConfig.onConfirm();
    handleClose();
  };

  const handleCancel = () => {
    confirmConfig.onCancel();
    handleClose();
  };

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      <Dialog 
        open={confirmConfig.isOpen} 
        onOpenChange={(open) => {
          if (!open) handleCancel();
        }}
      >
        <DialogContent 
          className="bg-[#F0F0D7] max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-[#727D73]">
              {confirmConfig.title}
            </DialogTitle>
          </DialogHeader>
          
          <DialogDescription className="text-[#727D73]">
            {confirmConfig.message}
          </DialogDescription>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              type="button"
              variant="outline" 
              onClick={handleCancel}
              className="border-[#727D73] text-[#727D73] hover:bg-[#D0DDD0]"
            >
              Cancelar
            </Button>
            <Button 
              type="button"
              onClick={handleConfirm}
              className="bg-[#727D73] text-[#F0F0D7] hover:bg-[#727D73]/90"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm debe ser usado dentro de un ConfirmProvider');
  }
  return context;
};
