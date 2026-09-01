const db = require("../../database/connection");

// ============================================================
// CALCULAR COSTO DE PRODUCTO - MATERIA PRIMA
// ============================================================
//
// La materia prima es un PRODUCTO.
//
// Prioridad de costo:
// 1. COMPRA con cantidadDisponible > 0
// 2. CAJON
// 3. costoActual del producto
//
// El cajón proporciona costo, pero no genera stock físico
// del producto.
// ============================================================

function calcularCostoMateriaPrima(producto, callback) {
  if (!producto) {
    return callback(null, {
      costo: 0,
      origenCosto: "MANUAL",
      valorCajon: 0,
      divisorCajon: 0,
      stockComprado: 0,
      compra: null,
    });
  }

  const productoId = Number(producto.id || 0);

  if (!productoId) {
    return callback(null, {
      costo: Number(producto.costoActual || 0),
      origenCosto: "MANUAL",
      valorCajon: 0,
      divisorCajon: 0,
      stockComprado: 0,
      compra: null,
    });
  }

  // ----------------------------------------------------------
  // BUSCAR COMPRA DISPONIBLE
  // ----------------------------------------------------------

  db.get(
    `SELECT
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
        AND tipoOrigen = 'COMPRA'
        AND COALESCE(cantidadDisponible, 0) > 0
      ORDER BY
        prioridadConsumo ASC,
        fecha ASC,
        id ASC
      LIMIT 1`,
    [productoId],
    (compraError, compra) => {
      if (compraError) {
        return callback(compraError);
      }

      if (compra) {
        return callback(null, {
          costo: Number(compra.costoUnitario || 0),
          origenCosto: "COMPRA",
          valorCajon: 0,
          divisorCajon: 0,
          stockComprado: Number(compra.cantidadDisponible || 0),
          compra: {
            id: compra.id,
            materiaPrimaId: compra.materiaPrimaId,
            documentoOrigen: compra.documentoOrigen,
            cantidad: Number(compra.cantidad || 0),
            costoUnitario: Number(compra.costoUnitario || 0),
            cantidadDisponible: Number(compra.cantidadDisponible || 0),
            prioridadConsumo: Number(compra.prioridadConsumo || 1),
            fecha: compra.fecha,
          },
        });
      }

      // --------------------------------------------------------
      // NO HAY COMPRA DISPONIBLE - BUSCAR ÚLTIMO CAJÓN
      // --------------------------------------------------------

      db.get(
        `SELECT
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
            AND tipoOrigen = 'CAJON'
          ORDER BY
            fecha DESC,
            id DESC
          LIMIT 1`,
        [productoId],
        (cajonError, cajon) => {
          if (cajonError) {
            return callback(cajonError);
          }

          if (cajon) {
            const costoCajon = Number(cajon.costoUnitario || 0);
            const cantidadCajon = Number(cajon.cantidad || 0);
            let divisorCajon = 0;

            if (cantidadCajon > 0) {
              divisorCajon = cantidadCajon;
            } else {
              divisorCajon = 14;
            }

            const costo = divisorCajon > 0 ? costoCajon : Number(producto.costoActual || 0);

            return callback(null, {
              costo,
              origenCosto: "CAJON",
              valorCajon: costoCajon * divisorCajon,
              divisorCajon,
              stockComprado: 0,
              compra: null,
            });
          }

          // ------------------------------------------------------
          // SIN COMPRA Y SIN CAJÓN - USAR COSTO ACTUAL
          // ------------------------------------------------------

          callback(null, {
            costo: Number(producto.costoActual || 0),
            origenCosto: "MANUAL",
            valorCajon: 0,
            divisorCajon: 0,
            stockComprado: 0,
            compra: null,
          });
        }
      );
    }
  );
}

// ============================================================
// CONVERTIR CANTIDAD SEGÚN UNIDAD
// ============================================================

function convertirCantidad(cantidad, unidadOrigen, unidadCosto) {
  const valor = Number(cantidad || 0);
  const origen = String(unidadOrigen || "").trim().toLowerCase();
  const costo = String(unidadCosto || "").trim().toLowerCase();

  if (valor <= 0) {
    return 0;
  }

  if (origen === "g" && costo === "kg") {
    return valor / 1000;
  }

  if (origen === "ml" && (costo === "litro" || costo === "l")) {
    return valor / 1000;
  }

  return valor;
}

// ============================================================
// CALCULAR COSTO DE RECETA
// ============================================================

