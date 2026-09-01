const db = require("../../database/connection");

// ============================================================
// PRODUCCIÓN SERVICE
// ============================================================
//
// LÓGICA DEFINITIVA DE ELINOR
//
// El cajón es una UNIDAD DE COMPRA.
//
// Elinor NO registra:
// - cantidad de pollos por cajón
// - kilos físicos al recibir el cajón
// - número individual del cajón
// - identificación física de cada cajón
//
// Los cajones pueden contener físicamente cantidades diferentes
// de pollos. El sistema no necesita conocer esa cantidad.
//
// ------------------------------------------------------------
//
// UN CAJÓN PUEDE TENER DOS DESTINOS:
//
// 1. POLLO ENTERO
// 2. CORTE / DESPOSTE
//
// Por eso un cajón NO debe obligatoriamente pasar completo
// a "cortado".
//
// Ejemplo real:
//
// Una compra puede traer cajones que físicamente contienen
// distintas cantidades de pollos.
//
// El negocio puede vender parte de esos pollos enteros y
// utilizar el resto para corte.
//
// Elinor no registra "7 pollos, 4 vendidos, 3 restantes".
//
// Elinor solamente registra:
// - cajones comprados
// - kilos vendidos como Pollo entero
// - cajones destinados al corte
//
// ------------------------------------------------------------
//
// REFERENCIA TEÓRICA:
//
// Para valorar pollo entero:
//
// valor del cajón / 19 kg
//
// Para valorar cortes:
//
// valor del cajón / 14 kg
//
// IMPORTANTE:
//
// Los 19 kg y 14 kg son referencias de COSTO.
//
// No representan el peso físico real de cada cajón.
//
// Tampoco significan que cada cajón tenga exactamente 19 kg
// de pollo ni exactamente 14 kg de cortes.
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
  return Number(numero(valor).toFixed(decimales));
}

// ============================================================
// OBTENER PRODUCTO MATERIA PRIMA
// ============================================================

function obtenerMateriaPrima(productoId, callback) {
  db.get(
    `SELECT id, nombre, unidad, costoActual, esMateriaPrima, activo FROM productos WHERE id = ? AND activo = 1 LIMIT 1`,
    [Number(productoId)],
    (error, producto) => {
      if (error) {
        return callback(error);
      }

      if (!producto) {
        return callback(new Error(`No existe el producto con ID ${productoId}.`));
      }

      if (numero(producto.esMateriaPrima) !== 1) {
        return callback(new Error(`El producto "${producto.nombre}" no está marcado como materia prima.`));
      }

      callback(null, producto);
    }
  );
}

// ============================================================
// OBTENER STOCK FÍSICO DISPONIBLE
// ============================================================
//
// Solamente se consideran orígenes de COMPRA.
//
// Los cajones no se mezclan con estos orígenes.
//
// ============================================================

function obtenerOrigenesDisponibles(productoId, callback) {
  db.all(
    `SELECT id, materiaPrimaId, tipoOrigen, documentoOrigen, cantidad, costoUnitario, cantidadDisponible, prioridadConsumo, fecha FROM origenes_materia_prima WHERE materiaPrimaId = ? AND tipoOrigen = 'COMPRA' AND cantidadDisponible > 0 ORDER BY COALESCE(prioridadConsumo, 1) ASC, fecha ASC, id ASC`,
    [Number(productoId)],
    (error, origenes) => {
      if (error) {
        return callback(error);
      }

      callback(null, origenes || []);
    }
  );
}

// ============================================================
// OBTENER COSTO DE UN ORIGEN
// ============================================================

function obtenerCostoOrigen(origen, callback) {
  const tipo = String(origen.tipoOrigen || "").trim().toUpperCase();
  const costo = numero(origen.costoUnitario);

  if (costo <= 0) {
    return callback(new Error(`El origen ${origen.id} (${tipo || "SIN TIPO"}) no tiene un costo válido.`));
  }

  callback(null, costo);
}

// ============================================================
// OBTENER CAJONES DISPONIBLES
// ============================================================
//
// cantidad = cantidad de cajones.
//
// cantidadDisponible = cantidad de cajones que todavía pueden
// utilizarse.
//
// NO representa cantidad de pollos.
//
// NO representa kilos físicos.
//
// ============================================================

