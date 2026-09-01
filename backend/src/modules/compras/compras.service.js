const db = require("../../database/connection");

// ============================================================
// UTILIDADES
// ============================================================

function numero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

function redondear(valor, decimales = 2) {
  const factor = Math.pow(10, decimales);
  return Math.round(numero(valor) * factor) / factor;
}

// ============================================================
// OBTENER PRÓXIMO NÚMERO DE REMITO
// ============================================================

function obtenerProximoNumeroRemito(callback) {
  db.get(
    "SELECT COALESCE(MAX(CAST(TRIM(remito) AS INTEGER)), 0) AS ultimoNumero " +
      "FROM compras " +
      "WHERE TRIM(COALESCE(remito, '')) <> '' " +
      "AND TRIM(remito) NOT GLOB '*[^0-9]*'",
    [],
    (error, resultado) => {
      if (error) {
        console.error("ERROR OBTENIENDO PRÓXIMO NÚMERO DE REMITO:", error);
        return callback(error);
      }
      const ultimoNumero = numero(resultado && resultado.ultimoNumero);
      const proximoNumero = ultimoNumero + 1;
      callback(null, String(proximoNumero));
    }
  );
}

// ============================================================
// RESOLVER NÚMERO DE REMITO
// ============================================================

function resolverNumeroRemito(remito, callback) {
  const remitoInformado = String(remito || "").trim();
  if (remitoInformado !== "") {
    return callback(null, remitoInformado);
  }
  obtenerProximoNumeroRemito(callback);
}

// ============================================================
// OBTENER TODAS LAS COMPRAS
// ============================================================

function getCompras(callback) {
  const sql =
    "SELECT " +
    "c.*, " +
    "p.nombre AS proveedorNombre " +
    "FROM compras c " +
    "LEFT JOIN proveedores p ON p.id = c.proveedorId " +
    "ORDER BY datetime(c.fecha) DESC, c.id DESC";

  db.all(sql, [], (error, rows) => {
    if (error) {
      console.error("ERROR OBTENIENDO COMPRAS:", error);
      return callback(error);
    }
    callback(null, rows || []);
  });
}

// ============================================================
// OBTENER COMPRAS DE UN PROVEEDOR
// ============================================================

function getComprasByProveedor(proveedorId, callback) {
  const id = numero(proveedorId);
  if (!id) {
    return callback(new Error("ID de proveedor inválido"));
  }

  const sql =
    "SELECT " +
    "c.*, " +
    "p.nombre AS proveedorNombre " +
    "FROM compras c " +
    "LEFT JOIN proveedores p ON p.id = c.proveedorId " +
    "WHERE c.proveedorId = ? " +
    "ORDER BY datetime(c.fecha) DESC, c.id DESC";

  db.all(sql, [id], (error, rows) => {
    if (error) {
      console.error("ERROR OBTENIENDO COMPRAS DEL PROVEEDOR:", error);
      return callback(error);
    }
    callback(null, rows || []);
  });
}

// ============================================================
// OBTENER REMITO POR ID
// ============================================================

function getCompraById(id, callback) {
  const compraId = numero(id);
  if (!compraId) {
    return callback(new Error("ID de compra inválido"));
  }

  db.get(
    "SELECT c.*, p.nombre AS proveedorNombre FROM compras c LEFT JOIN proveedores p ON p.id = c.proveedorId WHERE c.id = ? LIMIT 1",
    [compraId],
    (error, compra) => {
      if (error) {
        console.error("ERROR OBTENIENDO REMITO:", error);
        return callback(error);
      }
      if (!compra) {
        return callback(null, null);
      }

      db.all(
        "SELECT cd.*, cd.materiaPrimaId, cd.productoId FROM compras_detalle cd WHERE cd.compraId = ? ORDER BY cd.id ASC",
        [compraId],
        (detalleError, detalle) => {
          if (detalleError) {
            console.error("ERROR OBTENIENDO DETALLE DEL REMITO:", detalleError);
            return callback(detalleError);
          }
          compra.detalle = detalle || [];
          callback(null, compra);
        }
      );
    }
  );
}