function calcularCostoReceta(receta, callback) {
  if (!Array.isArray(receta) || receta.length === 0) {
    return callback(null, {
      costoTotal: 0,
      ingredientes: [],
    });
  }

  let index = 0;
  let costoTotal = 0;
  const ingredientesCalculados = [];

  function siguiente() {
    if (index >= receta.length) {
      return callback(null, {
        costoTotal,
        ingredientes: ingredientesCalculados,
      });
    }

    const ingrediente = receta[index];
    const cantidad = Number(ingrediente.cantidad || 0);

    if (!ingrediente.productoId || cantidad <= 0) {
      index++;
      return siguiente();
    }

    db.get(
      `SELECT
          id,
          nombre,
          unidad,
          costoActual,
          esMateriaPrima,
          activo
        FROM productos
        WHERE id = ?
          AND activo = 1
        LIMIT 1`,
      [Number(ingrediente.productoId)],
      (error, producto) => {
        if (error) {
          return callback(error);
        }

        if (!producto) {
          return callback(new Error("No existe el producto-materia prima con ID " + ingrediente.productoId + "."));
        }

        if (Number(producto.esMateriaPrima || 0) !== 1) {
          return callback(new Error('El producto "' + producto.nombre + '" no está marcado como materia prima.'));
        }

        calcularCostoMateriaPrima(producto, (costoError, costoResultado) => {
          if (costoError) {
            return callback(costoError);
          }

          const costoUnidad = Number(costoResultado.costo || 0);
          const unidadReceta = ingrediente.unidad || producto.unidad || "kg";
          const cantidadConvertida = convertirCantidad(cantidad, unidadReceta, producto.unidad);
          const costoIngrediente = costoUnidad * cantidadConvertida;

          costoTotal += costoIngrediente;

          ingredientesCalculados.push({
            productoId: producto.id,
            materiaPrimaId: producto.id,
            materiaPrima: producto.nombre,
            producto: producto.nombre,
            cantidad,
            unidad: unidadReceta,
            cantidadConvertida,
            unidadCosto: producto.unidad,
            costoActual: Number(costoUnidad),
            costoUnidad,
            costoIngrediente: Number(costoIngrediente.toFixed(2)),
            origenCosto: costoResultado.origenCosto,
            valorCajon: Number(costoResultado.valorCajon || 0),
            divisorCajon: Number(costoResultado.divisorCajon || 0),
            stockComprado: Number(costoResultado.stockComprado || 0),
          });

          index++;
          siguiente();
        });
      }
    );
  }

  siguiente();
}

// ============================================================
// CALCULAR PRECIO SUGERIDO
// Fórmula: costo / (1 - margen)
// ============================================================

function calcularPrecioSugerido(costo, margen) {
  const costoNumero = Number(costo || 0);
  const margenNumero = Number(margen || 0);

  if (costoNumero <= 0 || margenNumero <= 0 || margenNumero >= 100) {
    return 0;
  }

  return Math.round(costoNumero / (1 - margenNumero / 100));
}

// ============================================================
// OBTENER RECETA DE PRODUCTO
// ============================================================

function obtenerRecetaProducto(productoId, callback) {
  const recetaSql = `SELECT
        rd.id,
        rd.recetaId,
        rd.productoId,
        rd.materiaPrimaId,
        p.nombre AS materiaPrima,
        p.nombre AS producto,
        rd.cantidad,
        rd.unidad
      FROM recetas_detalle rd
      INNER JOIN recetas r ON r.id = rd.recetaId
      LEFT JOIN productos p ON p.id = rd.productoId
      WHERE r.productoId = ?
      ORDER BY rd.id ASC`;

  db.all(recetaSql, [productoId], (error, receta) => {
    if (error) {
      return callback(error);
    }

    if (!receta || receta.length === 0) {
      return callback(null, []);
    }

    let index = 0;

    function completarSiguiente() {
      if (index >= receta.length) {
        return callback(null, receta);
      }

      const item = receta[index];

      if (item.productoId) {
        index++;
        return completarSiguiente();
      }

      const nombre = String(item.materiaPrima || "").trim();

      if (!nombre) {
        index++;
        return completarSiguiente();
      }

      db.get(
        `SELECT id, nombre, unidad, esMateriaPrima, activo
          FROM productos
          WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))
            AND activo = 1
            AND esMateriaPrima = 1
          LIMIT 1`,
        [nombre],
        (productoError, producto) => {
          if (productoError) {
            return callback(productoError);
          }

          if (producto) {
            item.productoId = producto.id;
            item.materiaPrimaId = producto.id;
          }

          index++;
          completarSiguiente();
        }
      );
    }

    completarSiguiente();
  });
}

// ============================================================
// ACTUALIZAR COSTO DEL PRODUCTO DESDE SU RECETA
// ============================================================

