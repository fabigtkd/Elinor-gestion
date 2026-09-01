const service = require("./materiasPrimas.service");

// ============================================================
// OBTENER MATERIAS PRIMAS
// ============================================================

function getMateriasPrimas(req, res) {
  service.getAll(
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
        });
      }

      res.json(rows);
    }
  );
}

// ============================================================
// CREAR MATERIA PRIMA
// ============================================================

function createMateriaPrima(req, res) {
  service.create(
    req.body,
    (err, id) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
        });
      }

      res.status(201).json({
        id,
        mensaje:
          "Materia prima creada correctamente",
      });
    }
  );
}

// ============================================================
// ACTUALIZAR MATERIA PRIMA
// ============================================================

function updateMateriaPrima(req, res) {
  service.update(
    req.params.id,
    req.body,
    (err) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
        });
      }

      res.json({
        mensaje:
          "Materia prima actualizada correctamente",
      });
    }
  );
}

// ============================================================
// OBTENER ORÍGENES
// ============================================================

function getOrigenes(req, res) {
  service.getOrigenes(
    req.params.id,
    (err, rows) => {
      if (err) {
        console.error(
          "ERROR MATERIAS PRIMAS:",
          err
        );

        return res.status(500).json({
          error: err.message,
        });
      }

      res.json(rows);
    }
  );
}

// ============================================================
// CONSUMIR MATERIA PRIMA
// ============================================================
//
// POST /api/materias-primas/:id/consumir
//
// Body:
//
// {
//   "cantidad": 3,
//   "referenciaId": 10,
//   "tipoMovimiento": "PRODUCCION"
// }
//
// referenciaId y tipoMovimiento son opcionales
// por ahora. Los vamos a utilizar cuando conectemos
// el consumo con Producción y Recetas.
// ============================================================

function consumirMateriaPrima(req, res) {
  const materiaPrimaId =
    Number(req.params.id);

  const cantidad =
    Number(req.body.cantidad || 0);

  const referenciaId =
    req.body.referenciaId || null;

  const tipoMovimiento =
    req.body.tipoMovimiento ||
    "CONSUMO";

  if (
    !materiaPrimaId ||
    cantidad <= 0
  ) {
    return res.status(400).json({
      error:
        "Debe indicar una materia prima válida y una cantidad mayor a cero.",
    });
  }

  service.consumirMateriaPrima(
    materiaPrimaId,
    cantidad,
    referenciaId,
    tipoMovimiento,
    (err, resultado) => {
      if (err) {
        console.error(
          "ERROR CONSUMIENDO MATERIA PRIMA:",
          err
        );

        return res.status(400).json({
          error: err.message,
        });
      }

      res.json({
        mensaje:
          "Materia prima consumida correctamente",

        ...resultado,
      });
    }
  );
}

// ============================================================
// EXPORTAR
// ============================================================

module.exports = {
  getMateriasPrimas,
  createMateriaPrima,
  updateMateriaPrima,
  getOrigenes,
  consumirMateriaPrima,
};