// ============================================================
// OBTENER PRODUCTO
// ============================================================

function obtenerProducto(productoId, nombre, callback) {
  const id = numero(productoId);
  if (id > 0) {
    db.get(
      "SELECT id, nombre, unidad, esMateriaPrima, activo, costoActual FROM productos WHERE id = ? LIMIT 1",
      [id],
      (productoError, producto) => {
        if (productoError) {
          return callback(productoError);
        }
        if (producto) {
          return callback(null, producto);
        }

        db.get(
          "SELECT nombre, unidad FROM materias_primas WHERE id = ? LIMIT 1",
          [id],
          (materiaError, materiaPrima) => {
            if (materiaError) {
              return callback(materiaError);
            }
            if (!materiaPrima) {
              return buscarProductoPorNombre(nombre, callback);
            }
            buscarProductoPorNombre(materiaPrima.nombre, callback);
          }
        );
      }
    );
    return;
  }
  buscarProductoPorNombre(nombre, callback);
}

// ============================================================
// BUSCAR PRODUCTO POR NOMBRE
// ============================================================

function buscarProductoPorNombre(nombre, callback) {
  const nombreNormalizado = String(nombre || "").trim();
  if (!nombreNormalizado) {
    return callback(null, null);
  }

  db.get(
    "SELECT id, nombre, unidad, esMateriaPrima, activo, costoActual FROM productos WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?)) AND activo = 1 LIMIT 1",
    [nombreNormalizado],
    callback
  );
}

// ============================================================
// CREAR ORIGEN DE COMPRA
// ============================================================

function crearOrigenCompra(productoId, compraId, cantidad, precioUnitario, fecha, callback) {
  const cantidadNumero = numero(cantidad);
  const costoNumero = numero(precioUnitario);

  if (productoId <= 0 || cantidadNumero <= 0) {
    return callback(null);
  }

  db.run(
    "INSERT INTO origenes_materia_prima (materiaPrimaId, tipoOrigen, documentoOrigen, cantidad, costoUnitario, cantidadDisponible, prioridadConsumo, fecha, fechaActualizacion) VALUES (?, 'COMPRA', ?, ?, ?, ?, 1, ?, CURRENT_TIMESTAMP)",
    [productoId, compraId, cantidadNumero, costoNumero, cantidadNumero, fecha || null],
    (error) => {
      if (error) {
        console.error("ERROR CREANDO ORIGEN DE COMPRA:", error);
      }
      callback(error);
    }
  );
}

// ============================================================
// ACTUALIZAR COSTO DEL PRODUCTO
// ============================================================

function actualizarCostoProducto(productoId, costo, callback) {
  const id = numero(productoId);
  const costoNumero = redondear(costo);

  if (id <= 0) {
    return callback(null);
  }

  db.run(
    "UPDATE productos SET costoActual = ?, fechaActualizacion = CURRENT_TIMESTAMP WHERE id = ?",
    [costoNumero, id],
    (error) => {
      if (error) {
        console.error("ERROR ACTUALIZANDO COSTO DEL PRODUCTO:", error);
      }
      callback(error);
    }
  );
}

// ============================================================
// PROCESAR DETALLE DE COMPRA
// ============================================================