function obtenerCajonesDisponibles(callback) {
  db.all(
    `SELECT id, fecha, cantidad, valorUnitario, valorTotal, rendimientoTeorico, kilosTeoricos, estado, compraId, observaciones, cantidadDisponible, cantidadCortada, cantidadEnteraVendida, fechaCorte, observacionesProduccion FROM cajones WHERE COALESCE(cantidadDisponible, 0) > 0 ORDER BY fecha ASC, id ASC`,
    [],
    (error, cajones) => {
      if (error) {
        return callback(error);
      }

      callback(null, cajones || []);
    }
  );
}

// ============================================================
// OBTENER CAJÓN DISPONIBLE MÁS ANTIGUO
// ============================================================

function obtenerCajonDisponible(callback) {
  db.get(
    `SELECT id, fecha, cantidad, valorUnitario, valorTotal, rendimientoTeorico, kilosTeoricos, estado, compraId, observaciones, cantidadDisponible, cantidadCortada, cantidadEnteraVendida, fechaCorte, observacionesProduccion FROM cajones WHERE COALESCE(cantidadDisponible, 0) > 0 ORDER BY fecha ASC, id ASC LIMIT 1`,
    [],
    (error, cajon) => {
      if (error) {
        return callback(error);
      }

      callback(null, cajon || null);
    }
  );
}

// ============================================================
// OBTENER ÚLTIMO CAJÓN CON COSTO TEÓRICO
// ============================================================
//
// Se utiliza para calcular el costo de cortes.
//
// IMPORTANTE:
//
// Un cajón utilizado para obtener costo teórico no genera
// automáticamente stock de cortes.
//
// ============================================================

function obtenerUltimoCajonCortado(callback) {
  db.get(
    `SELECT id, fecha, cantidad, valorUnitario, valorTotal, rendimientoTeorico, kilosTeoricos, estado, compraId, observaciones, cantidadDisponible, cantidadCortada, cantidadEnteraVendida FROM cajones WHERE UPPER(TRIM(estado)) IN ('CORTADO', 'PARCIAL') AND COALESCE(cantidadCortada, 0) > 0 ORDER BY fecha DESC, id DESC LIMIT 1`,
    [],
    (error, cajon) => {
      if (error) {
        return callback(error);
      }

      if (!cajon) {
        return callback(null, null);
      }

      const cantidadCajones = numero(cajon.cantidad) || 1;
      const valorTotal = numero(cajon.valorTotal) || numero(cajon.valorUnitario) * cantidadCajones;

      if (valorTotal <= 0) {
        return callback(null, null);
      }

      callback(null, {
        id: cajon.id,
        fecha: cajon.fecha,
        cantidad: cantidadCajones,
        valorUnitario: numero(cajon.valorUnitario),
        valorTotal,
        rendimientoTeorico: numero(cajon.rendimientoTeorico) || 14,
        kilosTeoricos: numero(cajon.kilosTeoricos),
        estado: cajon.estado,
        compraId: cajon.compraId,
        observaciones: cajon.observaciones,
        cantidadDisponible: numero(cajon.cantidadDisponible),
        cantidadCortada: numero(cajon.cantidadCortada),
        cantidadEnteraVendida: numero(cajon.cantidadEnteraVendida),
        costoCortes: redondear(valorTotal / 14),
        costoPolloEntero: redondear(valorTotal / 19),
      });
    }
  );
}

// ============================================================
// COMPATIBILIDAD
// ============================================================

function obtenerCajonTeorico(callback) {
  obtenerUltimoCajonCortado(callback);
}

// ============================================================
// OBTENER COSTO TEÓRICO DE CORTES
// ============================================================
//
// valor del cajón / 14
//
// No crea stock.
//
// No descuenta stock de productos.
//
// ============================================================

function obtenerCostoTeoricoCortes(callback) {
  obtenerUltimoCajonCortado((error, cajon) => {
    if (error) {
      return callback(error);
    }

    if (!cajon) {
      return callback(new Error("No existe un cajón cortado disponible para calcular el costo teórico de los cortes."));
    }

    const costo = numero(cajon.costoCortes);

    if (costo <= 0) {
      return callback(new Error(`El cajón ${cajon.id} no permite calcular un costo teórico válido.`));
    }

    callback(null, {
      cajonId: cajon.id,
      fecha: cajon.fecha,
      valorTotal: cajon.valorTotal,
      divisor: 14,
      costoUnitario: costo,
      tipoCosto: "CAJON_14",
    });
  });
}

