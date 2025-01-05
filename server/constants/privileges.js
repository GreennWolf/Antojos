// constants/privileges.js
const PRIVILEGES = {
    TICKETS_TEMP: {
        ADD_PRODUCTOS: 'tickets_temp.add_productos',
        REMOVE_PRODUCTOS: 'tickets_temp.remove_productos',
        MODIFY_CANTIDAD: 'tickets_temp.modify_cantidad',
        MODIFY_INGREDIENTES_UNCOOKED: 'tickets_temp.modify_ingredientes_uncooked',
        MODIFY_INGREDIENTES_ALL: 'tickets_temp.modify_ingredientes_all',
        APPLY_DESCUENTO: 'tickets_temp.apply_descuento',
        SPLIT_CUENTA: 'tickets_temp.split_cuenta',
        JOIN_MESAS: 'tickets_temp.join_mesas',
        MOVE_PRODUCTOS: 'tickets_temp.move_productos',
        CONFIRMAR_PEDIDO: 'tickets_temp.confirmar_pedido'
    },
    TICKETS: {
        VIEW: 'tickets.view',
        REPRINT: 'tickets.reprint',
        MODIFY_METODO_PAGO: 'tickets.modify_metodo_pago',
        CREATE_FACTURA_A: 'tickets.create_factura_a',
        VIEW_HISTORY: 'tickets.view_history',
        REOPEN: 'tickets.reopen'
    },
    MESAS: {
        CREATE: 'mesas.create',
        READ: 'mesas.read',
        UPDATE: 'mesas.update',
        DELETE: 'mesas.delete'
    },
    CUENTAS: {
        CREATE: 'cuentas.create',
        READ: 'cuentas.read',
        UPDATE: 'cuentas.update',
        DELETE: 'cuentas.delete'
    },
    ROLES: {
        CREATE: 'roles.create',
        READ: 'roles.read',
        UPDATE: 'roles.update',
        DELETE: 'roles.delete'
    },
    SALONES: {
        CREATE: 'salones.create',
        READ: 'salones.read',
        UPDATE: 'salones.update',
        DELETE: 'salones.delete'
    },
    PRODUCTOS: {
        CREATE: 'productos.create',
        READ: 'productos.read',
        UPDATE: 'productos.update',
        DELETE: 'productos.delete'
    },
    INGREDIENTES: {
        CREATE: 'ingredientes.create',
        READ: 'ingredientes.read',
        UPDATE: 'ingredientes.update',
        DELETE: 'ingredientes.delete'
    },
    CLIENTES: {
        CREATE: 'clientes.create',
        READ: 'clientes.read',
        UPDATE: 'clientes.update',
        DELETE: 'clientes.delete'
    },
    METODOS_PAGO: {
        CREATE: 'metodos_pago.create',
        READ: 'metodos_pago.read',
        UPDATE: 'metodos_pago.update',
        DELETE: 'metodos_pago.delete'
    },
    COMERCIO: {
        CREATE: 'comercio.create',
        READ: 'comercio.read',
        UPDATE: 'comercio.update',
        DELETE: 'comercio.delete'
    },
    CATEGORIAS: {
        CREATE: 'categorias.create',
        READ: 'categorias.read',
        UPDATE: 'categorias.update',
        DELETE: 'categorias.delete'
    },
    SUBCATEGORIAS: {
        CREATE: 'subcategorias.create',
        READ: 'subcategorias.read',
        UPDATE: 'subcategorias.update',
        DELETE: 'subcategorias.delete'
    },
    ZONAS_IMPRESION: {
        CREATE: 'zonas_impresion.create',
        READ: 'zonas_impresion.read',
        UPDATE: 'zonas_impresion.update',
        DELETE: 'zonas_impresion.delete'
    },
    CAJAS: {
        CLOSE: 'cajas.close',
        VIEW: 'cajas.view'
    },
    EMPLEADOS: {
        CREATE: 'empleados.create',
        READ: 'empleados.read',
        UPDATE: 'empleados.update',
        DELETE: 'empleados.delete'
    }
 };
 
 module.exports = PRIVILEGES;