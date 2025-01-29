import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Componentes
import HeaderMesa from "./MesasComponents/HeaderMesa";
import CategoriasSidebar from "./MesasComponents/CategoriasSidebar";
import ProductosGrid from "./MesasComponents/ProductosGrid";
import PedidoActualPanel from "./MesasComponents/PedidoActualPanel";
import BarraAcciones from "./MesasComponents/BarraAcciones";

// Modales
import IngredientesModal from "./MesasComponents/Modales/IngredientesModal";
import QuitarIngredientesModal from "./MesasComponents/Modales/QuitarIngredientesModal";
import CantidadModal from "./MesasComponents/Modales/CantidadModal";
import DescuentoModal from "./MesasComponents/Modales/DescuentoModal";
import CambiarMesaDialog from "./BotonesMesasPage/CambiarMesasDialog";
import JuntarMesaDialog from "./BotonesMesasPage/JuntarMesasDialog";
import DividirMesaDialog from "./BotonesMesasPage/DividirMesaDialog";

// Servicios
import { getMesaById, getMesas } from "../../services/mesasService";
import { getSubCategorias } from "../../services/subCategoriasService";
import { getProductos } from "../../services/productosService";
import { getCategorias } from "../../services/categoriasService";
import { 
  getTicketByMesa, 
  confirmarPedido, 
  removeProducto, 
  applyDescuento,
  cerrarMesa,
  juntarMesas 
} from "../../services/ticketsTempService";

