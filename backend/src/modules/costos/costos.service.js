const db = require("../../database/connection");

// ============================================================
// COSTOS - FUENTE OFICIAL: PRODUCTOS
// ============================================================
//
// ELINOR GESTIÓN
//
// ORDEN OFICIAL DEL COSTO:
//
// 1. COMPRA
//    Si existe stock físico comprado disponible,
//    se utiliza el costo de compra.
//
// 2. CAJÓN
//    Si no existe stock físico comprado:
//
//    Pollo entero -> valor del cajón / 19
//    Cortes       -> valor del cajón / 14
//
// 3. PRODUCTO
//    Si no existe compra ni cajón,
//    se utiliza productos.costoActual.
//
// 4. MANUAL
//    Último recurso.
//
// IMPORTANTE:
//
// El cajón NO genera stock de pechuga,
// pata muslo, alas ni otros cortes.
//
// El cajón solamente aporta costo teórico.
//
// ============================================================

// ============================================================
// UTILIDADES
// ============================================================

function numero(valor) {
const resultado = Number(valor || 0);

if (!Number.isFinite(resultado)) {
return 0;
}

return resultado;
}

function redondear(valor, decimales = 2) {
return Number(
numero(valor).toFixed(decimales)
);
}

// ============================================================
// OBTENER ÚLTIMO CAJÓN
// ============================================================

function obtenerUltimoCajon(callback) {
db.get(
`       SELECT
        id,
        fecha,
        cantidad,
        valorUnitario,
        valorTotal,
        rendimientoTeorico,
        kilosTeoricos,
        estado,
        compraId,
        observaciones
      FROM cajones
      WHERE valorUnitario > 0
      ORDER BY
        datetime(fecha) DESC,
        id DESC
      LIMIT 1
    `,
[],
(error, cajon) => {
if (error) {
return callback(error);
}


  if (!cajon) {
    return callback(null, null);
  }

  const cantidad =
    numero(cajon.cantidad) || 1;

  const valorUnitario =
    numero(cajon.valorUnitario);

  const valorTotal =
    numero(cajon.valorTotal) ||
    valorUnitario * cantidad;

  callback(
    null,
    {
      ...cajon,

      cantidad,

      valorUnitario,

      valorTotal,

      rendimientoTeorico:
        numero(
          cajon.rendimientoTeorico
        ) || 14,

      kilosTeoricos:
        numero(
          cajon.kilosTeoricos
        ),
    }
  );
}


);
}

// ============================================================
// DETERMINAR SI ES POLLO ENTERO
// ============================================================

function esPolloEntero(nombre) {
const texto =
String(nombre || "")
.trim()
.toLowerCase();

return (
texto === "pollo entero" ||
texto.includes("pollo entero")
);
}

// ============================================================
// DETERMINAR SI PUEDE USAR COSTO DE COMPRA
// ============================================================

function puedeUsarCostoCompra(producto) {
if (!producto) {
return false;
}

return (
numero(producto.esMateriaPrima) === 1
);
}

// ============================================================
// CALCULAR COSTO DESDE CAJÓN
// ============================================================
//
// Cortes:
//
// valor cajón / 14
//
// Pollo entero:
//
// valor cajón / 19
//
// ============================================================

function calcularCostoDesdeCajon(
nombre,
valorCajon
) {
const valor =
numero(valorCajon);

if (valor <= 0) {
return {
costo: 0,
divisor: 0,
};
}

const divisor =
esPolloEntero(nombre)
? 19
: 14;

return {
costo:
valor / divisor,


divisor,


};
}

// ============================================================
// BUSCAR PRODUCTO POR NOMBRE
// ============================================================

function buscarProductoPorNombre(
nombre,
callback
) {
const nombreNormalizado =
String(nombre || "").trim();

if (!nombreNormalizado) {
return callback(null, null);
}

db.get(
`       SELECT
        id,
        nombre,
        categoria,
        precio,
        stock,
        stockMinimo,
        unidad,
        tipo,
        controlaStock,
        esMateriaPrima,
        esElaborado,
        tieneReceta,
        margen,
        costoActual,
        precioSugerido,
        familiaCosto,
        activo
      FROM productos
      WHERE LOWER(TRIM(nombre)) =
            LOWER(TRIM(?))
        AND activo = 1
      LIMIT 1
    `,
[
nombreNormalizado,
],
callback
);
}

