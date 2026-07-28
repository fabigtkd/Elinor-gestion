const fornecedoresService = require("./proveedores.service");



// ===============================
// OBTENER TODOS
// ===============================

function getProveedores(req, res) {

  fornecedoresService.getAll((error, rows) => {

    if (error) {

      return res.status(500).json({
        error: error.message,
      });

    }

    res.json(rows);

  });

}



// ===============================
// OBTENER UNO
// ===============================

function getProveedor(req, res) {

  const id = req.params.id;

  fornecedoresService.getById(id, (error, row) => {

    if (error) {

      return res.status(500).json({
        error: error.message,
      });

    }

    if (!row) {

      return res.status(404).json({
        error: "Proveedor no encontrado",
      });

    }

    res.json(row);

  });

}



// ===============================
// CREAR
// ===============================

function createProveedor(req, res) {

  const proveedor = req.body;

  if (!proveedor.nombre) {

    return res.status(400).json({

      error: "El nombre es obligatorio",

    });

  }

  fornecedoresService.create(

    proveedor,

    (error, id) => {

      if (error) {

        return res.status(500).json({

          error: error.message,

        });

      }

      res.status(201).json({

        mensaje: "Proveedor creado correctamente",

        id,

      });

    }

  );

}



// ===============================
// ACTUALIZAR
// ===============================

function updateProveedor(req, res) {

  const id = req.params.id;

  const proveedor = req.body;

  fornecedoresService.update(

    id,

    proveedor,

    (error) => {

      if (error) {

        return res.status(500).json({

          error: error.message,

        });

      }

      res.json({

        mensaje: "Proveedor actualizado",

      });

    }

  );

}



// ===============================
// ELIMINAR
// ===============================

function deleteProveedor(req, res) {

  const id = req.params.id;

  fornecedoresService.remove(

    id,

    (error) => {

      if (error) {

        return res.status(500).json({

          error: error.message,

        });

      }

      res.json({

        mensaje: "Proveedor eliminado",

      });

    }

  );

}



module.exports = {

  getProveedores,

  getProveedor,

  createProveedor,

  updateProveedor,

  deleteProveedor,

};