const db = require("../../database/connection");

// ============================================================
// MATERIAS PRIMAS SERVICE
// ============================================================
//
// ARQUITECTURA CENTRAL DE ELINOR
//
// Productos
//    ↓
// productos.esMateriaPrima = 1
//
// ORÍGENES DE STOCK:
//
// COMPRA
//   prioridad 1
//
// CAJÓN
//   prioridad 2
//
// El consumo siempre intenta:
//
// 1. COMPRA
// 2. CAJÓN
//
// dentro de cada prioridad:
//   fecha ASC
//   id ASC
//
// Este archivo es el motor central de consumo por origen.
//
// Producción NO debe duplicar esta lógica.
// Stock tampoco debe decidir de qué origen consumir.
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
// OBTENER MATERIAS PRIMAS
// ============================================================

function getAll(callback) {
  console.log(
    "ENTRO A GET ALL MATERIAS PRIMAS"
  );

  const sql = `
    SELECT
      id,
      nombre,
      origen,
      unidad,
      costoActual,
      rendimiento,
      merma,
      fecha,
      tipo
    FROM materias_primas
    ORDER BY nombre ASC
  `;

  db.all(
    sql,
    [],
    (error, rows) => {
      if (error) {
        console.error(
          "ERROR SQL MATERIAS PRIMAS:",
          error
        );
      } else {
        console.log(
          "MATERIAS PRIMAS:",
          rows
        );
      }

      callback(
        error,
        rows
      );
    }
  );
}


// ============================================================
// CREAR MATERIA PRIMA
// ============================================================

