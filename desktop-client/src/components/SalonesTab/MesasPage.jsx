// MesasPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactDOMServer from "react-dom/server";
import { toast } from "react-toastify";

// Componentes de la App
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
import CodigoModal from "./MesasComponents/Modales/CodigoModal";
import ObservacionesModal from "./MesasComponents/Modales/ObservacionesModal"; // Nuevo modal de observaciones

// Componente para impresión por zona
import TicketsZona from "./TicketsZona";

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
  juntarMesas,
  restarCantidad,
} from "../../services/ticketsTempService";

export const MesasPage = () => {
  const { mesaId } = useParams();
  const navigate = useNavigate();

  // Estado para los productos nuevos (solo los que no han sido confirmados)
  const [productosNuevos, setProductosNuevos] = useState([]);

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
  const [isCodigoModalOpen, setIsCodigoModalOpen] = useState(false);
  const [isObservacionesModalOpen, setIsObservacionesModalOpen] = useState(false);

  // Estados auxiliares
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedIngredientToAdd, setSelectedIngredientToAdd] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);
  const [descuentoTemp, setDescuentoTemp] = useState(0);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [cantidadUpdate, setCantidadUpdate] = useState(null);
  const [productoUpdate, setProductoUpdate] = useState(null);
  const [productoObservaciones, setProductoObservaciones] = useState(null);

  // Cargar datos iniciales
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

        try {
          const ticketExistente = await getTicketByMesa(mesaId);
          setTicketTemp(ticketExistente);
        } catch (error) {
          setTicketTemp(null);
        }

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
        console.error("Error al cargar datos:", error);
        toast.error("Error al cargar los datos iniciales");
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, [mesaId]);

  // Cargar usuario desde localStorage
  useEffect(() => {
    try {
      const userStored = localStorage.getItem("user");
      if (userStored) {
        setCurrentUser(JSON.parse(userStored));
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      toast.error("Error al cargar información del usuario");
    }
  }, []);

  // Actualizar subcategoría activa
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

  // ─────────────────────────────────────────────
  // Función para generar UID según el formato solicitado:
  // [últimos 3 dígitos del id del producto] +
  // Por cada extra: [últimos 3 dígitos del ingrediente] + "E" + [cantidad]
  // Por cada excluido: [últimos 3 dígitos del ingrediente] + "EX" + [cantidad]
  // ─────────────────────────────────────────────
  const generarUID = (producto) => {
    const prodIdStr = producto.producto._id.toString();
    const prodUID = prodIdStr.slice(-3);
    
    let extrasPart = "";
    if (producto.ingredientes.extras && producto.ingredientes.extras.length > 0) {
      extrasPart = producto.ingredientes.extras
        .map((extra) => {
          const extraIdStr =
            typeof extra.ingrediente === "string"
              ? extra.ingrediente.toString()
              : extra.ingrediente._id.toString();
          return extraIdStr.slice(-3) + "E" + extra.cantidad;
        })
        .join("");
    }
    
    let excluidosPart = "";
    if (producto.ingredientes.excluidos && producto.ingredientes.excluidos.length > 0) {
      excluidosPart = producto.ingredientes.excluidos
        .map((exc) => {
          const excIdStr =
            typeof exc.ingrediente === "string"
              ? exc.ingrediente.toString()
              : exc.ingrediente._id.toString();
          return excIdStr.slice(-3) + "EX" + exc.cantidad;
        })
        .join("");
    }
    
    return prodUID + extrasPart + excluidosPart;
  };

  // ─────────────────────────────────────────────
  // Calcular totales
  // ─────────────────────────────────────────────
  const calcularTotales = (productos, descuento = 0) => {
    const subTotal = productos.reduce((sum, p) => {
      const precioBase = p.precio * p.cantidad;
      const precioExtras =
        p.ingredientes.extras?.reduce((extraSum, extra) => extraSum + extra.costoExtra * extra.cantidad, 0) || 0;
      return sum + precioBase + precioExtras;
    }, 0);
    const total = subTotal * (1 - descuento / 100);
    return { subTotal, total };
  };

  // ─────────────────────────────────────────────
  // Agregar producto
  // ─────────────────────────────────────────────
  const handleAddProducto = (producto) => {
    if (!producto) return;
    const nuevoProducto = {
      producto: producto,
      cantidad: 1,
      precio: producto.precio,
      ingredientes: {
        excluidos: [],
        extras: [],
        base: producto.ingredientes?.map((ing) => ({
          ingrediente: ing.ingrediente,
          cantidad: ing.cantidad,
          unidad: ing.unidad,
        })) || [],
      },
      observaciones: "",
    };

    nuevoProducto.uid = generarUID(nuevoProducto);

    setTicketTemp((prev) => {
      if (!prev) {
        const nuevosProductos = [nuevoProducto];
        setProductosNuevos(nuevosProductos);
        return {
          mesa: mesaId,
          camarero: currentUser?._id,
          productos: nuevosProductos,
          descuento: 0,
          ...calcularTotales(nuevosProductos),
        };
      }
      const index = prev.productos.findIndex((p) => generarUID(p) === nuevoProducto.uid);
      let nuevosProductos;
      if (index !== -1) {
        nuevosProductos = prev.productos.map((p, i) =>
          i === index ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      } else {
        nuevosProductos = [...prev.productos, nuevoProducto];
      }
      setProductosNuevos((prevNuevos) => {
        const idx = prevNuevos.findIndex((p) => generarUID(p) === nuevoProducto.uid);
        if (idx !== -1) {
          return prevNuevos.map((p, i) =>
            i === idx ? { ...p, cantidad: p.cantidad + 1 } : p
          );
        } else {
          return [...prevNuevos, nuevoProducto];
        }
      });
      return {
        ...prev,
        productos: nuevosProductos,
        ...calcularTotales(nuevosProductos, prev.descuento),
      };
    });
  };

  const obtenerIngredientesSubcategoria = (subCategoria) => {
    if (!subCategoria?.ingredientesPermitidos) return [];
    return subCategoria.ingredientesPermitidos.filter((ingrediente) => ingrediente.active);
  };

  const obtenerIngredientesProducto = (producto) => {
    if (!producto.producto?.ingredientes) return [];
    return producto.producto.ingredientes.map((ing) => ({
      ...ing.ingrediente,
      cantidadBase: ing.cantidad,
      unidad: ing.unidad,
    }));
  };

  // ─────────────────────────────────────────────
  // Función auxiliar para actualizar ingredientes de un producto.
  // Al finalizar se recalcula el UID y se asigna.
  // ─────────────────────────────────────────────
  const actualizarIngredienteProducto = (p, ingrediente, cantidad, accion) => {
    let newProduct;
    if (accion === "agregar") {
      const exclusionExistente = p.ingredientes.excluidos.find(
        (exc) => exc.ingrediente.toString() === ingrediente._id.toString()
      );
      if (exclusionExistente) {
        const cantidadExtra = cantidad - exclusionExistente.cantidad;
        if (cantidadExtra <= 0) {
          newProduct = {
            ...p,
            ingredientes: {
              ...p.ingredientes,
              excluidos: p.ingredientes.excluidos
                .map((exc) =>
                  exc.ingrediente.toString() === ingrediente._id.toString()
                    ? { ...exc, cantidad: exc.cantidad - cantidad }
                    : exc
                )
                .filter((exc) => exc.cantidad > 0),
            },
          };
        } else {
          const nuevosExcluidos = p.ingredientes.excluidos.filter(
            (exc) => exc.ingrediente.toString() !== ingrediente._id.toString()
          );
          const nuevoExtra = {
            ingrediente: ingrediente._id,
            nombre: ingrediente.nombre,
            costoExtra: ingrediente.precio,
            cantidad: cantidadExtra,
          };
          newProduct = {
            ...p,
            ingredientes: {
              excluidos: nuevosExcluidos,
              extras: [...p.ingredientes.extras, nuevoExtra],
            },
          };
        }
      } else {
        const extraExistente = p.ingredientes.extras.find(
          (ext) => ext.ingrediente.toString() === ingrediente._id.toString()
        );
        if (extraExistente) {
          newProduct = {
            ...p,
            ingredientes: {
              ...p.ingredientes,
              extras: p.ingredientes.extras.map((ext) =>
                ext.ingrediente.toString() === ingrediente._id.toString()
                  ? { ...ext, cantidad: ext.cantidad + cantidad }
                  : ext
              ),
            },
          };
        } else {
          const nuevoExtra = {
            ingrediente: ingrediente._id,
            nombre: ingrediente.nombre,
            costoExtra: ingrediente.precio,
            cantidad,
          };
          newProduct = {
            ...p,
            ingredientes: {
              ...p.ingredientes,
              extras: [...p.ingredientes.extras, nuevoExtra],
            },
          };
        }
      }
    } else if (accion === "quitar") {
      const extraExistente = p.ingredientes.extras.find(
        (ext) => ext.ingrediente.toString() === ingrediente._id.toString()
      );
      if (extraExistente) {
        const cantidadExcluir = cantidad - extraExistente.cantidad;
        if (cantidadExcluir <= 0) {
          newProduct = {
            ...p,
            ingredientes: {
              ...p.ingredientes,
              extras: p.ingredientes.extras
                .map((ext) =>
                  ext.ingrediente.toString() === ingrediente._id.toString()
                    ? { ...ext, cantidad: ext.cantidad - cantidad }
                    : ext
                )
                .filter((ext) => ext.cantidad > 0),
            },
          };
        } else {
          const nuevosExtras = p.ingredientes.extras.filter(
            (ext) => ext.ingrediente.toString() !== ingrediente._id.toString()
          );
          const nuevoExcluido = {
            ingrediente: ingrediente._id,
            nombre: ingrediente.nombre,
            cantidad: cantidadExcluir,
          };
          newProduct = {
            ...p,
            ingredientes: {
              extras: nuevosExtras,
              excluidos: [...p.ingredientes.excluidos, nuevoExcluido],
            },
          };
        }
      } else {
        const exclusionExistente = p.ingredientes.excluidos.find(
          (exc) => exc.ingrediente.toString() === ingrediente._id.toString()
        );
        if (exclusionExistente) {
          newProduct = {
            ...p,
            ingredientes: {
              ...p.ingredientes,
              excluidos: p.ingredientes.excluidos.map((exc) =>
                exc.ingrediente.toString() === ingrediente._id.toString()
                  ? { ...exc, cantidad: exc.cantidad + cantidad }
                  : exc
              ),
            },
          };
        } else {
          const nuevoExcluido = {
            ingrediente: ingrediente._id,
            nombre: ingrediente.nombre,
            cantidad,
          };
          newProduct = {
            ...p,
            ingredientes: {
              ...p.ingredientes,
              excluidos: [...p.ingredientes.excluidos, nuevoExcluido],
            },
          };
        }
      }
    }
    // Recalcular y asignar el nuevo UID
    return { ...newProduct, uid: generarUID(newProduct) };
  };

  // ─────────────────────────────────────────────
  // Actualizar ingredientes: Agregar
  // ─────────────────────────────────────────────
  const handleAgregarIngrediente = (producto, ingrediente, cantidad) => {
    if (!ticketTemp) return;
    const actualizarProducto = (p) => {
      if (p.uid !== producto.uid) return p;
      return actualizarIngredienteProducto(p, ingrediente, cantidad, "agregar");
    };
    setTicketTemp((prev) => {
      const nuevosProductos = prev.productos.map(actualizarProducto);
      return {
        ...prev,
        productos: nuevosProductos,
        ...calcularTotales(nuevosProductos, prev.descuento),
      };
    });
    setProductosNuevos((prev) => prev.map(actualizarProducto));
  };

  // ─────────────────────────────────────────────
  // Actualizar ingredientes: Quitar
  // ─────────────────────────────────────────────
  const handleQuitarIngrediente = (producto, ingrediente, cantidad) => {
    if (!ticketTemp) return;
    const actualizarProducto = (p) => {
      if (p.uid !== producto.uid) return p;
      return actualizarIngredienteProducto(p, ingrediente, cantidad, "quitar");
    };
    setTicketTemp((prev) => {
      const nuevosProductos = prev.productos.map(actualizarProducto);
      return {
        ...prev,
        productos: nuevosProductos,
        ...calcularTotales(nuevosProductos, prev.descuento),
      };
    });
    setProductosNuevos((prev) => prev.map(actualizarProducto));
  };

  // ─────────────────────────────────────────────
  // Actualizar cantidad (parte "nueva" y persistida)
  // ─────────────────────────────────────────────
  const obtenerCantidadNueva = (uid) => {
    const productoNuevo = productosNuevos.find((p) => p.uid === uid);
    return productoNuevo ? productoNuevo.cantidad : 0;
  };

  const handleUpdateCantidad = async (productoId, nuevaCantidad) => {
    if (!ticketTemp) return;
    if (nuevaCantidad < 1) return;
    const productoOriginal = ticketTemp.productos.find((p) => p.uid === productoId);
    if (!productoOriginal) return;
    if (nuevaCantidad > productoOriginal.cantidad) {
      const diff = nuevaCantidad - productoOriginal.cantidad;
      setTicketTemp((prev) => {
        const nuevosProductos = prev.productos.map((p) =>
          p.uid === productoId ? { ...p, cantidad: p.cantidad + diff } : p
        );
        return {
          ...prev,
          productos: nuevosProductos,
          ...calcularTotales(nuevosProductos, prev.descuento),
        };
      });
      setProductosNuevos((prevNuevos) => {
        const idx = prevNuevos.findIndex((p) => p.uid === productoId);
        if (idx !== -1) {
          return prevNuevos.map((p, i) =>
            i === idx ? { ...p, cantidad: p.cantidad + diff } : p
          );
        } else {
          return [...prevNuevos, { ...productoOriginal, cantidad: diff }];
        }
      });
      return;
    }
    const totalARestar = productoOriginal.cantidad - nuevaCantidad;
    const cantidadNueva = obtenerCantidadNueva(productoId);
    if (totalARestar <= cantidadNueva) {
      setProductosNuevos((prevNuevos) =>
        prevNuevos
          .map((p) => {
            if (p.uid === productoId) {
              const nuevaCant = p.cantidad - totalARestar;
              return nuevaCant > 0 ? { ...p, cantidad: nuevaCant } : null;
            }
            return p;
          })
          .filter((p) => p !== null)
      );
      setTicketTemp((prev) => {
        const nuevosProductos = prev.productos.map((p) =>
          p.uid === productoId ? { ...p, cantidad: p.cantidad - totalARestar } : p
        );
        return {
          ...prev,
          productos: nuevosProductos,
          ...calcularTotales(nuevosProductos, prev.descuento),
        };
      });
    } else {
      const subtractionDeParteNueva = cantidadNueva;
      setProductosNuevos((prev) => prev.filter((p) => p.uid !== productoId));
      setTicketTemp((prev) => {
        const nuevosProductos = prev.productos.map((p) =>
          p.uid === productoId ? { ...p, cantidad: p.cantidad - subtractionDeParteNueva } : p
        );
        return {
          ...prev,
          productos: nuevosProductos,
          ...calcularTotales(nuevosProductos, prev.descuento),
        };
      });
      const subtractionPersistida = totalARestar - subtractionDeParteNueva;
      setProductoUpdate(productoId);
      setCantidadUpdate(subtractionPersistida);
      setIsCodigoModalOpen(true);
    }
  };

  const handleEliminarProducto = async (uid) => {
    if (!ticketTemp) return;
    const producto = ticketTemp.productos.find((p) => p.uid === uid);
    if (!producto) return;
    const cantidadNueva = obtenerCantidadNueva(uid);
    if (cantidadNueva === producto.cantidad) {
      setTicketTemp((prev) => {
        const nuevosProductos = prev.productos.filter((p) => p.uid !== uid);
        return nuevosProductos.length === 0
          ? null
          : { ...prev, productos: nuevosProductos, ...calcularTotales(nuevosProductos, prev.descuento) };
      });
      setProductosNuevos((prev) => prev.filter((p) => p.uid !== uid));
    } else {
      setProductosNuevos((prev) => prev.filter((p) => p.uid !== uid));
      setTicketTemp((prev) => {
        const nuevosProductos = prev.productos.map((p) =>
          p.uid === uid ? { ...p, cantidad: p.cantidad - cantidadNueva } : p
        );
        return { ...prev, productos: nuevosProductos, ...calcularTotales(nuevosProductos, prev.descuento) };
      });
      setProductoAEliminar(uid);
      setIsCodigoModalOpen(true);
    }
  };

  // ─────────────────────────────────────────────
  // Funciones para autorización mediante código
  // ─────────────────────────────────────────────
  const handleUpdateConCodigo = async (codigo) => {
    try {
      if (!ticketTemp?._id || !productoUpdate || cantidadUpdate === null) return;
      const productoOriginal = ticketTemp.productos.find((p) => p.uid === productoUpdate);
      if (!productoOriginal) return;
      await restarCantidad({
        codigo,
        productoId: productoUpdate,
        ticketId: ticketTemp._id,
        cantidad: cantidadUpdate,
      });
      try {
        const ticketActualizado = await getTicketByMesa(mesaId);
        const ticketConUids = {
          ...ticketActualizado,
          productos: ticketActualizado.productos.map((producto) => ({
            ...producto,
            uid: generarUID(producto),
          })),
        };
        setTicketTemp(ticketConUids);
        toast.success("Cantidad actualizada exitosamente");
      } catch (error) {
        setTicketTemp(null);
        toast.success("Mesa cerrada - No quedan productos");
      }
    } catch (error) {
      console.error("Error al actualizar cantidad:", error);
      if (error.response?.status === 401) {
        toast.error("Código inválido o usuario no autorizado");
      } else if (error.response?.status === 403) {
        toast.error("No tienes permisos para modificar productos");
      } else {
        toast.error("Error al actualizar la cantidad");
      }
    } finally {
      setIsCodigoModalOpen(false);
      setProductoUpdate(null);
      setCantidadUpdate(null);
    }
  };

  const handleEliminarConCodigo = async (codigo) => {
    try {
      if (!productoAEliminar || !ticketTemp?._id) return;
      await removeProducto({
        codigo,
        productoId: productoAEliminar,
        ticketId: ticketTemp._id,
      });
      try {
        const ticketActualizado = await getTicketByMesa(mesaId);
        const ticketConUids = {
          ...ticketActualizado,
          productos: ticketActualizado.productos.map((producto) => ({
            ...producto,
            uid: generarUID(producto),
          })),
        };
        setTicketTemp(ticketConUids);
        toast.success("Producto eliminado exitosamente");
      } catch (error) {
        setTicketTemp(null);
        toast.success("Mesa cerrada - No quedan productos");
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      if (error.response?.status === 401) {
        toast.error("Código inválido o usuario no autorizado");
      } else if (error.response?.status === 403) {
        toast.error("No tienes permisos para eliminar productos");
      } else {
        toast.error("Error al eliminar el producto");
      }
    } finally {
      setIsCodigoModalOpen(false);
      setProductoAEliminar(null);
    }
  };

  const handleDividirCuenta = (pedidoDividido) => {
    if (!ticketTemp) {
      toast.warning("No hay pedido para dividir");
      return;
    }
    setTicketTemp((prev) => {
      const productosRestantes = prev.productos.filter(
        (producto) =>
          !pedidoDividido.productos.find((p) => p.uid === producto.uid)
      );
      if (productosRestantes.length === 0) return null;
      return {
        ...prev,
        productos: productosRestantes,
        ...calcularTotales(productosRestantes, prev.descuento),
      };
    });
    setIsDividirMesaModalOpen(false);
    toast.success("Cuenta dividida exitosamente");
  };

  // ─────────────────────────────────────────────
  // Función para agrupar (solo) los productos nuevos por zona e imprimir el ticket
  // ─────────────────────────────────────────────
  const imprimirTicketsZonas = () => {
    // Se genera la hora en formato 24hs (ej: "23:15:30")
    const horaEnvio = new Date().toLocaleTimeString("es-ES", { hour12: false });
    // Agrupar solo los productos nuevos (los que se confirmarán)
    const ticketParaImprimir = {
      mesa: ticketTemp.mesa,
      camarero: ticketTemp.camarero,
      productos: productosNuevos,
    };
    const productosPorZona = ticketParaImprimir.productos.reduce((acc, producto) => {
      // Se espera que cada producto tenga producto.producto.subCategoria.Zona, con { nombre, printerName }
      const zona = producto.producto.subCategoria.Zona;
      const zonaKey = zona.nombre;
      if (!acc[zonaKey]) {
        acc[zonaKey] = {
          zona: zona.nombre,
          mesa: ticketParaImprimir.mesa.numero,
          camarero: ticketParaImprimir.camarero.nombre,
          productos: [],
          printerName: zona.printerName,
          horaEnvio,
        };
      }
      acc[zonaKey].productos.push(producto);
      return acc;
    }, {});

    Object.values(productosPorZona).forEach((zonaData) => {
      const html = ReactDOMServer.renderToStaticMarkup(
        <TicketsZona
          zona={zonaData.zona}
          mesa={zonaData.mesa}
          camarero={zonaData.camarero}
          productos={zonaData.productos}
          horaEnvio={zonaData.horaEnvio}
        />
      );
      window.electronAPI.printTicketZona(html, zonaData.printerName);
    });
  };

  // ─────────────────────────────────────────────
  // Función para abrir el modal de observaciones en un producto
  // ─────────────────────────────────────────────
  const handleAgregarObservaciones = (producto) => {
    setProductoObservaciones(producto);
    setIsObservacionesModalOpen(true);
  };

  // Actualiza el campo observaciones del producto en ticketTemp y productosNuevos
  const handleConfirmarObservaciones = (texto) => {
    const actualizarProductoObservaciones = (p) => {
      if (p.uid !== productoObservaciones.uid) return p;
      return { ...p, observaciones: texto };
    };
    setTicketTemp((prev) => ({
      ...prev,
      productos: prev.productos.map(actualizarProductoObservaciones),
    }));
    setProductosNuevos((prev) => prev.map(actualizarProductoObservaciones));
  };

  // ─────────────────────────────────────────────
  // Función de confirmación del pedido: solo se confirman (e imprimen) los productos nuevos
  // ─────────────────────────────────────────────
  const handleConfirmarPedido = async () => {
    try {
      if (!ticketTemp?.productos?.length) {
        toast.warning("No hay productos para confirmar");
        return;
      }
      const ticketAConfirmar = {
        ...ticketTemp,
        productos: productosNuevos,
      };
      const ticketConfirmado = await confirmarPedido(ticketAConfirmar);
      imprimirTicketsZonas();
      setTicketTemp(ticketConfirmado);
      setProductosNuevos([]);
      toast.success("Pedido confirmado y enviado a cocina");
    } catch (error) {
      console.error("Error al confirmar pedido:", error);
      toast.error("Error al confirmar el pedido");
    }
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
          onAgregarObservaciones={handleAgregarObservaciones}
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
          toast.info("Función de facturación en desarrollo");
        }}
        onCerrarMesa={async () => {
          try {
            if (!ticketTemp) {
              toast.warning("La mesa ya está cerrada");
              return;
            }
            await cerrarMesa({ ticketId: ticketTemp._id, mesaId });
            setTicketTemp(null);
            toast.success("Mesa cerrada exitosamente");
          } catch (error) {
            console.error("Error al cerrar mesa:", error);
            toast.error("Error al cerrar la mesa");
          }
        }}
        onAsignarCliente={() => {
          if (!ticketTemp) {
            toast.warning("No hay pedido activo para asignar cliente");
            return;
          }
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
        onConfirmarPedido={handleConfirmarPedido}
        onJuntarMesa={() => {
          if (!ticketTemp?.productos?.length) {
            toast.warning("No hay productos en la mesa actual");
            return;
          }
          setIsJuntarMesaModalOpen(true);
        }}
        mostrarToast={toast}
      />
      {/* Modales existentes */}
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
        ingredientes={
          selectedProduct
            ? obtenerIngredientesSubcategoria(selectedProduct.producto.subCategoria)
            : []
        }
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
            handleQuitarIngrediente(selectedProduct, selectedIngredientToAdd, cantidad);
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
          setTicketTemp((prev) => ({
            ...prev,
            descuento: nuevoDescuento,
            ...calcularTotales(prev.productos, nuevoDescuento),
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
          setTicketTemp((prev) => ({ ...prev, mesa: nuevaMesaId }));
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
            const resultado = await juntarMesas({ mesaDestino: mesaId, mesaOrigen: mesaOrigenId });
            setTicketTemp(resultado);
            toast.success("Mesas juntadas exitosamente");
          } catch (error) {
            console.error("Error al juntar mesas:", error);
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
      <CodigoModal
        isOpen={isCodigoModalOpen}
        onClose={() => {
          setIsCodigoModalOpen(false);
          setProductoUpdate(null);
          setCantidadUpdate(null);
          setProductoAEliminar(null);
        }}
        onConfirm={(codigo) => {
          if (productoUpdate !== null) {
            handleUpdateConCodigo(codigo);
          } else if (productoAEliminar !== null) {
            handleEliminarConCodigo(codigo);
          }
        }}
        title="Autorización requerida"
        message={
          productoUpdate !== null
            ? "Ingrese su código para modificar la cantidad"
            : "Ingrese su código para eliminar el producto"
        }
      />
      {/* Nuevo Modal para Observaciones */}
      <ObservacionesModal
        isOpen={isObservacionesModalOpen}
        onClose={() => setIsObservacionesModalOpen(false)}
        producto={productoObservaciones}
        onConfirm={handleConfirmarObservaciones}
      />
    </div>
  );
};

export default MesasPage;