// ============================================================
// OBTENER STOCK COMPRADO DISPONIBLE
// ============================================================
//
// Solamente COMPRA.
//
// Los cajones nunca aparecen como stock físico.
//
// ============================================================

function obtenerStockCompradoDisponible(
producto,
callback
) {
if (!producto) {
return callback(
null,
{
cantidadDisponible: 0,
costoUnitario: 0,
origen: null,
origenes: [],
}
);
}

const materiaPrimaId =
numero(producto.id);

if (materiaPrimaId <= 0) {
return callback(
null,
{
cantidadDisponible: 0,
costoUnitario: 0,
origen: null,
origenes: [],
}
);
}

db.all(
`       SELECT
        id,
        materiaPrimaId,
        tipoOrigen,
        documentoOrigen,
        cantidad,
        costoUnitario,
        cantidadDisponible,
        prioridadConsumo,
        fecha
      FROM origenes_materia_prima
      WHERE materiaPrimaId = ?
        AND UPPER(TRIM(tipoOrigen)) = 'COMPRA'
        AND COALESCE(cantidadDisponible, 0) > 0
      ORDER BY
        COALESCE(prioridadConsumo, 1) ASC,
        datetime(fecha) ASC,
        id ASC
    `,
[
materiaPrimaId,
],
(
error,
origenes
) => {
if (error) {
return callback(error);
}


  const lista =
    origenes || [];

  if (lista.length === 0) {
    return callback(
      null,
      {
        cantidadDisponible: 0,
        costoUnitario: 0,
        origen: null,
        origenes: [],
      }
    );
  }

  const cantidadDisponible =
    lista.reduce(
      (
        total,
        origen
      ) =>
        total +
        numero(
          origen.cantidadDisponible
        ),
      0
    );

  const origenActual =
    lista[0];

  const costoUnitario =
    numero(
      origenActual.costoUnitario
    );

  callback(
    null,
    {
      cantidadDisponible,

      costoUnitario,

      origen:
        origenActual,

      origenes:
        lista,
    }
  );
}


);
}

// ============================================================
// OBTENER ÚLTIMA COMPRA DEL PRODUCTO
// ============================================================
//
// Se utiliza solamente como información histórica.
//
// NO decide el costo vigente.
//
// ============================================================

function obtenerUltimaCompraProducto(
producto,
callback
) {
if (!producto) {
return callback(null, null);
}

const nombre =
String(
producto.nombre || ""
).trim();

if (!nombre) {
return callback(null, null);
}

db.get(
`       SELECT
        cd.id,
        cd.compraId,
        cd.materiaPrimaId,
        cd.producto,
        cd.cantidad,
        cd.unidad,
        cd.precioUnitario,
        cd.subtotal,
        c.fecha,
        c.remito
      FROM compras_detalle cd
      INNER JOIN compras c
        ON c.id = cd.compraId
      WHERE LOWER(TRIM(cd.producto)) =
            LOWER(TRIM(?))
        AND cd.cantidad > 0
        AND cd.precioUnitario > 0
      ORDER BY
        datetime(c.fecha) DESC,
        cd.id DESC
      LIMIT 1
    `,
[
nombre,
],
callback
);
}

// ============================================================
// CALCULAR COSTO
// ============================================================