function actualizarCostoProductoDesdeReceta(productoId, callback) {
  db.get(
    `SELECT id, margen, unidad, tieneReceta, activo
      FROM productos
      WHERE id = ?
      LIMIT 1`,
    [productoId],
    (error, producto) => {
      if (error) {
        return callback(error);
      }

      if (!producto) {
        return callback(new Error("Producto no encontrado al actualizar costo."));
      }

      if (Number(producto.tieneReceta || 0) !== 1) {
        return callback(null);
      }

      obtenerRecetaProducto(productoId, (recetaError, receta) => {
        if (recetaError) {
          return callback(recetaError);
        }

        calcularCostoReceta(receta, (costoError, resultado) => {
          if (costoError) {
            return callback(costoError);
          }

          const costo = Number(resultado.costoTotal.toFixed(2));
          const precioSugerido = calcularPrecioSugerido(costo, producto.margen);

          db.run(
            `UPDATE productos
              SET
                costoActual = ?,
                precioSugerido = ?,
                fechaActualizacion = CURRENT_TIMESTAMP
              WHERE id = ?`,
            [costo, precioSugerido, productoId],
            (updateError) => {
              if (updateError) {
                return callback(updateError);
              }

              callback(null, {
                costoActual: costo,
                precioSugerido: precioSugerido,
                costoReceta: costo,
                detalleCostoReceta: resultado.ingredientes,
              });
            }
          );
        });
      });
    }
  );
}

// ============================================================
// ACTUALIZAR PRECIO SUGERIDO DESDE COSTO ACTUAL
// ============================================================

function actualizarPrecioSugeridoDesdeCosto(producto) {
  const costo = Number(producto.costoActual || 0);
  const margen = Number(producto.margen || 0);
  return calcularPrecioSugerido(costo, margen);
}

// ============================================================
// OBTENER PRODUCTOS
// ============================================================

function getAll(callback) {
  const sql = `SELECT * FROM productos WHERE activo = 1 ORDER BY nombre ASC`;

  db.all(sql, [], (err, products) => {
    if (err) {
      return callback(err);
    }

    if (!products || products.length === 0) {
      return callback(null, []);
    }

    let pendientes = products.length;
    let finalizado = false;

    function terminar(errorFinal) {
      if (finalizado) {
        return;
      }

      if (errorFinal) {
        finalizado = true;
        return callback(errorFinal);
      }

      pendientes--;

      if (pendientes === 0) {
        finalizado = true;
        callback(null, products);
      }
    }

    products.forEach((product) => {
      if (Number(product.tieneReceta || 0) !== 1) {
        product.receta = [];
        product.costoReceta = 0;
        product.detalleCostoReceta = [];
        product.precioSugeridoReceta = 0;
        product.precioSugerido = actualizarPrecioSugeridoDesdeCosto(product);
        return terminar(null);
      }

      obtenerRecetaProducto(product.id, (recetaErr, receta) => {
        if (recetaErr) {
          return terminar(recetaErr);
        }

        product.receta = receta || [];

        calcularCostoReceta(product.receta, (costoErr, resultado) => {
          if (costoErr) {
            return terminar(costoErr);
          }

          const costoReceta = Number(resultado.costoTotal.toFixed(2));
          const precioSugeridoReceta = calcularPrecioSugerido(costoReceta, product.margen);

          product.costoReceta = costoReceta;
          product.detalleCostoReceta = resultado.ingredientes;
          product.precioSugeridoReceta = precioSugeridoReceta;
          product.costoActual = costoReceta;
          product.precioSugerido = precioSugeridoReceta;

          terminar(null);
        });
      });
    });
  });
}

// ============================================================
// BUSCAR PRODUCTO - MATERIA PRIMA
// ============================================================

function buscarMateriaPrima(ingredient, callback) {
  if (ingredient.productoId !== undefined && ingredient.productoId !== null && ingredient.productoId !== "") {
    db.get(
      `SELECT id, nombre, unidad, costoActual, esMateriaPrima, activo
        FROM productos
        WHERE id = ? AND activo = 1 LIMIT 1`,
      [Number(ingredient.productoId)],
      (error, producto) => {
        if (error) {
          return callback(error);
        }

        if (!producto) {
          return callback(new Error(`No existe el producto-materia prima con ID ${ingredient.productoId}.`));
        }

        if (Number(producto.esMateriaPrima || 0) !== 1) {
          return callback(new Error(`El producto "${producto.nombre}" no está marcado como materia prima.`));
        }

        callback(null, producto);
      }
    );
    return;
  }

  if (ingredient.materiaPrimaId !== undefined && ingredient.materiaPrimaId !== null && ingredient.materiaPrimaId !== "") {
    db.get(
      `SELECT id, nombre, unidad, costoActual, esMateriaPrima, activo
        FROM productos
        WHERE id = ? AND activo = 1 AND esMateriaPrima = 1 LIMIT 1`,
      [Number(ingredient.materiaPrimaId)],
      (error, producto) => {
        if (error) {
          return callback(error);
        }

        if (producto) {
          return callback(null, producto);
        }

        buscarPorNombre(ingredient, callback);
      }
    );
    return;
  }

  buscarPorNombre(ingredient, callback);
}