function guardarDetalleCompra(compraId, detalle, fecha, callback) {
  const lista = Array.isArray(detalle) ? detalle : [];
  let index = 0;

  function siguiente() {
    if (index >= lista.length) {
      return callback(null);
    }

    const item = lista[index];
    const productoId = numero(item.productoId || item.materiaPrimaId);
    const nombre = String(item.producto || item.nombre || item.materiaPrima || "").trim();
    const cantidad = numero(item.cantidad);
    const unidad = item.unidad || "kg";
    const precioUnitario = numero(item.precioUnitario || item.precio || item.costoUnitario);
    const subtotal = numero(item.subtotal) || redondear(cantidad * precioUnitario);

    if (cantidad <= 0 || precioUnitario < 0) {
      index++;
      return siguiente();
    }

    obtenerProducto(productoId, nombre, (productoError, producto) => {
      if (productoError) {
        return callback(productoError);
      }
      if (!producto) {
        return callback(new Error('No existe el producto "' + nombre + '".'));
      }

      const idReal = numero(producto.id);

      db.run(
        "INSERT INTO compras_detalle (compraId, materiaPrimaId, productoId, producto, cantidad, unidad, precioUnitario, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [compraId, idReal, idReal, producto.nombre, cantidad, unidad, precioUnitario, subtotal],
        (detalleError) => {
          if (detalleError) {
            console.error("ERROR GUARDANDO DETALLE DE COMPRA:", detalleError);
            return callback(detalleError);
          }

          crearOrigenCompra(idReal, compraId, cantidad, precioUnitario, fecha, (origenError) => {
            if (origenError) {
              return callback(origenError);
            }

            actualizarCostoProducto(idReal, precioUnitario, (costoError) => {
              if (costoError) {
                return callback(costoError);
              }
              index++;
              siguiente();
            });
          });
        }
      );
    });
  }

  siguiente();
}

// ============================================================
// OBTENER SALDO ACTUAL DEL PROVEEDOR
// ============================================================

function obtenerSaldoProveedor(proveedorId, callback) {
  db.get(
    "SELECT COALESCE(SUM(COALESCE(cuentaCorriente, 0)), 0) AS saldo FROM compras WHERE proveedorId = ?",
    [numero(proveedorId)],
    (error, resultado) => {
      if (error) {
        return callback(error);
      }
      callback(null, redondear(resultado && resultado.saldo));
    }
  );
}

// ============================================================
// ACTUALIZAR SALDOS DEL PROVEEDOR
// ============================================================

function actualizarSaldosProveedor(proveedorId, callback) {
  const id = numero(proveedorId);
  obtenerSaldoProveedor(id, (error, saldo) => {
    if (error) {
      return callback(error);
    }
    db.run("UPDATE proveedores SET saldo = ? WHERE id = ?", [saldo, id], (updateError) => {
      if (updateError) {
        return callback(updateError);
      }
      callback(null, saldo);
    });
  });
}

// ============================================================
// CREAR MOVIMIENTO DEL PROVEEDOR
// ============================================================

function crearMovimientoProveedor(proveedorId, compraId, total, contado, transferencia, saldo, callback) {
  const importeCuenta = redondear(numero(total) - numero(contado) - numero(transferencia));

  if (importeCuenta <= 0) {
    return callback(null);
  }

  db.run(
    "INSERT INTO movimientos_proveedores (proveedorId, tipo, descripcion, debe, haber, saldo, referenciaId) VALUES (?, 'COMPRA', ?, ?, 0, ?, ?)",
    [numero(proveedorId), "Compra / Remito " + compraId, importeCuenta, redondear(saldo), numero(compraId)],
    (error) => {
      if (error) {
        console.error("ERROR CREANDO MOVIMIENTO DE PROVEEDOR:", error);
      }
      callback(error);
    }
  );
}

// ============================================================
// ELIMINAR DATOS DE UNA COMPRA
// ============================================================

function eliminarCompraCompleta(compraId, callback) {
  const id = numero(compraId);

  db.run(
    "DELETE FROM origenes_materia_prima WHERE UPPER(TRIM(tipoOrigen)) = 'COMPRA' AND documentoOrigen = ?",
    [id],
    (origenError) => {
      if (origenError) {
        return callback(origenError);
      }

      db.run(
        "DELETE FROM movimientos_proveedores WHERE tipo = 'COMPRA' AND referenciaId = ?",
        [id],
        (movimientoError) => {
          if (movimientoError) {
            return callback(movimientoError);
          }

          db.run("DELETE FROM compras_detalle WHERE compraId = ?", [id], (detalleError) => {
            if (detalleError) {
              return callback(detalleError);
            }

            db.run("DELETE FROM compras WHERE id = ?", [id], (compraError) => {
              if (compraError) {
                return callback(compraError);
              }
              callback(null);
            });
          });
        }
      );
    }
  );
}

// ============================================================
// CREAR COMPRA
// ============================================================