// ============================================================
// OBTENER COSTO TEÓRICO POLLO ENTERO
// ============================================================
//
// valor del cajón / 19
//
// ============================================================

function obtenerCostoTeoricoPolloEntero(callback) {
  obtenerUltimoCajonCortado((error, cajon) => {
    if (error) {
      return callback(error);
    }

    if (!cajon) {
      return callback(new Error("No existe un cajón con costo disponible para calcular el costo teórico del pollo entero."));
    }

    const costo = numero(cajon.costoPolloEntero);

    if (costo <= 0) {
      return callback(new Error(`El cajón ${cajon.id} no permite calcular un costo teórico válido para pollo entero.`));
    }

    callback(null, {
      cajonId: cajon.id,
      fecha: cajon.fecha,
      valorTotal: cajon.valorTotal,
      divisor: 19,
      costoUnitario: costo,
      tipoCosto: "CAJON_19",
    });
  });
}

// ============================================================
// CONSUMIR ORIGEN FÍSICO
// ============================================================

function consumirOrigen(origen, cantidadSolicitada, callback) {
  const disponible = numero(origen.cantidadDisponible);
  const solicitada = numero(cantidadSolicitada);

  if (disponible <= 0 || solicitada <= 0) {
    return callback(null, {
      cantidadConsumida: 0,
      costoUnitario: 0,
      costoTotal: 0,
    });
  }

  const cantidadConsumir = Math.min(disponible, solicitada);

  obtenerCostoOrigen(origen, (costoError, costoUnitario) => {
    if (costoError) {
      return callback(costoError);
    }

    const costoTotal = cantidadConsumir * costoUnitario;
    const nuevaCantidadDisponible = Math.max(0, disponible - cantidadConsumir);

    db.run(
      `
      UPDATE origenes_materia_prima
      SET
        cantidadDisponible = ?,
        fechaActualizacion = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [redondear(nuevaCantidadDisponible, 6), origen.id],
      (error) => {
        if (error) {
          return callback(error);
        }

        callback(null, {
          cantidadConsumida: redondear(cantidadConsumir, 6),
          costoUnitario: redondear(costoUnitario),
          costoTotal: redondear(costoTotal),
          origenId: origen.id,
          tipoOrigen: origen.tipoOrigen,
          documentoOrigen: origen.documentoOrigen,
          cantidadDisponibleAnterior: redondear(disponible, 6),
          cantidadDisponibleNueva: redondear(nuevaCantidadDisponible, 6),
        });
      }
    );
  });
}

// ============================================================
// CONSUMIR MATERIA PRIMA
// ============================================================
//
// FLUJO:
//
// 1. Busca stock físico comprado.
// 2. Consume primero ese stock.
// 3. Si falta cantidad, utiliza costo teórico de cajón.
// 4. El excedente teórico NO crea stock.
//
// ============================================================

function consumirMateriaPrima(productoId, cantidad, callback) {
  const cantidadNecesaria = numero(cantidad);

  if (cantidadNecesaria <= 0) {
    return callback(new Error("La cantidad a consumir debe ser mayor a cero."));
  }

  obtenerMateriaPrima(productoId, (productoError, producto) => {
    if (productoError) {
      return callback(productoError);
    }

    obtenerOrigenesDisponibles(producto.id, (origenError, origenes) => {
      if (origenError) {
        return callback(origenError);
      }

      let restante = cantidadNecesaria;
      let costoTotal = 0;
      const movimientos = [];
      let index = 0;

      function consumirCompras() {
        if (restante <= 0) {
          return finalizar();
        }

        if (index >= origenes.length) {
          return consumirExcedenteTeorico();
        }

        const origen = origenes[index];

        consumirOrigen(origen, restante, (consumoError, resultado) => {
          if (consumoError) {
            return callback(consumoError);
          }

          if (resultado.cantidadConsumida > 0) {
            restante -= resultado.cantidadConsumida;
            costoTotal += resultado.costoTotal;
            movimientos.push(resultado);
          }

          index++;
          consumirCompras();
        });
      }

      function consumirExcedenteTeorico() {
        if (restante <= 0) {
          return finalizar();
        }

        obtenerCostoTeoricoCortes((costoError, teorico) => {
          if (costoError) {
            return callback(
              new Error(
                `Stock físico insuficiente de "${producto.nombre}" y no se pudo calcular el costo teórico del excedente. ${costoError.message}`
              )
            );
          }

          const cantidadTeorica = restante;
          const costoUnitario = numero(teorico.costoUnitario);
          const costoExcedente = cantidadTeorica * costoUnitario;

          costoTotal += costoExcedente;

          movimientos.push({
            cantidadConsumida: redondear(cantidadTeorica, 6),
            costoUnitario: redondear(costoUnitario),
            costoTotal: redondear(costoExcedente),
            origenId: null,
            tipoOrigen: "CAJON_TEORICO",
            documentoOrigen: teorico.cajonId,
            cantidadDisponibleAnterior: null,
            cantidadDisponibleNueva: null,
            stockFisico: false,
            observacion: "Excedente valorizado teóricamente. No genera stock de materia prima.",
          });

          restante = 0;
          finalizar();
        });
      }

      function finalizar() {
        const cantidadConsumida = cantidadNecesaria - restante;
        const costoPromedio = cantidadConsumida > 0 ? costoTotal / cantidadConsumida : 0;

        callback(null, {
          productoId: producto.id,
          producto: producto.nombre,
          cantidadSolicitada: redondear(cantidadNecesaria, 6),
          cantidadConsumida: redondear(cantidadConsumida, 6),
          costoTotal: redondear(costoTotal),
          costoPromedio: redondear(costoPromedio),
          unidad: producto.unidad || "kg",
          movimientos,
        });
      }

      consumirCompras();
    });
  });
}

// ============================================================
// CONSUMIR CAJONES PARA CORTE
// ============================================================
//
// ESTA ES UNA OPERACIÓN REAL DE PRODUCCIÓN.
//
// La cantidad solicitada está expresada en CAJONES.
//
// Ejemplo:
//
// 2 cajones -> 2 cajones destinados a corte.
//
// NO se registra cantidad de pollos.
//
// NO se registra peso físico.
//
// NO se crean 14 kg físicos de cada corte.
//
// Solamente se marca qué cantidad de cajones fue destinada
// al proceso de corte.
//
// ============================================================

function consumirCajonesParaCorte(cantidadCajones, observaciones, callback) {
  const cantidadNecesaria = numero(cantidadCajones);

  if (cantidadNecesaria <= 0) {
    return callback(new Error("La cantidad de cajones para cortar debe ser mayor a cero."));
  }

  obtenerCajonesDisponibles((error, cajones) => {
    if (error) {
      return callback(error);
    }

    let restante = cantidadNecesaria;
    const movimientos = [];
    let index = 0;

    function siguiente() {
      if (restante <= 0) {
        return finalizar();
      }

      if (index >= cajones.length) {
        return callback(new Error(`No hay suficientes cajones disponibles para cortar. Faltan ${redondear(restante, 6)} cajones.`));
      }

      const cajon = cajones[index];
      const disponible = numero(cajon.cantidadDisponible);

      if (disponible <= 0) {
        index++;
        return siguiente();
      }

      const cantidadCortar = Math.min(disponible, restante);
      const nuevaDisponible = Math.max(0, disponible - cantidadCortar);
      const cantidadCortadaAnterior = numero(cajon.cantidadCortada);
      const nuevaCantidadCortada = cantidadCortadaAnterior + cantidadCortar;

      let nuevoEstado = "PARCIAL";

      if (nuevaDisponible <= 0) {
        nuevoEstado = "CORTADO";
      }

      db.run(
        `
        UPDATE cajones
        SET
          cantidadDisponible = ?,
          cantidadCortada = ?,
          estado = ?,
          fechaCorte = CURRENT_TIMESTAMP,
          observacionesProduccion = ?
        WHERE id = ?
      `,
        [
          redondear(nuevaDisponible, 6),
          redondear(nuevaCantidadCortada, 6),
          nuevoEstado,
          observaciones || cajon.observacionesProduccion || null,
          cajon.id,
        ],
        (updateError) => {
          if (updateError) {
            return callback(updateError);
          }

          movimientos.push({
            cajonId: cajon.id,
            cantidadCajones: redondear(cantidadCortar, 6),
            cantidadDisponibleAnterior: redondear(disponible, 6),
            cantidadDisponibleNueva: redondear(nuevaDisponible, 6),
            cantidadCortadaNueva: redondear(nuevaCantidadCortada, 6),
            estado: nuevoEstado,
          });

          restante -= cantidadCortar;
          index++;
          siguiente();
        }
      );
    }

    function finalizar() {
      callback(null, {
        cantidadSolicitada: redondear(cantidadNecesaria, 6),
        cantidadCortada: redondear(cantidadNecesaria, 6),
        movimientos,
      });
    }

    siguiente();
  });
}

// ============================================================
// REGISTRAR VENTA DE POLLO ENTERO
// ============================================================
//
// El producto "Pollo entero" se vende por KG.
//
// Por lo tanto la venta informa KG.
//
// Elinor utiliza 19 kg como equivalencia teórica de un cajón
// para relacionar esa venta con la disponibilidad de cajones.
//
// Ejemplo conceptual:
//
// 1 cajón = 19 kg teóricos de pollo entero.
//
// Si se venden 5 kg:
//
// consumo equivalente = 5 / 19 cajones.
//
// IMPORTANTE:
//
// Esto NO significa que el cajón físico tenga exactamente 19 kg.
//
// Es solamente una referencia de gestión.
//
// Tampoco se registra cuántos pollos había dentro.
//
// ============================================================

function consumirPolloEntero(cantidadKg, callback) {
  const kilosSolicitados = numero(cantidadKg);

  if (kilosSolicitados <= 0) {
    return callback(new Error("Los kilos de pollo entero deben ser mayores a cero."));
  }

  obtenerCajonesDisponibles((error, cajones) => {
    if (error) {
      return callback(error);
    }

    let kilosRestantes = kilosSolicitados;
    const movimientos = [];
    let index = 0;

    function siguiente() {
      if (kilosRestantes <= 0) {
        return finalizar();
      }

      if (index >= cajones.length) {
        return callback(
          new Error(`No hay suficiente disponibilidad teórica de cajones para registrar ${redondear(kilosSolicitados, 3)} kg de pollo entero.`)
        );
      }

      const cajon = cajones[index];
      const disponibleCajones = numero(cajon.cantidadDisponible);

      if (disponibleCajones <= 0) {
        index++;
        return siguiente();
      }

      const kilosDisponibles = disponibleCajones * 19;
      const kilosConsumir = Math.min(kilosDisponibles, kilosRestantes);
      const cajonesConsumidos = kilosConsumir / 19;
      const nuevaDisponible = Math.max(0, disponibleCajones - cajonesConsumidos);
      const cantidadEnteraVendidaAnterior = numero(cajon.cantidadEnteraVendida);
      const nuevaCantidadEnteraVendida = cantidadEnteraVendidaAnterior + kilosConsumir;

      let nuevoEstado = "PARCIAL";

      if (nuevaDisponible <= 0) {
        nuevoEstado = "ENTERO_VENDIDO";
      }

      db.run(
        `
        UPDATE cajones
        SET
          cantidadDisponible = ?,
          cantidadEnteraVendida = ?,
          estado = ?
        WHERE id = ?
      `,
        [redondear(nuevaDisponible, 6), redondear(nuevaCantidadEnteraVendida, 6), nuevoEstado, cajon.id],
        (updateError) => {
          if (updateError) {
            return callback(updateError);
          }

          movimientos.push({
            cajonId: cajon.id,
            kilosConsumidos: redondear(kilosConsumir, 6),
            cajonesConsumidos: redondear(cajonesConsumidos, 6),
            cantidadDisponibleAnterior: redondear(disponibleCajones, 6),
            cantidadDisponibleNueva: redondear(nuevaDisponible, 6),
            cantidadEnteraVendidaNueva: redondear(nuevaCantidadEnteraVendida, 6),
            estado: nuevoEstado,
          });

          kilosRestantes -= kilosConsumir;
          index++;
          siguiente();
        }
      );
    }

    function finalizar() {
      callback(null, {
        kilosSolicitados: redondear(kilosSolicitados, 6),
        kilosConsumidos: redondear(kilosSolicitados, 6),
        equivalenteCajones: redondear(kilosSolicitados / 19, 6),
        movimientos,
      });
    }

    siguiente();
  });
}

// ============================================================
// CALCULAR COSTO ACTUAL SEGÚN STOCK FÍSICO
// ============================================================

function calcularCostoActualMateriaPrima(productoId, callback) {
  obtenerMateriaPrima(productoId, (productoError, producto) => {
    if (productoError) {
      return callback(productoError);
    }

    obtenerOrigenesDisponibles(producto.id, (origenError, origenes) => {
      if (origenError) {
        return callback(origenError);
      }

      if (origenes && origenes.length > 0) {
        const origen = origenes[0];

        obtenerCostoOrigen(origen, (costoError, costo) => {
          if (costoError) {
            return callback(costoError);
          }

          return callback(null, {
            productoId: producto.id,
            producto: producto.nombre,
            costoActual: redondear(costo),
            origen: origen.tipoOrigen,
            origenId: origen.id,
            cantidadDisponible: redondear(origen.cantidadDisponible, 6),
            tipoCosto: "COMPRA",
            costoTeoricoDisponible: false,
          });
        });

        return;
      }

      obtenerCostoTeoricoCortes((costoError, teorico) => {
        if (costoError) {
          return callback(null, {
            productoId: producto.id,
            producto: producto.nombre,
            costoActual: 0,
            origen: null,
            origenId: null,
            cantidadDisponible: 0,
            tipoCosto: null,
            costoTeoricoDisponible: false,
          });
        }

        callback(null, {
          productoId: producto.id,
          producto: producto.nombre,
          costoActual: redondear(teorico.costoUnitario),
          origen: "CAJON_TEORICO",
          origenId: teorico.cajonId,
          cantidadDisponible: 0,
          tipoCosto: "CAJON_14",
          costoTeoricoDisponible: true,
        });
      });
    });
  });
}

// ============================================================
// ACTUALIZAR COSTO ACTUAL
// ============================================================

function actualizarCostoActualMateriaPrima(productoId, callback) {
  calcularCostoActualMateriaPrima(productoId, (error, resultado) => {
    if (error) {
      return callback(error);
    }

    db.run(
      `
      UPDATE productos
      SET
        costoActual = ?,
        fechaActualizacion = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [resultado.costoActual, productoId],
      (updateError) => {
        if (updateError) {
          return callback(updateError);
        }

        callback(null, resultado);
      }
    );
  });
}