function create(
  materiaPrima,
  callback
) {
  const sql = `
    INSERT INTO materias_primas
    (
      nombre,
      origen,
      unidad,
      costoActual,
      rendimiento,
      merma,
      tipo
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      materiaPrima.nombre || "",
      materiaPrima.origen || "Proveedor",
      materiaPrima.unidad || "kg",
      numero(
        materiaPrima.costoActual
      ),
      numero(
        materiaPrima.rendimiento
      ) || 100,
      numero(
        materiaPrima.merma
      ),
      materiaPrima.tipo || "Compra",
    ],
    function (error) {
      if (error) {
        console.error(
          "ERROR CREANDO MATERIA PRIMA:",
          error
        );

        return callback(
          error
        );
      }

      callback(
        null,
        this.lastID
      );
    }
  );
}


// ============================================================
// ACTUALIZAR MATERIA PRIMA
// ============================================================

function update(
  id,
  materiaPrima,
  callback
) {
  const sql = `
    UPDATE materias_primas
    SET
      nombre = ?,
      origen = ?,
      unidad = ?,
      costoActual = ?,
      rendimiento = ?,
      merma = ?,
      tipo = ?
    WHERE id = ?
  `;

  db.run(
    sql,
    [
      materiaPrima.nombre || "",
      materiaPrima.origen || "Proveedor",
      materiaPrima.unidad || "kg",
      numero(
        materiaPrima.costoActual
      ),
      numero(
        materiaPrima.rendimiento
      ) || 100,
      numero(
        materiaPrima.merma
      ),
      materiaPrima.tipo || "Compra",
      id,
    ],
    function (error) {
      if (error) {
        console.error(
          "ERROR ACTUALIZANDO MATERIA PRIMA:",
          error
        );

        return callback(
          error
        );
      }

      if (
        this.changes === 0
      ) {
        return callback(
          new Error(
            "No se encontró la materia prima indicada."
          )
        );
      }

      callback(
        null
      );
    }
  );
}


// ============================================================
// OBTENER ORÍGENES
// ============================================================

function getOrigenes(
  id,
  callback
) {
  db.all(
    `
      SELECT *
      FROM origenes_materia_prima
      WHERE materiaPrimaId = ?
      ORDER BY
        prioridadConsumo ASC,
        fecha ASC,
        id ASC
    `,
    [
      id,
    ],
    (
      error,
      rows
    ) => {
      if (error) {
        console.error(
          "ERROR OBTENIENDO ORÍGENES:",
          error
        );

        return callback(
          error
        );
      }

      callback(
        null,
        rows || []
      );
    }
  );
}


// ============================================================
// OBTENER ORÍGENES DISPONIBLES
// ============================================================
//
// ORDEN:
//
// 1. prioridadConsumo
// 2. fecha
// 3. id
//
// COMPRA = 1
// CAJÓN  = 2
//
// ============================================================

function getOrigenesDisponibles(
  materiaPrimaId,
  callback
) {
  db.all(
    `
      SELECT *
      FROM origenes_materia_prima
      WHERE
        materiaPrimaId = ?
        AND cantidadDisponible > 0
      ORDER BY
        prioridadConsumo ASC,
        fecha ASC,
        id ASC
    `,
    [
      materiaPrimaId,
    ],
    (
      error,
      rows
    ) => {
      if (error) {
        return callback(
          error
        );
      }

      callback(
        null,
        rows || []
      );
    }
  );
}


// ============================================================
// CALCULAR COSTO PONDERADO DISPONIBLE
// ============================================================
//
// NO CONSUME STOCK.
//
// Sirve para conocer el costo promedio de todo
// el stock disponible actualmente.
//
// Ejemplo:
//
// COMPRA
// 10 kg × $8.000
//
// CAJÓN
// 20 kg × $6.000
//
// Costo ponderado:
//
// (10×8000 + 20×6000) / 30
//
// ============================================================

function getCostoPonderadoDisponible(
  materiaPrimaId,
  callback
) {
  getOrigenesDisponibles(
    materiaPrimaId,
    (
      error,
      origenes
    ) => {
      if (error) {
        return callback(
          error
        );
      }

      if (
        !origenes ||
        origenes.length === 0
      ) {
        return callback(
          null,
          {
            materiaPrimaId,
            cantidadDisponible: 0,
            costoTotal: 0,
            costoUnitarioPonderado: 0,
            origenes: [],
          }
        );
      }

      let cantidadTotal = 0;
      let costoTotal = 0;

      origenes.forEach(
        (
          origen
        ) => {
          const cantidad =
            numero(
              origen.cantidadDisponible
            );

          const costoUnitario =
            numero(
              origen.costoUnitario
            );

          cantidadTotal +=
            cantidad;

          costoTotal +=
            cantidad *
            costoUnitario;
        }
      );

      const costoUnitarioPonderado =
        cantidadTotal > 0
          ? costoTotal /
            cantidadTotal
          : 0;

      callback(
        null,
        {
          materiaPrimaId,

          cantidadDisponible:
            redondear(
              cantidadTotal,
              6
            ),

          costoTotal:
            redondear(
              costoTotal
            ),

          costoUnitarioPonderado:
            redondear(
              costoUnitarioPonderado
            ),

          origenes,
        }
      );
    }
  );
}


// ============================================================
// CONSUMIR MATERIA PRIMA
// ============================================================
//
// MOTOR CENTRAL.
//
// Ejemplo:
//
// COMPRA
// 10 kg × $8.000
//
// CAJÓN
// 20 kg × $6.000
//
// Producción necesita 12 kg.
//
// Resultado:
//
// COMPRA → 10 kg
// CAJÓN  →  2 kg
//
// El costo real del consumo será:
//
// (10×8000 + 2×6000) / 12
//
// ============================================================

function consumirMateriaPrima(
  materiaPrimaId,
  cantidad,
  referenciaId,
  tipoMovimiento,
  callback
) {
  const cantidadSolicitada =
    numero(
      cantidad
    );

  if (
    !materiaPrimaId ||
    cantidadSolicitada <= 0
  ) {
    return callback(
      new Error(
        "La materia prima y la cantidad a consumir son obligatorias."
      )
    );
  }

  getOrigenesDisponibles(
    materiaPrimaId,
    (
      error,
      origenes
    ) => {
      if (error) {
        return callback(
          error
        );
      }

      if (
        !origenes ||
        origenes.length === 0
      ) {
        return callback(
          new Error(
            "No existe stock disponible para esta materia prima."
          )
        );
      }

      const stockTotal =
        origenes.reduce(
          (
            total,
            origen
          ) => {
            return (
              total +
              numero(
                origen.cantidadDisponible
              )
            );
          },
          0
        );

      const unidad =
        origenes[0].unidad ||
        "kg";

      if (
        stockTotal <
        cantidadSolicitada
      ) {
        return callback(
          new Error(
            `Stock insuficiente. Disponible: ${redondear(stockTotal, 6)} ${unidad}. Solicitado: ${redondear(cantidadSolicitada, 6)} ${unidad}.`
          )
        );
      }

      let pendiente =
        cantidadSolicitada;

      let costoTotalConsumido =
        0;

      const consumos = [];

      let index = 0;

      // --------------------------------------------------------
      // TRANSACCIÓN
      // --------------------------------------------------------

      db.serialize(
        () => {
          db.run(
            "BEGIN TRANSACTION",
            (
              beginError
            ) => {
              if (beginError) {
                return callback(
                  beginError
                );
              }

              function rollback(
                error
              ) {
                db.run(
                  "ROLLBACK",
                  () => {
                    callback(
                      error
                    );
                  }
                );
              }

              function finalizar() {
                const cantidadConsumida =
                  cantidadSolicitada -
                  pendiente;

                const costoUnitarioPonderado =
                  cantidadConsumida > 0
                    ? costoTotalConsumido /
                      cantidadConsumida
                    : 0;

                db.run(
                  "COMMIT",
                  (
                    commitError
                  ) => {
                    if (
                      commitError
                    ) {
                      return rollback(
                        commitError
                      );
                    }

                    callback(
                      null,
                      {
                        materiaPrimaId:
                          Number(
                            materiaPrimaId
                          ),

                        cantidadSolicitada:
                          redondear(
                            cantidadSolicitada,
                            6
                          ),

                        cantidadConsumida:
                          redondear(
                            cantidadConsumida,
                            6
                          ),

                        costoTotal:
                          redondear(
                            costoTotalConsumido
                          ),

                        costoUnitarioPonderado:
                          redondear(
                            costoUnitarioPonderado
                          ),

                        referenciaId:
                          referenciaId ||
                          null,

                        tipoMovimiento:
                          tipoMovimiento ||
                          "CONSUMO",

                        consumos,
                      }
                    );
                  }
                );
              }

              function consumirSiguiente() {
                if (
                  pendiente <= 0.000001
                ) {
                  pendiente = 0;

                  return finalizar();
                }

                if (
                  index >=
                  origenes.length
                ) {
                  return rollback(
                    new Error(
                      "No fue posible completar el consumo."
                    )
                  );
                }

                const origen =
                  origenes[index];

                const disponible =
                  numero(
                    origen.cantidadDisponible
                  );

                if (
                  disponible <= 0
                ) {
                  index++;

                  return consumirSiguiente();
                }

                const cantidadAConsumir =
                  Math.min(
                    pendiente,
                    disponible
                  );

                const nuevaCantidad =
                  Math.max(
                    0,
                    disponible -
                      cantidadAConsumir
                  );

                const costoUnitario =
                  numero(
                    origen.costoUnitario
                  );

                if (
                  costoUnitario <= 0
                ) {
                  return rollback(
                    new Error(
                      `El origen ${origen.id} no tiene un costo unitario válido.`
                    )
                  );
                }

                const costoConsumido =
                  cantidadAConsumir *
                  costoUnitario;

                db.run(
                  `
                    UPDATE origenes_materia_prima
                    SET
                      cantidadDisponible = ?,
                      fechaActualizacion =
                        CURRENT_TIMESTAMP
                    WHERE id = ?
                  `,
                  [
                    redondear(
                      nuevaCantidad,
                      6
                    ),

                    origen.id,
                  ],
                  (
                    updateError
                  ) => {
                    if (
                      updateError
                    ) {
                      return rollback(
                        updateError
                      );
                    }

                    costoTotalConsumido +=
                      costoConsumido;

                    consumos.push(
                      {
                        origenId:
                          origen.id,

                        tipoOrigen:
                          origen.tipoOrigen,

                        documentoOrigen:
                          origen.documentoOrigen,

                        cantidadConsumida:
                          redondear(
                            cantidadAConsumir,
                            6
                          ),

                        costoUnitario:
                          redondear(
                            costoUnitario
                          ),

                        costoConsumido:
                          redondear(
                            costoConsumido
                          ),

                        cantidadDisponible:
                          redondear(
                            nuevaCantidad,
                            6
                          ),

                        prioridadConsumo:
                          origen.prioridadConsumo,
                      }
                    );

                    pendiente =
                      pendiente -
                      cantidadAConsumir;

                    if (
                      Math.abs(
                        pendiente
                      ) < 0.000001
                    ) {
                      pendiente = 0;
                    }

                    index++;

                    consumirSiguiente();
                  }
                );
              }

              consumirSiguiente();
            }
          );
        }
      );
    }
  );
}


// ============================================================
// OBTENER COSTO ACTUAL POR ORIGEN
// ============================================================
//
// No consume.
//
// Devuelve el origen de mayor prioridad disponible.
//
// ============================================================

function getCostoActualMateriaPrima(
  materiaPrimaId,
  callback
) {
  getOrigenesDisponibles(
    materiaPrimaId,
    (
      error,
      origenes
    ) => {
      if (error) {
        return callback(
          error
        );
      }

      if (
        !origenes ||
        origenes.length === 0
      ) {
        return callback(
          null,
          {
            materiaPrimaId,
            costoActual: 0,
            origen: null,
            origenId: null,
            cantidadDisponible: 0,
          }
        );
      }

      const origen =
        origenes[0];

      const costo =
        numero(
          origen.costoUnitario
        );

      callback(
        null,
        {
          materiaPrimaId,

          costoActual:
            redondear(
              costo
            ),

          origen:
            origen.tipoOrigen,

          origenId:
            origen.id,

          cantidadDisponible:
            redondear(
              origen.cantidadDisponible,
              6
            ),
        }
      );
    }
  );
}


// ============================================================
// ACTUALIZAR COSTO ACTUAL
// ============================================================
//
// Sincroniza productos.costoActual con el origen
// actualmente prioritario.
//
// ============================================================

function actualizarCostoActual(
  materiaPrimaId,
  callback
) {
  getCostoActualMateriaPrima(
    materiaPrimaId,
    (
      error,
      resultado
    ) => {
      if (error) {
        return callback(
          error
        );
      }

      db.run(
        `
          UPDATE productos
          SET
            costoActual = ?,
            fechaActualizacion =
              CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        [
          resultado.costoActual,
          materiaPrimaId,
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

          callback(
            null,
            resultado
          );
        }
      );
    }
  );
}