export const MesasPage = () => {
  const { mesaId } = useParams();
  const navigate = useNavigate();

  // Estados principales
  const [mesa, setMesa] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categorias, setCategorias] = useState([]);
  const [subCategorias, setSubCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [subCategoriaActiva, setSubCategoriaActiva] = useState(null);
  const [ticketTemp, setTicketTemp] = useState(null);

  // Estados para modales
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [isRemoveIngredientModalOpen, setIsRemoveIngredientModalOpen] = useState(false);
  const [isSelectCantidadModalOpen, setIsSelectCantidadModalOpen] = useState(false);
  const [isDescuentoModalOpen, setIsDescuentoModalOpen] = useState(false);
  const [isCambiarMesaModalOpen, setIsCambiarMesaModalOpen] = useState(false);
  const [isJuntarMesaModalOpen, setIsJuntarMesaModalOpen] = useState(false);
  const [isDividirMesaModalOpen, setIsDividirMesaModalOpen] = useState(false);

  // Estados auxiliares
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedIngredientToAdd, setSelectedIngredientToAdd] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);
  const [descuentoTemp, setDescuentoTemp] = useState(0);

  // Effect para cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoading(true);
        const [mesaData, categoriasData, subCategoriasData, productosData] = 
          await Promise.all([
            getMesaById(mesaId).catch(() => null),
            getCategorias().catch(() => []),
            getSubCategorias().catch(() => []),
            getProductos().catch(() => []),
          ]);

        if (!mesaData) {
          toast.warning("Mesa no encontrada, se creará al confirmar el pedido");
        } else {
          setMesa(mesaData);
        }

        // No intentamos cargar el ticket aquí, ya que todo será local hasta confirmar
        setTicketTemp(null);

        const categoriasActivas = categoriasData.filter(
          (cat) => cat.active && cat.ingrediente === false
        );
        setCategorias(categoriasActivas);

        const subCategoriasActivas = subCategoriasData.filter(
          (subcat) => subcat.active
        );
        setSubCategorias(subCategoriasActivas);
        
        setProductos(productosData.filter((prod) => prod.active));

        if (categoriasActivas.length > 0) {
          setCategoriaActiva(categoriasActivas[0]._id);
        }

      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error("Error al cargar los datos iniciales");
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, [mesaId]);
  // Effect para cargar usuario
  useEffect(() => {
    try {
      const userStored = localStorage.getItem("user");
      if (userStored) {
        setCurrentUser(JSON.parse(userStored));
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      toast.error("Error al cargar información del usuario");
    }
  }, []);

  useEffect(() => {
    if (categoriaActiva) {
      const primeraSubCategoria = subCategorias.find(
        (sc) => sc.categoria._id === categoriaActiva
      );
  
      if (primeraSubCategoria) {
        setSubCategoriaActiva(primeraSubCategoria._id);
      } else {
        setSubCategoriaActiva(null);
      }
    }
  }, [categoriaActiva, subCategorias]);

  const calcularTotales = (productos, descuento = 0) => {
    const subTotal = productos.reduce((sum, p) => {
      const precioBase = p.precio * p.cantidad;
      const precioExtras = p.ingredientes.extras?.reduce((extraSum, extra) => 
        extraSum + (extra.costoExtra * extra.cantidad), 0
      ) || 0;
      return sum + precioBase + precioExtras;
    }, 0);

    const total = subTotal * (1 - (descuento / 100));
    return { subTotal, total };
  };

  const handleAddProducto = (producto) => {
    if (!producto) return;
  
    const nuevoProducto = {
      producto: producto,
      cantidad: 1,
      precio: producto.precio,
      // Corregimos la estructura de ingredientes
      ingredientes: {
        excluidos: [], // Array para ingredientes excluidos
        extras: [],    // Array para ingredientes extras,
        base: producto.ingredientes?.map(ing => ({
          ingrediente: ing.ingrediente,
          cantidad: ing.cantidad,
          unidad: ing.unidad
        })) || []      // Array para ingredientes base del producto
      },
      observaciones: ""
    };
  
    setTicketTemp(prev => {
      if (!prev) {
        // Crear nuevo ticket temporal
        const nuevoTicket = {
          mesa: mesaId,
          camarero: currentUser?.id,
          productos: [nuevoProducto],
          descuento: 0,
          ...calcularTotales([nuevoProducto])
        };
        return nuevoTicket;
      }
  
      // Verificar si el producto ya existe (incluyendo comparación de ingredientes)
      const productoExistente = prev.productos.find(p => 
        p.producto === producto._id && 
        p.ingredientes.excluidos.length === 0 && 
        p.ingredientes.extras.length === 0 &&
        JSON.stringify(p.ingredientes.base) === JSON.stringify(nuevoProducto.ingredientes.base)
      );
  
      let nuevosProductos;
      if (productoExistente) {
        nuevosProductos = prev.productos.map(p => 
          p === productoExistente 
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        );
      } else {
        nuevosProductos = [...prev.productos, nuevoProducto];
      }
  
      return {
        ...prev,
        productos: nuevosProductos,
        ...calcularTotales(nuevosProductos, prev.descuento)
      };
    });
  };

  const obtenerIngredientesSubcategoria = (subCategoria) => {
    if (!subCategoria?.ingredientesPermitidos) {
      return [];
    }
    return subCategoria.ingredientesPermitidos.filter(ingrediente => ingrediente.active);
  };
  
  const obtenerIngredientesProducto = (producto) => {
    if (!producto.producto?.ingredientes) {
      return [];
    }
    
    // Mapeamos los ingredientes base del producto
    return producto.producto.ingredientes.map(ing => ({
      ...ing.ingrediente,
      cantidadBase: ing.cantidad,
      unidad: ing.unidad,
    }));
  };

  const handleAgregarIngrediente = (producto, ingrediente, cantidad) => {
    if (!ticketTemp) return;
  
    setTicketTemp(prev => {
      const nuevosProductos = prev.productos.map(p => {
        if (p.producto._id !== producto.producto._id) return p;
  
        // Verificamos si el ingrediente está en excluidos
        const exclusionExistente = p.ingredientes.excluidos.find(
          exc => exc.ingrediente === ingrediente._id
        );
  
        if (exclusionExistente) {
          // Calculamos la diferencia entre lo que queremos agregar y lo excluido
          const cantidadExtra = cantidad - exclusionExistente.cantidad;
  
          // Si la cantidad a agregar es menor o igual a lo excluido
          if (cantidadExtra <= 0) {
            // Solo reducimos la cantidad excluida
            return {
              ...p,
              ingredientes: {
                ...p.ingredientes,
                excluidos: p.ingredientes.excluidos.map(exc => 
                  exc.ingrediente === ingrediente._id 
                    ? { ...exc, cantidad: exc.cantidad - cantidad }
                    : exc
                ).filter(exc => exc.cantidad > 0) // Eliminamos si llega a 0
              }
            };
          } else {
            // Eliminamos la exclusión y agregamos el excedente como extra
            const nuevosExcluidos = p.ingredientes.excluidos.filter(
              exc => exc.ingrediente !== ingrediente._id
            );
  
            const nuevoExtra = {
              ingrediente: ingrediente._id,
              nombre: ingrediente.nombre,
              costoExtra: ingrediente.precio,
              cantidad: cantidadExtra
            };
  
            return {
              ...p,
              ingredientes: {
                excluidos: nuevosExcluidos,
                extras: [...p.ingredientes.extras, nuevoExtra]
              }
            };
          }
        } else {
          // Si no está excluido, manejamos los extras como antes
          const extraExistente = p.ingredientes.extras.find(
            ext => ext.ingrediente === ingrediente._id
          );
  
          if (extraExistente) {
            return {
              ...p,
              ingredientes: {
                ...p.ingredientes,
                extras: p.ingredientes.extras.map(ext =>
                  ext.ingrediente === ingrediente._id
                    ? { ...ext, cantidad: ext.cantidad + cantidad }
                    : ext
                )
              }
            };
          } else {
            const nuevoExtra = {
              ingrediente: ingrediente._id,
              nombre: ingrediente.nombre,
              costoExtra: ingrediente.precio,
              cantidad
            };
  
            return {
              ...p,
              ingredientes: {
                ...p.ingredientes,
                extras: [...p.ingredientes.extras, nuevoExtra]
              }
            };
          }
        }
      });
  
      return {
        ...prev,
        productos: nuevosProductos,
        ...calcularTotales(nuevosProductos, prev.descuento)
      };
    });
  };

  const handleQuitarIngrediente = (producto, ingrediente, cantidad) => {
    if (!ticketTemp) return;
  
    setTicketTemp(prev => {
      const nuevosProductos = prev.productos.map(p => {
        if (p.producto._id !== producto.producto._id) return p;
  
        // Primero verificamos si el ingrediente está en extras
        const extraExistente = p.ingredientes.extras.find(
          ext => ext.ingrediente === ingrediente._id
        );
  
        if (extraExistente) {
          // Calculamos la diferencia entre lo que queremos quitar y lo extra
          const cantidadExcluir = cantidad - extraExistente.cantidad;
  
          // Si la cantidad a quitar es menor o igual a lo extra
          if (cantidadExcluir <= 0) {
            // Solo reducimos la cantidad extra
            return {
              ...p,
              ingredientes: {
                ...p.ingredientes,
                extras: p.ingredientes.extras.map(ext => 
                  ext.ingrediente === ingrediente._id 
                    ? { ...ext, cantidad: ext.cantidad - cantidad }
                    : ext
                ).filter(ext => ext.cantidad > 0) // Eliminamos si llega a 0
              }
            };
          } else {
            // Eliminamos el extra y agregamos el excedente como excluido
            const nuevosExtras = p.ingredientes.extras.filter(
              ext => ext.ingrediente !== ingrediente._id
            );
  
            const nuevoExcluido = {
              ingrediente: ingrediente._id,
              nombre: ingrediente.nombre,
              cantidad: cantidadExcluir
            };
  
            return {
              ...p,
              ingredientes: {
                extras: nuevosExtras,
                excluidos: [...p.ingredientes.excluidos, nuevoExcluido]
              }
            };
          }
        } else {
          // Si no está como extra, manejamos los excluidos como antes
          const exclusionExistente = p.ingredientes.excluidos.find(
            exc => exc.ingrediente === ingrediente._id
          );
  
          if (exclusionExistente) {
            return {
              ...p,
              ingredientes: {
                ...p.ingredientes,
                excluidos: p.ingredientes.excluidos.map(exc => 
                  exc.ingrediente === ingrediente._id 
                    ? { ...exc, cantidad: exc.cantidad + cantidad }
                    : exc
                )
              }
            };
          } else {
            const nuevoExcluido = {
              ingrediente: ingrediente._id,
              nombre: ingrediente.nombre,
              cantidad: cantidad
            };
  
            return {
              ...p,
              ingredientes: {
                ...p.ingredientes,
                excluidos: [...p.ingredientes.excluidos, nuevoExcluido]
              }
            };
          }
        }
      });
  
      return {
        ...prev,
        productos: nuevosProductos,
        ...calcularTotales(nuevosProductos, prev.descuento)
      };
    });
  };

  const handleUpdateCantidad = (productoId, cantidad) => {
    if (!ticketTemp) return;

    setTicketTemp(prev => {
      const nuevosProductos = prev.productos.map(p => 
        p.producto === productoId ? { ...p, cantidad } : p
      );

      return {
        ...prev,
        productos: nuevosProductos,
        ...calcularTotales(nuevosProductos, prev.descuento)
      };
    });
  };

  const handleEliminarProducto = (productoId) => {
    if (!ticketTemp) return;

    setTicketTemp(prev => {
      const nuevosProductos = prev.productos.filter(p => p.producto !== productoId);
      
      if (nuevosProductos.length === 0) {
        return null;
      }

      return {
        ...prev,
        productos: nuevosProductos,
        ...calcularTotales(nuevosProductos, prev.descuento)
      };
    });
  };

  const handleDividirCuenta = (pedidoDividido) => {
    if (!ticketTemp) {
      toast.warning("No hay pedido para dividir");
      return;
    }
  
    setTicketTemp(prev => {
      // Obtenemos los productos que se quedan en la mesa actual
      const productosRestantes = prev.productos.filter(
        producto => !pedidoDividido.productos.find(p => p.uid === producto.uid)
      );
  
      if (productosRestantes.length === 0) {
        return null;
      }
  
      // Actualizamos el ticket actual con los productos restantes
      return {
        ...prev,
        productos: productosRestantes,
        ...calcularTotales(productosRestantes, prev.descuento)
      };
    });
  
    setIsDividirMesaModalOpen(false);
    toast.success("Cuenta dividida exitosamente");
  
    // TODO: Aquí se podría implementar la lógica para generar el ticket de la cuenta dividida
    // Por ejemplo, crear un nuevo ticket para facturación
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Cargando...
      </div>
    );
  }

  if (!mesa) {
    return (
      <div className="flex items-center justify-center h-screen">
        Mesa no encontrada
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F0D7]">
      <HeaderMesa
        numeroMesa={mesa.numero}
        nombreCamarero={currentUser?.nombre}
        onBackClick={() => navigate("/main", { replace: true })}
        estado={ticketTemp ? "abierta" : "cerrada"}
      />

      <div className="flex h-[calc(100vh-98px)]">
        <CategoriasSidebar
          categorias={categorias}
          subcategorias={subCategorias}
          categoriaActiva={categoriaActiva}
          subcategoriaActiva={subCategoriaActiva}
          onCategoriaClick={setCategoriaActiva}
          onSubcategoriaClick={setSubCategoriaActiva}
        />

        <ProductosGrid
          productos={productos}
          subcategoriaActiva={subCategoriaActiva}
          onProductoClick={handleAddProducto}
        />

        <PedidoActualPanel
          pedido={ticketTemp}
          onUpdateCantidad={handleUpdateCantidad}
          onAgregarIngrediente={(producto) => {
            setSelectedProduct(producto);
            setIsIngredientModalOpen(true);
            setCurrentAction("agregar");
          }}
          onQuitarIngrediente={(producto) => {
            setSelectedProduct(producto);
            setIsRemoveIngredientModalOpen(true);
          }}
          onEliminarProducto={handleEliminarProducto}
        />
      </div>

      <BarraAcciones
        tienePedido={ticketTemp?.productos?.length > 0}
        onConsultarMesa={async () => {
          try {
            const ticket = await getTicketByMesa(mesaId);
            setTicketTemp(ticket);
            toast.success("Mesa consultada exitosamente");
          } catch (error) {
            toast.info("No hay ticket activo para esta mesa");
            setTicketTemp(null);
          }
        }}
        onHacerFactura={() => {
          if (!ticketTemp?.productos?.length) {
            toast.warning("No hay productos para facturar");
            return;
          }
          // TODO: Implementar lógica de facturación
          toast.info("Función de facturación en desarrollo");
        }}
        onCerrarMesa={async () => {
          try {
            if (!ticketTemp) {
              toast.warning("La mesa ya está cerrada");
              return;
            }
            await cerrarMesa({
              ticketId: ticketTemp._id,
              mesaId
            });
            setTicketTemp(null);
            toast.success("Mesa cerrada exitosamente");
          } catch (error) {
            console.error('Error al cerrar mesa:', error);
            toast.error("Error al cerrar la mesa");
          }
        }}
        onAsignarCliente={() => {
          if (!ticketTemp) {
            toast.warning("No hay pedido activo para asignar cliente");
            return;
          }
          // TODO: Implementar lógica de asignación de cliente
          toast.info("Función de asignación de cliente en desarrollo");
        }}
        onCambiarMesa={() => {
          if (!ticketTemp?.productos?.length) {
            toast.warning("No hay productos para cambiar de mesa");
            return;
          }
          setIsCambiarMesaModalOpen(true);
        }}
        onDividirMesa={() => {
          if (!ticketTemp?.productos?.length) {
            toast.warning("No hay productos para dividir");
            return;
          }
          setIsDividirMesaModalOpen(true);
        }}
        onAplicarDescuento={() => {
          if (!ticketTemp?.productos?.length) {
            toast.warning("No hay productos para aplicar descuento");
            return;
          }
          setDescuentoTemp(ticketTemp?.descuento || 0);
          setIsDescuentoModalOpen(true);
        }}
        onConfirmarPedido={async () => {
          try {
            if (!ticketTemp?.productos?.length) {
              toast.warning("No hay productos para confirmar");
              return;
            }

            // Aquí sí enviamos al servidor
            const ticketConfirmado = await confirmarPedido(ticketTemp);

            // Agrupar productos por zona para envío a cocina
            const productosPorZona = ticketConfirmado.productos.reduce((acc, producto) => {
              const zonaId = producto.producto.subCategoria.Zona;
              if (!acc[zonaId]) {
                acc[zonaId] = [];
              }
              acc[zonaId].push(producto);
              return acc;
            }, {});

            // Enviar a cada zona
            for (const [zonaId, productos] of Object.entries(productosPorZona)) {
              // TODO: Implementar envío a cocina con Capacitor
              console.log(`Enviando a zona ${zonaId}:`, productos);
            }

            setTicketTemp(ticketConfirmado);
            toast.success("Pedido confirmado y enviado a cocina");
          } catch (error) {
            console.error('Error al confirmar pedido:', error);
            toast.error("Error al confirmar el pedido");
          }
        }}
        onJuntarMesa={() => {
          if (!ticketTemp?.productos?.length) {
            toast.warning("No hay productos en la mesa actual");
            return;
          }
          setIsJuntarMesaModalOpen(true);
        }}
        mostrarToast={toast}
      />

      {/* Modales */}
      <IngredientesModal
        isOpen={isIngredientModalOpen}
        onClose={() => setIsIngredientModalOpen(false)}
        producto={selectedProduct}
        ingredientesDisponibles={
          selectedProduct 
            ? obtenerIngredientesSubcategoria(selectedProduct.producto.subCategoria) 
            : []
        }
        onIngredienteSelect={(ingrediente) => {
          setSelectedIngredientToAdd(ingrediente);
          setIsIngredientModalOpen(false);
          setIsSelectCantidadModalOpen(true);
        }}
      />

      <QuitarIngredientesModal
        isOpen={isRemoveIngredientModalOpen}
        onClose={() => setIsRemoveIngredientModalOpen(false)}
        producto={selectedProduct}
        ingredientes={selectedProduct ? obtenerIngredientesSubcategoria(selectedProduct.producto.subCategoria) : []}
        onIngredienteSelect={(ingrediente) => {
          setSelectedIngredientToAdd(ingrediente);
          setCurrentAction("quitar");
          setIsSelectCantidadModalOpen(true);
          setIsRemoveIngredientModalOpen(false);
        }}
      />

      <CantidadModal
        isOpen={isSelectCantidadModalOpen}
        onClose={() => {
          setIsSelectCantidadModalOpen(false);
          setSelectedIngredientToAdd(null);
          setCurrentAction(null);
        }}
        producto={selectedProduct}
        ingrediente={selectedIngredientToAdd}
        accion={currentAction}
        onConfirm={(cantidad) => {
          if (currentAction === "agregar") {
            handleAgregarIngrediente(selectedProduct, selectedIngredientToAdd, cantidad);
          } else {
            handleQuitarIngrediente(selectedProduct, selectedIngredientToAdd,cantidad);
          }
          setIsSelectCantidadModalOpen(false);
        }}
      />

      <DescuentoModal
        isOpen={isDescuentoModalOpen}
        onClose={() => setIsDescuentoModalOpen(false)}
        descuentoInicial={descuentoTemp}
        subtotal={ticketTemp?.subTotal || 0}
        onAplicarDescuento={(nuevoDescuento) => {
          setTicketTemp(prev => ({
            ...prev,
            descuento: nuevoDescuento,
            ...calcularTotales(prev.productos, nuevoDescuento)
          }));
          setIsDescuentoModalOpen(false);
          toast.success("Descuento aplicado correctamente");
        }}
      />

      <CambiarMesaDialog
        open={isCambiarMesaModalOpen}
        onOpenChange={setIsCambiarMesaModalOpen}
        mesaActual={mesaId}
        onCambiarMesa={(nuevaMesaId) => {
          setTicketTemp(prev => ({
            ...prev,
            mesa: nuevaMesaId
          }));
          navigate(`/mesas/${nuevaMesaId}`);
          toast.success("Mesa cambiada exitosamente");
        }}
        getMesas={getMesas}
      />

      <JuntarMesaDialog
        open={isJuntarMesaModalOpen}
        onOpenChange={setIsJuntarMesaModalOpen}
        mesaActual={mesaId}
        onJuntarMesa={async (mesaOrigenId) => {
          try {
            const resultado = await juntarMesas({
              mesaDestino: mesaId,
              mesaOrigen: mesaOrigenId
            });
            setTicketTemp(resultado);
            toast.success("Mesas juntadas exitosamente");
          } catch (error) {
            console.error('Error al juntar mesas:', error);
            toast.error("Error al juntar las mesas");
          }
        }}
        getMesas={getMesas}
      />

      <DividirMesaDialog
        open={isDividirMesaModalOpen}
        onOpenChange={setIsDividirMesaModalOpen}
        mesaActual={mesa?.numero}
        pedidoActual={ticketTemp}
        onCobrarPedidoDividido={handleDividirCuenta}
      />
    </div>
  );
}

export default MesasPage;