// ============================================================
// CONSUMIR Y ACTUALIZAR COSTO
// ============================================================

function consumirYActualizarCosto(productoId, cantidad, callback) {
  consumirMateriaPrima(productoId, cantidad, (consumoError, consumo) => {
    if (consumoError) {
      return callback(consumoError);
    }

    actualizarCostoActualMateriaPrima(productoId, (costoError, costo) => {
      if (costoError) {
        return callback(costoError);
      }

      callback(null, {
        consumo,
        costoActual: costo.costoActual,
        origenCosto: costo.origen,
        cantidadDisponible: costo.cantidadDisponible,
      });
    });
  });
}

// ============================================================
// GENERAR ORIGEN DE CAJÓN
// ============================================================
//
// Se conserva por compatibilidad.
//
// El cajón NO genera stock ficticio de materias primas.
//
// ============================================================

function generarOrigenCajon(productoId, cajonId, callback) {
  return callback(new Error("Elinor no genera stock de materia prima desde un cajón. El cajón solamente aporta disponibilidad para producción y costo teórico."));
}

// ============================================================
// EXPORTAR
// ============================================================

module.exports = {
  obtenerMateriaPrima,
  obtenerOrigenesDisponibles,
  obtenerCostoOrigen,
  obtenerCajonesDisponibles,
  obtenerCajonDisponible,
  obtenerCajonTeorico,
  obtenerUltimoCajonCortado,
  obtenerCostoTeoricoCortes,
  obtenerCostoTeoricoPolloEntero,
  consumirMateriaPrima,
  consumirCajonesParaCorte,
  consumirPolloEntero,
  calcularCostoActualMateriaPrima,
  actualizarCostoActualMateriaPrima,
  consumirYActualizarCosto,
  generarOrigenCajon,
};