function calcularCosto(
costo,
producto,
callback
) {
const costoManual =
numero(
costo?.costoBase
);

// ----------------------------------------------------------
// SIN PRODUCTO
// ----------------------------------------------------------

if (!producto) {
return callback(
null,
{
costoBase:
costoManual,


    origenCosto:
      "MANUAL",

    valorCajon:
      0,

    divisorCajon:
      0,

    producto:
      null,

    compra:
      null,

    stockComprado:
      0,

    cajonId:
      null,
  }
);


}

obtenerUltimaCompraProducto(
producto,
(
compraError,
ultimaCompra
) => {
if (compraError) {
return callback(
compraError
);
}


  // --------------------------------------------------------
  // PRODUCTO QUE NO ES MATERIA PRIMA
  // --------------------------------------------------------

  if (
    !puedeUsarCostoCompra(
      producto
    )
  ) {
    return calcularDesdeCajonOProducto(
      costo,
      producto,
      ultimaCompra,
      callback
    );
  }

  // --------------------------------------------------------
  // BUSCAR STOCK FÍSICO
  // --------------------------------------------------------

  obtenerStockCompradoDisponible(
    producto,
    (
      stockError,
      stockCompra
    ) => {
      if (stockError) {
        return callback(
          stockError
        );
      }

      // ==================================================
      // 1. COMPRA
      // ==================================================

      if (
        numero(
          stockCompra.cantidadDisponible
        ) > 0 &&
        numero(
          stockCompra.costoUnitario
        ) > 0
      ) {
        const origen =
          stockCompra.origen;

        return callback(
          null,
          {
            costoBase:
              redondear(
                stockCompra.costoUnitario
              ),

            origenCosto:
              "COMPRA",

            valorCajon:
              0,

            divisorCajon:
              0,

            producto,

            compra:
              origen
                ? {
                    id:
                      origen.id,

                    compraId:
                      origen.documentoOrigen,

                    cantidad:
                      numero(
                        origen.cantidad
                      ),

                    cantidadDisponible:
                      numero(
                        origen.cantidadDisponible
                      ),

                    precioUnitario:
                      numero(
                        origen.costoUnitario
                      ),

                    unidad:
                      producto.unidad ||
                      "kg",

                    fecha:
                      origen.fecha,

                    remito:
                      ultimaCompra
                        ?.remito ||
                      "",
                  }
                : (
                    ultimaCompra ||
                    null
                  ),

            stockComprado:
              redondear(
                stockCompra.cantidadDisponible,
                6
              ),

            cajonId:
              null,
          }
        );
      }

      // ==================================================
      // 2. SIN STOCK -> CAJÓN
      // ==================================================

      calcularDesdeCajonOProducto(
        costo,
        producto,
        ultimaCompra,
        callback
      );
    }
  );
}


);
}

// ============================================================
// CALCULAR DESDE CAJÓN O PRODUCTO
// ============================================================

function calcularDesdeCajonOProducto(
costo,
producto,
ultimaCompra,
callback
) {
obtenerUltimoCajon(
(
cajonError,
cajon
) => {
if (cajonError) {
return callback(
cajonError
);
}


  // ======================================================
  // SIN CAJÓN
  // ======================================================

  if (!cajon) {
    const costoProducto =
      numero(
        producto.costoActual
      );

    if (costoProducto > 0) {
      return callback(
        null,
        {
          costoBase:
            redondear(
              costoProducto
            ),

          origenCosto:
            "PRODUCTO",

          valorCajon:
            0,

          divisorCajon:
            0,

          producto,

          compra:
            ultimaCompra ||
            null,

          stockComprado:
            0,

          cajonId:
            null,
        }
      );
    }

    return callback(
      null,
      {
        costoBase:
          costoManualSeguro(
            costo
          ),

        origenCosto:
          "MANUAL",

        valorCajon:
          0,

        divisorCajon:
          0,

        producto,

        compra:
          ultimaCompra ||
          null,

        stockComprado:
          0,

        cajonId:
          null,
      }
    );
  }

  // ======================================================
  // COSTO DESDE CAJÓN
  // ======================================================

  const valorCajon =
    numero(
      cajon.valorTotal
    ) ||
    numero(
      cajon.valorUnitario
    ) *
    (
      numero(
        cajon.cantidad
      ) || 1
    );

  const calculo =
    calcularCostoDesdeCajon(
      producto.nombre,
      valorCajon
    );

  if (
    calculo.costo > 0
  ) {
    return callback(
      null,
      {
        costoBase:
          redondear(
            calculo.costo
          ),

        origenCosto:
          "CAJON",

        valorCajon:
          redondear(
            valorCajon
          ),

        divisorCajon:
          calculo.divisor,

        cajonId:
          cajon.id,

        producto,

        compra:
          null,

        stockComprado:
          0,
      }
    );
  }

  // ======================================================
  // PRODUCTO
  // ======================================================

  const costoProducto =
    numero(
      producto.costoActual
    );

  if (
    costoProducto > 0
  ) {
    return callback(
      null,
      {
        costoBase:
          redondear(
            costoProducto
          ),

        origenCosto:
          "PRODUCTO",

        valorCajon:
          redondear(
            valorCajon
          ),

        divisorCajon:
          calculo.divisor,

        producto,

        compra:
          null,

        stockComprado:
          0,

        cajonId:
          cajon.id,
      }
    );
  }

  // ======================================================
  // MANUAL
  // ======================================================

  return callback(
    null,
    {
      costoBase:
        costoManualSeguro(
          costo
        ),

      origenCosto:
        "MANUAL",

      valorCajon:
        redondear(
          valorCajon
        ),

      divisorCajon:
        calculo.divisor,

      producto,

      compra:
        null,

      stockComprado:
        0,

      cajonId:
        cajon.id,
    }
  );
}


);
}

