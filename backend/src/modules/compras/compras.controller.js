const comprasService = require("./compras.service");

// ============================================================
// OBTENER COMPRAS
// ============================================================

function getCompras(req, res) {
  comprasService.getCompras((error, compras) => {
    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
    res.json(compras);
  });
}

// ============================================================
// OBTENER COMPRAS DE UN PROVEEDOR
// ============================================================

function getComprasByProveedor(req, res) {
  const proveedorId = Number(req.params.proveedorId);

  if (!proveedorId) {
    return res.status(400).json({
      error: "ID de proveedor inválido",
    });
  }

  comprasService.getComprasByProveedor(proveedorId, (error, compras) => {
    if (error) {
      console.error("ERROR OBTENIENDO COMPRAS DEL PROVEEDOR:", error);
      return res.status(500).json({
        error: error.message,
      });
    }
    res.json(compras);
  });
}

// ============================================================
// OBTENER REMITO POR ID
// ============================================================

function getCompraById(req, res) {
  const id = Number(req.params.id);

  if (!id) {
    return res.status(400).json({
      error: "ID de compra inválido",
    });
  }

  comprasService.getCompraById(id, (error, compra) => {
    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    if (!compra) {
      return res.status(404).json({
        error: "Remito no encontrado",
      });
    }

    res.json(compra);
  });
}

// ============================================================
// CREAR REMITO
// ============================================================

function createCompra(req, res) {
  const compra = req.body;

  if (!compra.detalle || !Array.isArray(compra.detalle) || compra.detalle.length === 0) {
    return res.status(400).json({
      error: "Debe ingresar al menos un producto",
    });
  }

  const compraPreparada = {
    proveedorId: Number(compra.proveedorId || 0),
    remito: compra.remito || "",
    fecha: compra.fecha,
    observaciones: compra.observaciones || "",
    total: Number(compra.total || 0),
    contado: Number(compra.contado || 0),
    transferencia: Number(compra.transferencia || 0),
    detalle: compra.detalle,
  };

  if (!compraPreparada.proveedorId) {
    return res.status(400).json({
      error: "Debe seleccionar un proveedor",
    });
  }

  comprasService.createCompra(compraPreparada, (error, resultado) => {
    if (error) {
      console.error("ERROR CREANDO COMPRA:", error);
      return res.status(500).json({
        error: error.message,
      });
    }
    res.status(201).json(resultado);
  });
}

// ============================================================
// ACTUALIZAR REMITO
// ============================================================

function updateCompra(req, res) {
  const id = Number(req.params.id);
  const compra = req.body;

  if (!id) {
    return res.status(400).json({
      error: "ID de compra inválido",
    });
  }

  if (!compra.detalle || !Array.isArray(compra.detalle) || compra.detalle.length === 0) {
    return res.status(400).json({
      error: "El remito debe tener productos",
    });
  }

  const compraPreparada = {
    proveedorId: Number(compra.proveedorId || 0),
    remito: compra.remito || "",
    fecha: compra.fecha,
    observaciones: compra.observaciones || "",
    total: Number(compra.total || 0),
    contado: Number(compra.contado || 0),
    transferencia: Number(compra.transferencia || 0),
    detalle: compra.detalle,
  };

  if (!compraPreparada.proveedorId) {
    return res.status(400).json({
      error: "Debe seleccionar un proveedor",
    });
  }

  comprasService.updateCompra(id, compraPreparada, (error, resultado) => {
    if (error) {
      console.error("ERROR ACTUALIZANDO COMPRA:", error);
      return res.status(500).json({
        error: error.message,
      });
    }

    res.json({
      mensaje: "Remito actualizado correctamente",
      id: resultado.id,
      proveedorId: resultado.proveedorId,
      proveedorNombre: resultado.proveedorNombre,
      remito: resultado.remito,
      total: resultado.total,
      contado: resultado.contado,
      transferencia: resultado.transferencia,
      cuentaCorriente: resultado.cuentaCorriente,
      saldoAnterior: resultado.saldoAnterior,
      saldoNuevo: resultado.saldoNuevo,
    });
  });
}

// ============================================================
// EXPORTAR
// ============================================================

module.exports = {
  getCompras,
  getComprasByProveedor,
  getCompraById,
  createCompra,
  updateCompra,
};
