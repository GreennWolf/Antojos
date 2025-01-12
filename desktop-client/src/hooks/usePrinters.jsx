import { useState, useEffect } from 'react';

export const usePrinters = () => {
  const [printers, setPrinters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPrinters = async () => {
    try {
      setIsLoading(true);
      if (window.electronAPI?.getPrinters) {
        const availablePrinters = await window.electronAPI.getPrinters();
        console.log(availablePrinters)
        setPrinters(availablePrinters.map(printer => ({
          name: printer.name,
          displayName: printer.displayName || printer.name,
        })));
      } else {
        console.warn('Printer API not available');
        setPrinters([]);
      }
    } catch (error) {
      console.error('Error loading printers:', error);
      setPrinters([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrinters();
  }, []);

  // Función helper para verificar si la API está disponible
  const isPrinterApiAvailable = () => {
    return !!window.electronAPI?.getPrinters;
  };

  return { 
    printers, 
    isLoading, 
    loadPrinters,
    isPrinterApiAvailable: isPrinterApiAvailable()
  };
};