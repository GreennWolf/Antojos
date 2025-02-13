// TicketsZona.jsx
import React from "react";

const TicketsZona = ({ zona, mesa, camarero, productos, horaEnvio }) => {
  // Si deseas quitar los segundos:
  const horaFormateada = horaEnvio.split(":").slice(0,2).join(":");
  return (
    <div style={{ width: "80mm", fontFamily: "monospace", padding: "5mm" }}>
      <h2 style={{ textAlign: "center" }}>{zona}</h2>
      <p>Mesa: {mesa}</p>
      <p>Camarero: {camarero}</p>
      <p>Hora: {horaFormateada}</p>
      <hr />
      {productos.map((producto, index) => {
        console.log(producto.observaciones &&
          producto.observaciones.length != '')
        return (
        <div key={index} style={{ marginBottom: "5mm" }}>
          <p>
            <strong>{producto.producto.nombre}</strong> x{producto.cantidad}
          </p>
          {producto.ingredientes.extras &&
            producto.ingredientes.extras.length > 0 && (
              <div>
                <p>Extras:</p>
                <ul style={{ marginLeft: "5mm" }}>
                  {producto.ingredientes.extras.map((extra, idx) => (
                    <li key={idx}>
                      + {extra.nombre} x{extra.cantidad}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          {producto.ingredientes.excluidos &&
            producto.ingredientes.excluidos.length > 0 && (
              <div>
                <p>Excluidos:</p>
                <ul style={{ marginLeft: "5mm" }}>
                  {producto.ingredientes.excluidos.map((exc, idx) => {
                    console.log(exc)
                    return (
                      <li key={idx}>
                        - {exc.nombre} x{exc.cantidad}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            {producto.observaciones &&
            producto.observaciones.length != '' && (
              <div>
                <p>Observaciones:</p>
                <ul style={{ marginLeft: "5mm" }}>
                  {producto.observaciones}
                </ul>
              </div>
            )}
          <hr />
        </div>
      )})}
    </div>
  );
};

export default TicketsZona;