// ============================================================
// BUSCAR PRODUCTO - MATERIA PRIMA POR NOMBRE
// ============================================================

function buscarPorNombre(ingredient, callback) {
  const nombre = String(ingredient.producto || ingredient.materiaPrima || "").trim();

  if (!nombre) {
    return callback(new Error("La receta contiene una materia prima sin nombre."));
  }

  db.get(
    `SELECT id, nombre, unidad, costoActual, esMateriaPrima, activo
      FROM productos
      WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?)) AND activo = 1 AND esMateriaPrima = 1 LIMIT 1`,
    [nombre],
    (err, producto) => {
      if (err) {
        return callback(err);
      }

      if (!producto) {
        return callback(new Error(`No existe el producto "${nombre}" marcado como materia prima.`));
      }

      callback(null, producto);
    }
  );
}

// ============================================================
// GUARDAR DETALLES DE RECETA
// ============================================================

function guardarDetallesReceta(recetaId, receta, callback) {
  const ingredientes = Array.isArray(receta)
    ? receta.filter((item) => {
        return (
          item &&
          (item.productoId || item.materiaPrimaId || String(item.producto || item.materiaPrima || "").trim() !== "") &&
          Number(item.cantidad || 0) > 0
        );
      })
    : [];

  if (ingredientes.length === 0) {
    return callback(null);
  }

  let index = 0;

  function guardarSiguiente() {
    if (index >= ingredientes.length) {
      return callback(null);
    }

    const ingredient = ingredientes[index];

    buscarMateriaPrima(ingredient, (err, producto) => {
      if (err) {
        return callback(err);
      }

      const cantidad = Number(ingredient.cantidad || 0);
      const unidad = ingredient.unidad || producto.unidad || "kg";

      db.run(
        `INSERT INTO recetas_detalle (recetaId, productoId, materiaPrimaId, cantidad, unidad) VALUES (?, ?, ?, ?, ?)`,
        [recetaId, producto.id, producto.id, cantidad, unidad],
        (insertErr) => {
          if (insertErr) {
            return callback(insertErr);
          }

          index++;
          guardarSiguiente();
        }
      );
    });
  }

  guardarSiguiente();
}

// ============================================================
// GUARDAR RECETA
// ============================================================

function guardarReceta(productoId, product, callback) {
  if (!product.tieneReceta) {
    return callback(null);
  }

  db.get(`SELECT id FROM recetas WHERE productoId = ? LIMIT 1`, [productoId], (err, recetaExistente) => {
    if (err) {
      return callback(err);
    }

    if (recetaExistente) {
      db.run(
        `UPDATE recetas SET rendimiento = ?, unidad = ?, observaciones = ? WHERE id = ?`,
        [1, product.unidad || "kg", product.observacionesReceta || null, recetaExistente.id],
        (updateErr) => {
          if (updateErr) {
            return callback(updateErr);
          }

          db.run(`DELETE FROM recetas_detalle WHERE recetaId = ?`, [recetaExistente.id], (deleteErr) => {
            if (deleteErr) {
              return callback(deleteErr);
            }

            guardarDetallesReceta(recetaExistente.id, product.receta, callback);
          });
        }
      );
      return;
    }

    db.run(
      `INSERT INTO recetas (productoId, rendimiento, unidad, observaciones) VALUES (?, ?, ?, ?)`,
      [productoId, 1, product.unidad || "kg", product.observacionesReceta || null],
      function (insertErr) {
        if (insertErr) {
          return callback(insertErr);
        }

        const recetaId = this.lastID;
        guardarDetallesReceta(recetaId, product.receta, callback);
      }
    );
  });
}

// ============================================================
// ELIMINAR RECETA
// ============================================================