// ============================================================
// CONSUMIR Y ACTUALIZAR COSTO
// ============================================================
//
// Atajo para Producción.
//
// 1. consume origen/es
// 2. recalcula costo actual
//
// ============================================================

function consumirYActualizarCosto(
  materiaPrimaId,
  cantidad,
  referenciaId,
  tipoMovimiento,
  callback
) {
  consumirMateriaPrima(
    materiaPrimaId,
    cantidad,
    referenciaId,
    tipoMovimiento,
    (
      consumoError,
      consumo
    ) => {
      if (
        consumoError
      ) {
        return callback(
          consumoError
        );
      }

      actualizarCostoActual(
        materiaPrimaId,
        (
          costoError,
          costo
        ) => {
          if (
            costoError
          ) {
            return callback(
              costoError
            );
          }

          callback(
            null,
            {
              consumo,

              costoActual:
                costo.costoActual,

              origenCosto:
                costo.origen,

              cantidadDisponible:
                costo.cantidadDisponible,
            }
          );
        }
      );
    }
  );
}


// ============================================================
// CREAR ORIGEN DE CAJÓN
// ============================================================
//
// NO registra desposte real.
//
// El cajón genera un origen teórico.
//
// Regla:
//
// cantidad de cajones × rendimiento teórico
//
// Por defecto:
//
// 1 cajón = 14 kg
//
// ============================================================