function createCompra(compra, callback) {
  const proveedorId = numero(compra.proveedorId);
  const total = redondear(numero(compra.total));
  const contado = redondear(numero(compra.contado));
  const transferencia = redondear(numero(compra.transferencia));
  const cuentaCorriente = redondear(total - contado - transferencia);

  resolverNumeroRemito(compra.remito, (remitoError, numeroRemito) => {
    if (remitoError) {
      return callback(remitoError);
    }

    obtenerSaldoProveedor(proveedorId, (saldoError, saldoAnterior) => {
      if (saldoError) {
        return callback(saldoError);
      }

      const saldoNuevo = redondear(saldoAnterior + cuentaCorriente);

      db.run(
        "INSERT INTO compras (proveedorId, fecha, remito, observaciones, total, contado, transferencia, cuentaCorriente, saldoAnterior, saldoNuevo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [proveedorId, compra.fecha || null, numeroRemito, compra.observaciones || "", total, contado, transferencia, cuentaCorriente, saldoAnterior, saldoNuevo],
        function (error) {
          if (error) {
            console.error("ERROR INSERTANDO COMPRA:", error);
            return callback(error);
          }

          const compraId = this.lastID;

          guardarDetalleCompra(compraId, compra.detalle, compra.fecha, (detalleError) => {
            if (detalleError) {
              console.error("ERROR PROCESANDO DETALLE. SE ELIMINA COMPRA PARCIAL:", detalleError);
              return eliminarCompraCompleta(compraId, () => {
                callback(detalleError);
              });
            }

            crearMovimientoProveedor(proveedorId, compraId, total, contado, transferencia, saldoNuevo, (movimientoError) => {
              if (movimientoError) {
                return eliminarCompraCompleta(compraId, () => {
                  callback(movimientoError);
                });
              }

              actualizarSaldosProveedor(proveedorId, (saldoUpdateError) => {
                if (saldoUpdateError) {
                  return eliminarCompraCompleta(compraId, () => {
                    callback(saldoUpdateError);
                  });
                }

                db.get(
                  "SELECT c.*, p.nombre AS proveedorNombre FROM compras c LEFT JOIN proveedores p ON p.id = c.proveedorId WHERE c.id = ? LIMIT 1",
                  [compraId],
                  (consultaError, resultado) => {
                    if (consultaError) {
                      return callback(consultaError);
                    }
                    callback(null, resultado);
                  }
                );
              });
            });
          });
        }
      );
    });
  });
}

// ============================================================
// ELIMINAR DATOS RELACIONADOS AL REMITO
// ============================================================

function eliminarDatosRelacionados(compraId, callback) {
  const id = numero(compraId);

  db.run(
    "DELETE FROM origenes_materia_prima WHERE UPPER(TRIM(tipoOrigen)) = 'COMPRA' AND documentoOrigen = ?",
    [id],
    (origenError) => {
      if (origenError) {
        return callback(origenError);
      }

      db.run(
        "DELETE FROM movimientos_proveedores WHERE tipo = 'COMPRA' AND referenciaId = ?",
        [id],
        (movimientoError) => {
          if (movimientoError) {
            return callback(movimientoError);
          }

          db.run("DELETE FROM compras_detalle WHERE compraId = ?", [id], (detalleError) => {
            if (detalleError) {
              return callback(detalleError);
            }
            callback(null);
          });
        }
      );
    }
  );
}

// ============================================================
// ACTUALIZAR REMITO
// ============================================================

