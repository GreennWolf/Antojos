import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getMesaById,
  updateMesa,
} from '../../services/mesasService';
import { getSubCategorias } from '../../services/subCategoriasService';
import { getProductos } from '../../services/productosService';
import { getCategorias } from '../../services/categoriasService';
import { toast } from 'react-toastify';

const Mesas = () => {
  const { mesaId } = useParams();
  const navigate = useNavigate();

  // Estados principales
  const [mesa, setMesa] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [subCategorias, setSubCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para manejo de selecciones
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [subCategoriaActiva, setSubCategoriaActiva] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Estado para el pedido actual
  const [pedidoActual, setPedidoActual] = useState({
    productos: [],
    total: 0
  });

  useEffect(() => {
    cargarDatos();
  }, [mesaId]);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      const [mesaData, categoriasData, subCategoriasData, productosData] = await Promise.all([
        getMesaById(mesaId),
        getCategorias(),
        getSubCategorias(),
        getProductos()
      ]);

      setMesa(mesaData);
      setCategorias(categoriasData.filter(cat => cat.active));
      setSubCategorias(subCategoriasData.filter(subcat => subcat.active));
      setProductos(productosData.filter(prod => prod.active));

      // Establecer primera categoría activa
      if (categoriasData.length > 0) {
        setCategoriaActiva(categoriasData[0]._id);
      }
    } catch (error) {
      toast.error('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };
  // Funciones de manejo de pedidos
  const handleAddProducto = (producto) => {
    setPedidoActual(prev => {
      // Buscar si el producto ya existe en el pedido
      const productoExistente = prev.productos.find(p => p._id === producto._id);
      
      let nuevosProductos;
      if (productoExistente) {
        // Si existe, incrementar cantidad
        nuevosProductos = prev.productos.map(p => 
          p._id === producto._id 
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        );
      } else {
        // Si no existe, agregar nuevo
        nuevosProductos = [
          ...prev.productos,
          { ...producto, cantidad: 1 }
        ];
      }

      // Calcular nuevo total
      const nuevoTotal = nuevosProductos.reduce(
        (total, p) => total + (p.precio * p.cantidad),
        0
      );

      return {
        productos: nuevosProductos,
        total: nuevoTotal
      };
    });
  };

  const handleRemoveProducto = (productoId) => {
    setPedidoActual(prev => {
      const nuevosProductos = prev.productos.filter(p => p._id !== productoId);
      const nuevoTotal = nuevosProductos.reduce(
        (total, p) => total + (p.precio * p.cantidad),
        0
      );

      return {
        productos: nuevosProductos,
        total: nuevoTotal
      };
    });
  };

  const handleUpdateCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;

    setPedidoActual(prev => {
      const nuevosProductos = prev.productos.map(p => 
        p._id === productoId 
          ? { ...p, cantidad: nuevaCantidad }
          : p
      );

      const nuevoTotal = nuevosProductos.reduce(
        (total, p) => total + (p.precio * p.cantidad),
        0
      );

      return {
        productos: nuevosProductos,
        total: nuevoTotal
      };
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Cabecera */}
      <div className="flex justify-between items-center p-4 bg-white border-b border-[#AAB99A]">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-[#727D73] text-white rounded-lg hover:bg-[#727D73]/90"
          >
            Volver
          </button>
          <h1 className="text-xl font-medium text-[#727D73]">
            Mesa {mesa?.numero}
          </h1>
        </div>
        <div className="text-sm text-[#727D73]">
          Mozo: {mesa?.mozo || 'No asignado'}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4">
        {/* Panel izquierdo - Categorías y productos */}
        <div className="col-span-9 space-y-4"></div>
         {/* Categorías */}
         <div className="grid grid-cols-10 gap-2">
            {categorias.map(categoria => (
              <div
                key={categoria._id}
                onClick={() => setCategoriaActiva(categoria._id)}
                className={`p-3 rounded-lg cursor-pointer transition-all text-center
                  ${categoria._id === categoriaActiva 
                    ? 'bg-[#727D73] text-white' 
                    : 'bg-white border border-[#AAB99A] text-[#727D73] hover:bg-[#D0DDD0]'
                  }`}
              >
                {categoria.nombre}
              </div>
            ))}
          </div>

          {/* Subcategorías */}
          <div className="flex space-x-2 overflow-x-auto py-2">
            {subCategorias
              .filter(subcat => subcat.categoria?._id === categoriaActiva)
              .map(subcategoria => (
                <div
                  key={subcategoria._id}
                  onClick={() => setSubCategoriaActiva(subcategoria._id)}
                  className={`px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap transition-all
                    ${subcategoria._id === subCategoriaActiva 
                      ? 'bg-[#727D73] text-white' 
                      : 'bg-white border border-[#AAB99A] text-[#727D73] hover:bg-[#D0DDD0]'
                    }`}
                >
                  {subcategoria.nombre}
                </div>
              ))}
          </div>

          {/* Grid de productos */}
          <div className="grid grid-cols-6 gap-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            {productos
              .filter(producto => 
                producto.subCategoria?._id === subCategoriaActiva && 
                producto.active
              )
              .map(producto => (
                <div
                  key={producto._id}
                  onClick={() => handleAddProducto(producto)}
                  className="bg-white border border-[#AAB99A] rounded-lg p-3 cursor-pointer
                           hover:bg-[#D0DDD0] transition-all"
                >
                  <div className="text-center space-y-2">
                    <div className="font-medium text-[#727D73]">{producto.nombre}</div>
                    <div className="text-sm text-gray-600">
                      {producto.precio?.toLocaleString('es-ES', { 
                        style: 'currency', 
                        currency: 'EUR' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Panel derecho - Pedido actual */}
        <div className="col-span-3 bg-white border border-[#AAB99A] rounded-lg p-4">
          <div className="flex flex-col h-full">
            <h2 className="text-lg font-medium text-[#727D73] mb-4">Pedido Actual</h2>

            {/* Lista de productos en el pedido */}
            <div className="flex-1 overflow-y-auto">
              {pedidoActual.productos.map(producto => (
                <div 
                  key={producto._id}
                  className="flex items-center justify-between py-2 border-b border-[#AAB99A] last:border-0"
                >
                  <div className="flex-1">
                    <div className="font-medium text-[#727D73]">{producto.nombre}</div>
                    <div className="text-sm text-gray-600">
                      {(producto.precio * producto.cantidad).toLocaleString('es-ES', { 
                        style: 'currency', 
                        currency: 'EUR' 
                      })}
                    </div>
                  </div>

                  {/* Controles de cantidad */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleUpdateCantidad(producto._id, producto.cantidad - 1)}
                      className="px-2 py-1 bg-[#727D73] text-white rounded hover:bg-[#727D73]/90"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{producto.cantidad}</span>
                    <button
                      onClick={() => handleUpdateCantidad(producto._id, producto.cantidad + 1)}
                      className="px-2 py-1 bg-[#727D73] text-white rounded hover:bg-[#727D73]/90"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Resumen y total */}
            <div className="mt-4 pt-4 border-t border-[#AAB99A]">
              <div className="flex justify-between items-center text-lg font-medium text-[#727D73]">
                <span>Total:</span>
                <span>
                  {pedidoActual.total.toLocaleString('es-ES', { 
                    style: 'currency', 
                    currency: 'EUR' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

                {/* Barra de acciones inferior */}

      <div className="bg-white border-t border-[#AAB99A] p-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {/* Botones del lado izquierdo */}
            <button className="px-4 py-2 bg-[#727D73] text-white rounded-lg hover:bg-[#727D73]/90">
              Consultar Mesa
            </button>
            <button className="px-4 py-2 bg-[#727D73] text-white rounded-lg hover:bg-[#727D73]/90">
              Hacer Factura
            </button>
            <button className="px-4 py-2 bg-[#727D73] text-white rounded-lg hover:bg-[#727D73]/90">
              Cerrar Mesa
            </button>
            <button className="px-4 py-2 bg-[#727D73] text-white rounded-lg hover:bg-[#727D73]/90">
              Cobrar Mesa
            </button>
            <button className="px-4 py-2 bg-[#727D73] text-white rounded-lg hover:bg-[#727D73]/90">
              Asignar Cliente
            </button>
            <button className="px-4 py-2 bg-[#727D73] text-white rounded-lg hover:bg-[#727D73]/90">
              Cambiar Mesa
            </button>
          </div>

          <div className="flex space-x-2">
            {/* Botones del lado derecho */}
            <button className="px-4 py-2 bg-[#727D73] text-white rounded-lg hover:bg-[#727D73]/90">
              Dividir Mesa
            </button>
            <button className="px-4 py-2 bg-[#727D73] text-white rounded-lg hover:bg-[#727D73]/90">
              Imprimir
            </button>
            <button className="px-4 py-2 bg-[#727D73] text-white rounded-lg hover:bg-[#727D73]/90">
              Juntar Mesa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mesas;