function eliminarReceta(productoId, callback) {
  db.get(`SELECT id FROM recetas WHERE productoId = ? LIMIT 1`, [productoId], (err, receta) => {
    if (err) {
      return callback(err);
    }

    if (!receta) {
      return callback(null);
    }

    db.run(`DELETE FROM recetas_detalle WHERE recetaId = ?`, [receta.id], (deleteDetailsErr) => {
      if (deleteDetailsErr) {
        return callback(deleteDetailsErr);
      }

      db.run(`DELETE FROM recetas WHERE id = ?`, [receta.id], callback);
    });
  });
}

// ============================================================
// CREAR PRODUCTO
// ============================================================

function create(product, callback) {
  const sql = `INSERT INTO productos
    (nombre, categoria, precio, stock, stockMinimo, unidad, tipo, controlaStock, esMateriaPrima, esElaborado, tieneReceta, margen, costoActual, precioSugerido, familiaCosto, activo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const costoInicial = Number(product.costoActual || 0);
  const margenInicial = Number(product.margen || 0);
  const precioSugeridoInicial = calcularPrecioSugerido(costoInicial, margenInicial);

  db.run(
    sql,
    [
      product.nombre,
      product.categoria || "",
      Number(product.precio || 0),
      Number(product.stock || 0),
      Number(product.stockMinimo || 0),
      product.unidad || "kg",
      product.tipo || "producto",
      product.controlaStock ? 1 : 0,
      product.esMateriaPrima ? 1 : 0,
      product.esElaborado ? 1 : 0,
      product.tieneReceta ? 1 : 0,
      margenInicial,
      costoInicial,
      precioSugeridoInicial,
      product.familiaCosto || "MANUAL",
      product.activo ?? 1,
    ],
    function (error) {
      if (error) {
        return callback(error);
      }

      const productoId = this.lastID;

      if (!product.tieneReceta) {
        return callback(null, productoId);
      }

      guardarReceta(productoId, product, (recetaError) => {
        if (recetaError) {
          console.error("Error guardando receta:", recetaError.message);
          return callback(recetaError);
        }

        actualizarCostoProductoDesdeReceta(productoId, (costoError) => {
          if (costoError) {
            console.error("Error calculando costo de receta:", costoError.message);
            return callback(costoError);
          }

          callback(null, productoId);
        });
      });
    }
  );
}

// ============================================================
// ACTUALIZAR PRODUCTO
// ============================================================

function update(id, product, callback) {
  const sql = `UPDATE productos
    SET
      nombre = ?, categoria = ?, precio = ?, stock = ?, stockMinimo = ?, unidad = ?, tipo = ?,
      controlaStock = ?, esMateriaPrima = ?, esElaborado = ?, tieneReceta = ?, margen = ?,
      costoActual = ?, precioSugerido = ?, familiaCosto = ?, activo = ?,
      fechaActualizacion = CURRENT_TIMESTAMP
    WHERE id = ?`;

  const costo = Number(product.costoActual || 0);
  const margen = Number(product.margen || 0);
  const precioSugerido = calcularPrecioSugerido(costo, margen);

  db.run(
    sql,
    [
      product.nombre,
      product.categoria || "",
      Number(product.precio || 0),
      Number(product.stock || 0),
      Number(product.stockMinimo || 0),
      product.unidad || "kg",
      product.tipo || "producto",
      product.controlaStock ? 1 : 0,
      product.esMateriaPrima ? 1 : 0,
      product.esElaborado ? 1 : 0,
      product.tieneReceta ? 1 : 0,
      margen,
      costo,
      precioSugerido,
      product.familiaCosto || "MANUAL",
      product.activo ?? 1,
      id,
    ],
    (error) => {
      if (error) {
        return callback(error);
      }

      if (!product.tieneReceta) {
        return eliminarReceta(id, (recetaError) => {
          if (recetaError) {
            return callback(recetaError);
          }
          callback(null);
        });
      }

      guardarReceta(id, product, (recetaError) => {
        if (recetaError) {
          console.error("Error actualizando receta:", recetaError.message);
          return callback(recetaError);
        }

        actualizarCostoProductoDesdeReceta(id, (costoError) => {
          if (costoError) {
            console.error("Error recalculando costo:", costoError.message);
            return callback(costoError);
          }

          callback(null);
        });
      });
    }
  );
}

// ============================================================
// ELIMINAR PRODUCTO
// ============================================================

function remove(id, callback) {
  eliminarReceta(id, (recetaError) => {
    if (recetaError) {
      return callback(recetaError);
    }

    db.run(`UPDATE productos SET activo = 0, fechaActualizacion = CURRENT_TIMESTAMP WHERE id = ?`, [id], callback);
  });
}

// ============================================================
// EXPORTAR
// ============================================================

module.exports = {
  getAll,
  create,
  update,
  remove,
};