// ============================================================
// COSTO MANUAL SEGURO
// ============================================================

function costoManualSeguro(costo) {
return redondear(
costo?.costoBase || 0
);
}

// ============================================================
// ACTUALIZAR COSTO DEL PRODUCTO
// ============================================================
//
// Esta función sincroniza:
//
// productos.costoActual
//
// con el costo calculado oficialmente.
//
// ============================================================

function actualizarProductoCosto(
producto,
resultado,
callback
) {
if (
!producto ||
!producto.id
) {
return callback(null);
}

const costoActual =
redondear(
resultado.costoBase || 0
);

db.run(
`       UPDATE productos
      SET
        costoActual = ?,
        fechaActualizacion =
          CURRENT_TIMESTAMP
      WHERE id = ?
    `,
[
costoActual,
producto.id,
],
(
error
) => {
if (error) {
return callback(error);
}


  callback(null);
}


);
}

// ============================================================
// OBTENER COSTOS
// ============================================================

function getAll(callback) {
const sql = `     SELECT *
    FROM costos
    ORDER BY nombre ASC
  `;

db.all(
sql,
[],
(
error,
costos
) => {
if (error) {
return callback(error);
}


  if (
    !costos ||
    costos.length === 0
  ) {
    return callback(
      null,
      []
    );
  }

  let pendientes =
    costos.length;

  let finalizado =
    false;

  function terminar(
    errorFinal
  ) {
    if (finalizado) {
      return;
    }

    if (errorFinal) {
      finalizado = true;

      return callback(
        errorFinal
      );
    }

    pendientes--;

    if (
      pendientes === 0
    ) {
      finalizado = true;

      callback(
        null,
        costos
      );
    }
  }

  costos.forEach(
    (
      costo
    ) => {
      const nombre =
        String(
          costo.nombre || ""
        ).trim();

      // --------------------------------------------------
      // SIN NOMBRE
      // --------------------------------------------------

      if (!nombre) {
        costo.producto =
          null;

        costo.costoBaseCalculado =
          numero(
            costo.costoBase
          );

        costo.origenCosto =
          "MANUAL";

        costo.valorCajon =
          0;

        costo.divisorCajon =
          0;

        costo.compra =
          null;

        costo.stockComprado =
          0;

        return terminar(null);
      }

      // --------------------------------------------------
      // BUSCAR PRODUCTO
      // --------------------------------------------------

      buscarProductoPorNombre(
        nombre,
        (
          productoError,
          producto
        ) => {
          if (productoError) {
            return terminar(
              productoError
            );
          }

          costo.producto =
            producto ||
            null;

          calcularCosto(
            costo,
            producto,
            (
              calculoError,
              resultado
            ) => {
              if (calculoError) {
                return terminar(
                  calculoError
                );
              }

              costo.costoBaseCalculado =
                redondear(
                  resultado.costoBase
                );

              costo.origenCosto =
                resultado.origenCosto;

              costo.valorCajon =
                redondear(
                  resultado.valorCajon
                );

              costo.divisorCajon =
                numero(
                  resultado.divisorCajon
                );

              costo.compra =
                resultado.compra ||
                null;

              costo.stockComprado =
                redondear(
                  resultado.stockComprado,
                  6
                );

              costo.cajonId =
                resultado.cajonId ||
                null;

              // ------------------------------------------------
              // INFORMACIÓN DE COMPRA
              // ------------------------------------------------

              if (
                resultado.compra
              ) {
                costo.costoCompra =
                  numero(
                    resultado.compra
                      .precioUnitario
                  );

                costo.fechaCompra =
                  resultado.compra
                    .fecha ||
                  null;

                costo.remitoCompra =
                  resultado.compra
                    .remito ||
                  "";

                costo.cantidadCompra =
                  numero(
                    resultado.compra
                      .cantidad
                  );

                costo.unidadCompra =
                  resultado.compra
                    .unidad ||
                  costo.unidad ||
                  producto?.unidad ||
                  "kg";
              } else {
                costo.costoCompra =
                  0;

                costo.fechaCompra =
                  null;

                costo.remitoCompra =
                  "";

                costo.cantidadCompra =
                  0;

                costo.unidadCompra =
                  "";
              }

              // ------------------------------------------------
              // SINCRONIZAR PRODUCTOS
              // ------------------------------------------------

              actualizarProductoCosto(
                producto,
                resultado,
                (
                  sincronizacionError
                ) => {
                  if (
                    sincronizacionError
                  ) {
                    return terminar(
                      sincronizacionError
                    );
                  }

                  terminar(
                    null
                  );
                }
              );
            }
          );
        }
      );
    }
  );
}


);
}