function generarOrigenCajon(
  productoId,
  cajonId,
  callback
) {
  db.get(
    `
      SELECT
        id,
        cantidad,
        valorUnitario,
        valorTotal,
        rendimientoTeorico,
        kilosTeoricos
      FROM cajones
      WHERE id = ?
      LIMIT 1
    `,
    [
      Number(
        cajonId
      ),
    ],
    (
      error,
      cajon
    ) => {
      if (error) {
        return callback(
          error
        );
      }

      if (!cajon) {
        return callback(
          new Error(
            `No existe el cajón ${cajonId}.`
          )
        );
      }

      const cantidadCajones =
        numero(
          cajon.cantidad
        ) || 1;

      const valorTotal =
        numero(
          cajon.valorTotal
        ) ||
        (
          numero(
            cajon.valorUnitario
          ) *
          cantidadCajones
        );

      const rendimiento =
        numero(
          cajon.rendimientoTeorico
        ) || 14;

      const kilosTeoricos =
        numero(
          cajon.kilosTeoricos
        ) ||
        (
          cantidadCajones *
          rendimiento
        );

      if (
        valorTotal <= 0 ||
        kilosTeoricos <= 0
      ) {
        return callback(
          new Error(
            `El cajón ${cajonId} no tiene datos suficientes para generar su origen.`
          )
        );
      }

      const costoKg =
        valorTotal /
        kilosTeoricos;

      db.run(
        `
          INSERT INTO origenes_materia_prima
          (
            materiaPrimaId,
            tipoOrigen,
            documentoOrigen,
            cantidad,
            costoUnitario,
            cantidadDisponible,
            prioridadConsumo
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          Number(
            productoId
          ),

          "CAJON",

          Number(
            cajonId
          ),

          redondear(
            kilosTeoricos,
            6
          ),

          redondear(
            costoKg
          ),

          redondear(
            kilosTeoricos,
            6
          ),

          2,
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

          callback(
            null,
            {
              id:
                this.lastID,

              materiaPrimaId:
                Number(
                  productoId
                ),

              tipoOrigen:
                "CAJON",

              documentoOrigen:
                Number(
                  cajonId
                ),

              cantidad:
                redondear(
                  kilosTeoricos,
                  6
                ),

              cantidadDisponible:
                redondear(
                  kilosTeoricos,
                  6
                ),

              costoUnitario:
                redondear(
                  costoKg
                ),

              prioridadConsumo:
                2,
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

  getOrigenes,
  getOrigenesDisponibles,

  getCostoPonderadoDisponible,
  getCostoActualMateriaPrima,

  actualizarCostoActual,

  consumirMateriaPrima,
  consumirYActualizarCosto,

  generarOrigenCajon,
};