function updateCompra(id, compra, callback) {
  const compraId = numero(id);
  if (!compraId) {
    return callback(new Error("ID de compra inválido"));
  }

  db.get("SELECT * FROM compras WHERE id = ? LIMIT 1", [compraId], (error, compraAnterior) => {
    if (error) {
      return callback(error);
    }
    if (!compraAnterior) {
      return callback(new Error("Remito no encontrado"));
    }

    const proveedorAnteriorId = numero(compraAnterior.proveedorId);
    const proveedorNuevoId = numero(compra.proveedorId);
    const total = redondear(numero(compra.total));
    const contado = redondear(numero(compra.contado));
    const transferencia = redondear(numero(compra.transferencia));
    const cuentaCorriente = redondear(total - contado - transferencia);

    function continuarConRemito(numeroRemito) {
      obtenerSaldoProveedor(proveedorAnteriorId, (saldoAnteriorError, saldoProveedorAnterior) => {
        if (saldoAnteriorError) {
          return callback(saldoAnteriorError);
        }

        const cuentaAnterior = redondear(compraAnterior.cuentaCorriente);
        const saldoSinCompraAnterior = redondear(saldoProveedorAnterior - cuentaAnterior);
        const mismoProveedor = proveedorAnteriorId === proveedorNuevoId;
        let saldoBaseNuevoProveedor = saldoSinCompraAnterior;

        function continuarActualizacion() {
          const saldoAnteriorFinal = mismoProveedor ? saldoSinCompraAnterior : saldoBaseNuevoProveedor;
          const saldoNuevo = redondear(saldoAnteriorFinal + cuentaCorriente);

          eliminarDatosRelacionados(compraId, (eliminarError) => {
            if (eliminarError) {
              return callback(eliminarError);
            }

            db.run(
              "UPDATE compras SET proveedorId = ?, fecha = ?, remito = ?, observaciones = ?, total = ?, contado = ?, transferencia = ?, cuentaCorriente = ?, saldoAnterior = ?, saldoNuevo = ? WHERE id = ?",
              [proveedorNuevoId, compra.fecha || null, numeroRemito, compra.observaciones || "", total, contado, transferencia, cuentaCorriente, saldoAnteriorFinal, saldoNuevo, compraId],
              (updateError) => {
                if (updateError) {
                  return callback(updateError);
                }

                guardarDetalleCompra(compraId, compra.detalle, compra.fecha, (detalleError) => {
                  if (detalleError) {
                    return callback(detalleError);
                  }

                  crearMovimientoProveedor(proveedorNuevoId, compraId, total, contado, transferencia, saldoNuevo, (movimientoError) => {
                    if (movimientoError) {
                      return callback(movimientoError);
                    }

                    actualizarSaldosProveedor(proveedorAnteriorId, (saldoAnteriorUpdateError) => {
                      if (saldoAnteriorUpdateError) {
                        return callback(saldoAnteriorUpdateError);
                      }

                      if (proveedorNuevoId !== proveedorAnteriorId) {
                        return actualizarSaldosProveedor(proveedorNuevoId, (saldoNuevoUpdateError) => {
                          if (saldoNuevoUpdateError) {
                            return callback(saldoNuevoUpdateError);
                          }
                          obtenerCompraActualizada();
                        });
                      }

                      obtenerCompraActualizada();
                    });
                  });
                });
              }
            );
          });
        }

        if (proveedorNuevoId !== proveedorAnteriorId) {
          obtenerSaldoProveedor(proveedorNuevoId, (nuevoSaldoError, nuevoSaldo) => {
            if (nuevoSaldoError) {
              return callback(nuevoSaldoError);
            }
            saldoBaseNuevoProveedor = nuevoSaldo;
            continuarActualizacion();
          });
          return;
        }

        continuarActualizacion();
      });
    }

    const remitoActual = String(compra.remito || "").trim();
    if (remitoActual !== "") {
      continuarConRemito(remitoActual);
      return;
    }

    const remitoAnterior = String(compraAnterior.remito || "").trim();
    if (remitoAnterior !== "") {
      continuarConRemito(remitoAnterior);
      return;
    }

    obtenerProximoNumeroRemito((remitoError, numeroRemito) => {
      if (remitoError) {
        return callback(remitoError);
      }
      continuarConRemito(numeroRemito);
    });
  });

  function obtenerCompraActualizada() {
    db.get(
      "SELECT c.*, p.nombre AS proveedorNombre FROM compras c LEFT JOIN proveedores p ON p.id = c.proveedorId WHERE c.id = ? LIMIT 1",
      [compraId],
      (consultaError, resultado) => {
        if (consultaError) {
          return callback(consultaError);
        }
        callback(null, resultado);
      }
    );
  }
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