// ============================================================
// GUARDAR HISTORIAL
// ============================================================

function guardarHistorial(
costo
) {
db.run(
`       INSERT INTO costos_historial
      (
        nombre,
        unidad,
        costoBase,
        margen,
        precioSugerido
      )
      VALUES (?, ?, ?, ?, ?)
    `,
[
costo.nombre,
costo.unidad,
costo.costoBase,
costo.margen,
costo.precioSugerido,
],
(
error
) => {
if (error) {
console.error(
"❌ Error guardando historial de costo:",
error.message
);
}
}
);
}

// ============================================================
// CREAR COSTO
// ============================================================

function create(
costo,
callback
) {
if (
!costo ||
!String(
costo.nombre || ""
).trim()
) {
return callback(
new Error(
"Debe indicar un producto."
)
);
}

db.get(
`       SELECT
        id
      FROM costos
      WHERE LOWER(TRIM(nombre)) =
            LOWER(TRIM(?))
      LIMIT 1
    `,
[
costo.nombre,
],
(
errorExistente,
row
) => {
if (errorExistente) {
return callback(
errorExistente
);
}


  buscarProductoPorNombre(
    costo.nombre,
    (
      productoError,
      producto
    ) => {
      if (productoError) {
        return callback(
          productoError
        );
      }

      calcularCosto(
        costo,
        producto,
        (
          calculoError,
          resultado
        ) => {
          if (calculoError) {
            return callback(
              calculoError
            );
          }

          const costoBase =
            redondear(
              resultado.costoBase
            );

          const margen =
            numero(
              costo.margen
            );

          const precioSugerido =
            numero(
              costo.precioSugerido
            );

          const unidad =
            costo.unidad ||
            producto?.unidad ||
            "kg";

          // ------------------------------------------------
          // SINCRONIZAR PRODUCTO
          // ------------------------------------------------

          actualizarProductoCosto(
            producto,
            resultado,
            (
              sincronizacionError
            ) => {
              if (
                sincronizacionError
              ) {
                return callback(
                  sincronizacionError
                );
              }

              // ----------------------------------------------
              // ACTUALIZAR COSTO EXISTENTE
              // ----------------------------------------------

              if (row) {
                db.run(
                  `
                    UPDATE costos
                    SET
                      nombre = ?,
                      unidad = ?,
                      costoBase = ?,
                      margen = ?,
                      precioSugerido = ?,
                      fecha = CURRENT_TIMESTAMP
                    WHERE id = ?
                  `,
                  [
                    costo.nombre,
                    unidad,
                    costoBase,
                    margen,
                    precioSugerido,
                    row.id,
                  ],
                  (
                    updateError
                  ) => {
                    if (
                      updateError
                    ) {
                      return callback(
                        updateError
                      );
                    }

                    guardarHistorial(
                      {
                        ...costo,

                        nombre:
                          costo.nombre,

                        unidad,

                        costoBase,

                        margen,

                        precioSugerido,
                      }
                    );

                    callback(
                      null,
                      row.id
                    );
                  }
                );

                return;
              }

              // ----------------------------------------------
              // CREAR NUEVO COSTO
              // ----------------------------------------------

              db.run(
                `
                  INSERT INTO costos
                  (
                    nombre,
                    unidad,
                    costoBase,
                    margen,
                    precioSugerido
                  )
                  VALUES (?, ?, ?, ?, ?)
                `,
                [
                  costo.nombre,
                  unidad,
                  costoBase,
                  margen,
                  precioSugerido,
                ],
                function (
                  insertError
                ) {
                  if (
                    insertError
                  ) {
                    return callback(
                      insertError
                    );
                  }

                  guardarHistorial(
                    {
                      ...costo,

                      nombre:
                        costo.nombre,

                      unidad,

                      costoBase,

                      margen,

                      precioSugerido,
                    }
                  );

                  callback(
                    null,
                    this.lastID
                  );
                }
              );
            }
          );
        }
      );
    }
  );
}


);
}

