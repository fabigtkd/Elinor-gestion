const db = require("../../database/connection");
const service = require("./produccion.service");

// ============================================================
// OBTENER TODOS LOS CAJONES
// ============================================================

function obtenerCajones(req, res) {
  db.all(
    `
      SELECT
        id,
        fecha,
        cantidad,
        valorUnitario,
        valorTotal,
        rendimientoTeorico,
        kilosTeoricos,
        estado,
        compraId,
        observaciones,
        cantidadDisponible,
        cantidadCortada,
        cantidadEnteraVendida,
        fechaCorte,
        observacionesProduccion
      FROM cajones
      ORDER BY fecha DESC, id DESC
    `,
    [],
    (error, rows) => {
      if (error) {
        return res.status(500).json({
          error: error.message,
        });
      }
      return res.json(rows || []);
    }
  );
}

// ============================================================
// OBTENER UN CAJÓN
// ============================================================

function obtenerCajon(req, res) {
  const id = Number(req.params.id);

  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({
      error: "ID de cajón inválido.",
    });
  }

  db.get(
    `
      SELECT
        id,
        fecha,
        cantidad,
        valorUnitario,
        valorTotal,
        rendimientoTeorico,
        kilosTeoricos,
        estado,
        compraId,
        observaciones,
        cantidadDisponible,
        cantidadCortada,
        cantidadEnteraVendida,
        fechaCorte,
        observacionesProduccion
      FROM cajones
      WHERE id = ?
      LIMIT 1
    `,
    [id],
    (error, cajon) => {
      if (error) {
        return res.status(500).json({
          error: error.message,
        });
      }

      if (!cajon) {
        return res.status(404).json({
          error: "Cajón no encontrado.",
        });
      }

      return res.json(cajon);
    }
  );
}

// ============================================================
// CREAR REGISTRO DE CAJONES
// ============================================================
//
// REGLA ELINOR:
//
// Un registro representa una cantidad de cajones.
//
// No se registra:
//
// - cantidad de pollos
// - kilos físicos del cajón
// - número de cajón
// - identificación individual
//
// La unidad de ingreso es CAJÓN.
//
// ============================================================

function crearCajon(req, res) {
  const cantidad = Number(req.body.cantidad || 0);
  const valorUnitario = Number(req.body.valorUnitario || 0);
  const rendimientoTeorico = Number(req.body.rendimientoTeorico || 14);

  const compraId =
    req.body.compraId === undefined || req.body.compraId === null || req.body.compraId === ""
      ? null
      : Number(req.body.compraId);

  const observaciones = req.body.observaciones || null;

  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    return res.status(400).json({
      error: "La cantidad de cajones debe ser mayor a cero.",
    });
  }

  if (!Number.isFinite(valorUnitario) || valorUnitario <= 0) {
    return res.status(400).json({
      error: "El valor unitario debe ser mayor a cero.",
    });
  }

  if (!Number.isFinite(rendimientoTeorico) || rendimientoTeorico <= 0) {
    return res.status(400).json({
      error: "El rendimiento teórico debe ser mayor a cero.",
    });
  }

  if (compraId !== null && (!Number.isFinite(compraId) || compraId <= 0)) {
    return res.status(400).json({
      error: "compraId inválido.",
    });
  }

  const valorTotal = cantidad * valorUnitario;
  const kilosTeoricos = cantidad * rendimientoTeorico;

  db.run(
    `
      INSERT INTO cajones (
        cantidad,
        valorUnitario,
        valorTotal,
        rendimientoTeorico,
        kilosTeoricos,
        estado,
        compraId,
        observaciones,
        cantidadDisponible,
        cantidadCortada,
        cantidadEnteraVendida
      )
      VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        'DISPONIBLE',
        ?,
        ?,
        ?,
        0,
        0
      )
    `,
    [cantidad, valorUnitario, valorTotal, rendimientoTeorico, kilosTeoricos, compraId, observaciones, cantidad],
    function (error) {
      if (error) {
        return res.status(500).json({
          error: error.message,
        });
      }

      return res.status(201).json({
        id: this.lastID,
        cantidad,
        valorUnitario,
        valorTotal,
        rendimientoTeorico,
        kilosTeoricos,
        cantidadDisponible: cantidad,
        cantidadCortada: 0,
        cantidadEnteraVendida: 0,
        estado: "DISPONIBLE",
        mensaje: "Cajones registrados correctamente.",
      });
    }
  );
}