// ============================================================
// ACTUALIZAR COSTO
// ============================================================

function update(
id,
costo,
callback
) {
if (
!costo ||
!String(
costo.nombre || ""
).trim()
) {
return callback(
new Error(
"Debe indicar un producto."
)
);
}

buscarProductoPorNombre(
costo.nombre,
(
productoError,
producto
) => {
if (productoError) {
return callback(
productoError
);
}


  calcularCosto(
    costo,
    producto,
    (
      calculoError,
      resultado
    ) => {
      if (calculoError) {
        return callback(
          calculoError
        );
      }

      const unidad =
        costo.unidad ||
        producto?.unidad ||
        "kg";

      const costoBase =
        redondear(
          resultado.costoBase
        );

      const margen =
        numero(
          costo.margen
        );

      const precioSugerido =
        numero(
          costo.precioSugerido
        );

      // ------------------------------------------------
      // SINCRONIZAR PRODUCTO
      // ------------------------------------------------

      actualizarProductoCosto(
        producto,
        resultado,
        (
          sincronizacionError
        ) => {
          if (
            sincronizacionError
          ) {
            return callback(
              sincronizacionError
            );
          }

          db.run(
            `
              UPDATE costos
              SET
                nombre = ?,
                unidad = ?,
                costoBase = ?,
                margen = ?,
                precioSugerido = ?,
                fecha = CURRENT_TIMESTAMP
              WHERE id = ?
            `,
            [
              costo.nombre,
              unidad,
              costoBase,
              margen,
              precioSugerido,
              id,
            ],
            function (
              updateError
            ) {
              if (updateError) {
                return callback(
                  updateError
                );
              }

              if (
                this.changes === 0
              ) {
                return callback(
                  new Error(
                    "No se encontró el costo indicado."
                  )
                );
              }

              guardarHistorial(
                {
                  ...costo,

                  nombre:
                    costo.nombre,

                  unidad,

                  costoBase,

                  margen,

                  precioSugerido,
                }
              );

              callback(null);
            }
          );
        }
      );
    }
  );
}


);
}

// ============================================================
// EXPORTAR
// ============================================================

module.exports = {
getAll,
create,
update,
buscarProductoPorNombre,
obtenerStockCompradoDisponible,
obtenerUltimaCompraProducto,
obtenerUltimoCajon,
calcularCosto,
};