// ============================================================
// CORTAR CAJÓN
// ============================================================
//
// REGLA ELINOR:
//
// Esta operación trabaja exclusivamente con CAJONES.
//
// cantidadDisponible = cajones disponibles.
//
// cantidadCortada = cajones destinados a corte.
//
// Los kilosTeoricos solamente sirven para calcular costos.
//
// NO se utilizan como stock físico.
//
// NO se crean kilos físicos de cortes.
//
// ============================================================

function cortarCajon(req, res) {
  const id = Number(req.params.id);

  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({
      error: "ID de cajón inválido.",
    });
  }

  const cantidadSolicitada =
    req.body.cantidad === undefined || req.body.cantidad === null || req.body.cantidad === "" ? null : Number(req.body.cantidad);

  db.get(
    `
      SELECT
        id,
        cantidad,
        valorUnitario,
        valorTotal,
        rendimientoTeorico,
        kilosTeoricos,
        estado,
        cantidadDisponible,
        cantidadCortada,
        cantidadEnteraVendida,
        observacionesProduccion
      FROM cajones
      WHERE id = ?
      LIMIT 1
    `,
    [id],
    (error, cajon) => {
      if (error) {
        return res.status(500).json({
          error: error.message,
        });
      }

      if (!cajon) {
        return res.status(404).json({
          error: "Cajón no encontrado.",
        });
      }

      const disponible = Number(cajon.cantidadDisponible || 0);

      if (disponible <= 0) {
        return res.status(400).json({
          error: "El cajón no tiene disponibilidad para corte.",
        });
      }

      if (cantidadSolicitada !== null && (!Number.isFinite(cantidadSolicitada) || cantidadSolicitada <= 0)) {
        return res.status(400).json({
          error: "La cantidad de cajones a cortar debe ser mayor a cero.",
        });
      }

      const cantidadCortar = cantidadSolicitada === null ? disponible : cantidadSolicitada;

      if (cantidadCortar > disponible) {
        return res.status(400).json({
          error: `No hay suficientes cajones disponibles. Disponibles: ${disponible}.`,
        });
      }

      const nuevaDisponible = Math.max(0, disponible - cantidadCortar);
      const cantidadCortadaAnterior = Number(cajon.cantidadCortada || 0);
      const nuevaCantidadCortada = cantidadCortadaAnterior + cantidadCortar;

      let nuevoEstado = "PARCIAL";

      if (nuevaDisponible <= 0) {
        nuevoEstado = "CORTADO";
      }

      const observaciones = req.body.observaciones || cajon.observacionesProduccion || null;

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
          Number(nuevaDisponible.toFixed(6)),
          Number(nuevaCantidadCortada.toFixed(6)),
          nuevoEstado,
          observaciones,
          id,
        ],
        (updateError) => {
          if (updateError) {
            return res.status(500).json({
              error: updateError.message,
            });
          }

          return res.json({
            mensaje: "Cajones destinados a corte correctamente.",
            id,
            cantidadCortada: Number(cantidadCortar.toFixed(6)),
            cantidadDisponibleAnterior: Number(disponible.toFixed(6)),
            cantidadDisponibleNueva: Number(nuevaDisponible.toFixed(6)),
            cantidadCortadaNueva: Number(nuevaCantidadCortada.toFixed(6)),
            estado: nuevoEstado,
            kilosTeoricos: Number((cantidadCortar * Number(cajon.rendimientoTeorico || 14)).toFixed(6)),
          });
        }
      );
    }
  );
}

// ============================================================
// CONSUMIR MATERIA PRIMA
// ============================================================
//
// Esta operación pertenece al motor de consumo y costos.
//
// El producto debe estar marcado como materia prima.
//
// ============================================================

function consumirMateriaPrima(req, res) {
  const productoId = Number(req.body.productoId);
  const cantidad = Number(req.body.cantidad);

  if (!Number.isFinite(productoId) || productoId <= 0) {
    return res.status(400).json({
      error: "productoId inválido.",
    });
  }

  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    return res.status(400).json({
      error: "La cantidad debe ser mayor a cero.",
    });
  }

  service.consumirMateriaPrima(productoId, cantidad, (error, resultado) => {
    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.json(resultado);
  });
}

// ============================================================
// CALCULAR COSTO ACTUAL
// ============================================================

function calcularCostoActual(req, res) {
  const productoId = Number(req.params.productoId);

  if (!Number.isFinite(productoId) || productoId <= 0) {
    return res.status(400).json({
      error: "productoId inválido.",
    });
  }

  service.calcularCostoActualMateriaPrima(productoId, (error, resultado) => {
    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    return res.json(resultado);
  });
}

// ============================================================
// EXPORTAR
// ============================================================

module.exports = {
  obtenerCajones,
  obtenerCajon,
  crearCajon,
  cortarCajon,
  consumirMateriaPrima,
  calcularCostoActual,
};
