import React, { useEffect, useState } from "react";

import {
  TextField,
  Button,
  Box,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
  IconButton,
  Paper,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";


const CATEGORIAS = [
  "Pollo y cortes",
  "Producción",
  "Congelados",
  "Embutidos",
  "Sin gluten",
  "Insumos",
  "Otros",
];


const emptyIngredient = {
  productoId: "",
  materiaPrimaId: "",
  materiaPrima: "",
  producto: "",
  cantidad: "",
  unidad: "kg",
};


const emptyProduct = {
  nombre: "",
  categoria: "",
  precio: "",
  stock: "",
  stockMinimo: "",
  unidad: "kg",

  // Función del producto:
  // venta | materia_prima | elaborado
  funcion: "venta",

  controlaStock: false,

  margen: "",

  tieneReceta: false,

  receta: [],
};


export default function ProductForm({
  onSave,
  initialProduct = null,
  materiasPrimas = [],
}) {

  const [product, setProduct] = useState(
    emptyProduct
  );


  // ==========================================================
  // CARGAR PRODUCTO PARA EDICIÓN
  // ==========================================================

  useEffect(() => {

    if (!initialProduct) {

      setProduct({
        ...emptyProduct,
        receta: [],
      });

      return;
    }


    /*
     * --------------------------------------------------------
     * DETERMINAR LA FUNCIÓN
     * --------------------------------------------------------
     *
     * Compatibilidad con productos anteriores.
     */

    let funcion = "venta";


    if (
      Number(
        initialProduct.esMateriaPrima || 0
      ) === 1
    ) {
      funcion = "materia_prima";

    } else if (
      Number(
        initialProduct.esElaborado || 0
      ) === 1
    ) {
      funcion = "elaborado";

    } else if (
      initialProduct.tipo ===
        "materia_prima"
    ) {
      funcion = "materia_prima";

    } else if (
      initialProduct.tipo ===
        "elaborado"
    ) {
      funcion = "elaborado";
    }


    const recetaInicial =
      Array.isArray(
        initialProduct.receta
      )
        ? initialProduct.receta.map(
            (item) => ({

              ...emptyIngredient,

              ...item,

              productoId:
                item.productoId ||
                item.materiaPrimaId ||
                "",

              materiaPrimaId:
                item.materiaPrimaId ||
                item.productoId ||
                "",

              materiaPrima:
                item.materiaPrima ||
                item.producto ||
                "",

              producto:
                item.producto ||
                item.materiaPrima ||
                "",

              cantidad:
                item.cantidad ?? "",

              unidad:
                item.unidad ||
                "kg",

            })
          )
        : [];


    setProduct({

      ...emptyProduct,

      ...initialProduct,

      funcion,

      tieneReceta:
        funcion === "elaborado",

      receta:
        recetaInicial,

    });

  }, [initialProduct]);


  // ==========================================================
  // CAMBIOS GENERALES
  // ==========================================================

  function handleChange(event) {

    const {
      name,
      value,
    } = event.target;


    setProduct((current) => ({

      ...current,

      [name]: value,

    }));

  }


  // ==========================================================
  // CAMBIO DE FUNCIÓN
  // ==========================================================

  function handleFuncionChange(event) {

    const funcion =
      event.target.value;


    setProduct((current) => ({

      ...current,

      funcion,

      /*
       * Solamente los elaborados tienen receta.
       */

      tieneReceta:
        funcion === "elaborado",

      receta:
        funcion === "elaborado"
          ? current.receta
          : [],

    }));

  }


  // ==========================================================
  // STOCK
  // ==========================================================

  function handleStockCheck(event) {

    const checked =
      event.target.checked;


    setProduct((current) => ({

      ...current,

      controlaStock:
        checked,

    }));

  }


  // ==========================================================
  // CAMBIO DE INGREDIENTE
  // ==========================================================

  function handleRecipeChange(
    index,
    field,
    value
  ) {

    setProduct((current) => {

      const nuevaReceta = [
        ...current.receta,
      ];


      nuevaReceta[index] = {

        ...nuevaReceta[index],

        [field]: value,

      };


      return {

        ...current,

        receta:
          nuevaReceta,

      };

    });

  }


  // ==========================================================
  // SELECCIONAR MATERIA PRIMA
  // ==========================================================

  function handleMateriaPrimaChange(
    index,
    materiaPrimaId
  ) {

    const materiaPrima =
      materiasPrimas.find(
        (item) =>
          Number(item.id) ===
          Number(materiaPrimaId)
      );


    setProduct((current) => {

      const nuevaReceta = [
        ...current.receta,
      ];


      nuevaReceta[index] = {

        ...nuevaReceta[index],

        productoId:
          materiaPrimaId,

        materiaPrimaId:
          materiaPrimaId,

        materiaPrima:
          materiaPrima?.nombre ||
          "",

        producto:
          materiaPrima?.nombre ||
          "",

        unidad:
          materiaPrima?.unidad ||
          "kg",

      };


      return {

        ...current,

        receta:
          nuevaReceta,

      };

    });

  }


  // ==========================================================
  // AGREGAR INGREDIENTE
  // ==========================================================

  function addIngredient() {

    setProduct((current) => ({

      ...current,

      receta: [

        ...current.receta,

        {
          ...emptyIngredient,
        },

      ],

    }));

  }


  // ==========================================================
  // ELIMINAR INGREDIENTE
  // ==========================================================

  function removeIngredient(index) {

    setProduct((current) => ({

      ...current,

      receta:
        current.receta.filter(
          (_, i) => i !== index
        ),

    }));

  }


  // ==========================================================
  // GUARDAR
  // ==========================================================

  function handleSubmit(event) {

    event.preventDefault();


    /*
     * --------------------------------------------------------
     * PREPARAR RECETA
     * --------------------------------------------------------
     */

    const recetaPreparada =
      product.funcion === "elaborado"
        ? product.receta
            .filter(
              (item) =>
                item &&
                (
                  item.productoId ||
                  item.materiaPrimaId
                ) &&
                Number(
                  item.cantidad || 0
                ) > 0
            )
            .map((item) => {

              const productoId =
                item.productoId ||
                item.materiaPrimaId;


              const materiaPrima =
                materiasPrimas.find(
                  (materia) =>
                    Number(
                      materia.id
                    ) ===
                    Number(
                      productoId
                    )
                );


              return {

                ...item,

                productoId:
                  Number(
                    productoId
                  ),

                materiaPrimaId:
                  Number(
                    productoId
                  ),

                materiaPrima:
                  materiaPrima?.nombre ||
                  item.materiaPrima ||
                  "",

                producto:
                  materiaPrima?.nombre ||
                  item.producto ||
                  "",

                cantidad:
                  Number(
                    item.cantidad || 0
                  ),

                unidad:
                  item.unidad ||
                  materiaPrima?.unidad ||
                  "kg",

              };

            })
        : [];


    /*
     * --------------------------------------------------------
     * COMPATIBILIDAD CON EL BACKEND ACTUAL
     * --------------------------------------------------------
     */

    const esMateriaPrima =
      product.funcion ===
      "materia_prima";

    const esElaborado =
      product.funcion ===
      "elaborado";


    const tipo =
      esMateriaPrima
        ? "materia_prima"
        : esElaborado
          ? "elaborado"
          : "producto";


    onSave({

      ...product,

      tipo,

      esMateriaPrima,

      esElaborado,

      tieneReceta:
        esElaborado,

      precio:
        Number(
          product.precio || 0
        ),

      /*
       * El stock actual NO se carga desde esta ficha.
       *
       * Se mantiene el valor existente para no romper
       * compatibilidad con el backend y productos anteriores.
       */

      stock:
        Number(
          product.stock || 0
        ),

      stockMinimo:
        Number(
          product.stockMinimo || 0
        ),

      margen:
        Number(
          product.margen || 0
        ),

      receta:
        recetaPreparada,

    });


    if (!initialProduct) {

      setProduct({

        ...emptyProduct,

        receta: [],

      });

    }

  }


  // ==========================================================
  // INTERFAZ
  // ==========================================================

  return (

    <Box

      component="form"

      onSubmit={
        handleSubmit
      }

      sx={{

        display:
          "flex",

        flexDirection:
          "column",

        gap: 2,

        mb: 4,

      }}

    >

      {/* ====================================================
          DATOS DEL PRODUCTO
      ==================================================== */}

      <Typography

        variant="h6"

        sx={{

          color:
            "#D4A72C",

          fontWeight:
            600,

        }}

      >

        Datos del producto

      </Typography>


      <Divider />


      <TextField

        label="Nombre"

        name="nombre"

        value={
          product.nombre
        }

        onChange={
          handleChange
        }

        required

      />


      <TextField

        select

        label="Categoría"

        name="categoria"

        value={
          product.categoria
        }

        onChange={
          handleChange
        }

        required

      >

        {
          CATEGORIAS.map(
            (categoria) => (

              <MenuItem

                key={
                  categoria
                }

                value={
                  categoria
                }

              >

                {
                  categoria
                }

              </MenuItem>

            )
          )
        }

      </TextField>


      <TextField

        select

        label="Unidad"

        name="unidad"

        value={
          product.unidad
        }

        onChange={
          handleChange
        }

      >

        <MenuItem value="kg">
          Kilogramo
        </MenuItem>

        <MenuItem value="unidad">
          Unidad
        </MenuItem>

        <MenuItem value="docena">
          Docena
        </MenuItem>

        <MenuItem value="media_docena">
          Media docena
        </MenuItem>

        <MenuItem value="bandeja">
          Bandeja
        </MenuItem>

      </TextField>


      {/* ====================================================
          FUNCIÓN
      ==================================================== */}

      <TextField

        select

        label="Función del producto"

        value={
          product.funcion
        }

        onChange={
          handleFuncionChange
        }

        helperText={
          "Elegí una sola función para este producto."
        }

      >

        <MenuItem value="venta">

          Venta

        </MenuItem>

        <MenuItem value="materia_prima">

          Materia prima

        </MenuItem>

        <MenuItem value="elaborado">

          Elaborado

        </MenuItem>

      </TextField>


      {/* ====================================================
          INFORMACIÓN COMERCIAL
      ==================================================== */}

      <Typography

        variant="h6"

        sx={{

          color:
            "#D4A72C",

          fontWeight:
            600,

          mt: 1,

        }}

      >

        Información comercial

      </Typography>


      <Divider />


      <TextField

        label="Precio de venta actual"

        name="precio"

        type="number"

        value={
          product.precio
        }

        onChange={
          handleChange
        }

        inputProps={{
          min: 0,
          step: "0.01",
        }}

      />


      <TextField

        label="Margen deseado %"

        name="margen"

        type="number"

        value={
          product.margen
        }

        onChange={
          handleChange
        }

        inputProps={{

          min: 0,

          max: 99.99,

          step: "0.01",

        }}

        helperText={
          "El sistema utilizará este margen para calcular el precio sugerido."
        }

      />


      <Typography

        variant="body2"

        color="text.secondary"

      >

        El costo y el precio sugerido se calculan
        automáticamente desde el sistema de costos.

      </Typography>


      {/* ====================================================
          STOCK
      ==================================================== */}

      <Typography

        variant="h6"

        sx={{

          color:
            "#D4A72C",

          fontWeight:
            600,

          mt: 1,

        }}

      >

        Stock

      </Typography>


      <Divider />


      <FormControlLabel

        control={

          <Checkbox

            checked={
              product.controlaStock
            }

            onChange={
              handleStockCheck
            }

          />

        }

        label="Controla stock"

      />


      {
        product.controlaStock && (

          <TextField

            label="Stock mínimo"

            name="stockMinimo"

            type="number"

            value={
              product.stockMinimo
            }

            onChange={
              handleChange
            }

            inputProps={{

              min: 0,

              step: "0.001",

            }}

            helperText={
              "El sistema avisará cuando el stock llegue a este nivel."
            }

          />

        )
      }


      {/* ====================================================
          ELABORACIÓN
      ==================================================== */}

      {
        product.funcion ===
          "elaborado" && (

          <>

            <Typography

              variant="h6"

              sx={{

                color:
                  "#D4A72C",

                fontWeight:
                  600,

                mt: 1,

              }}

            >

              Elaborado

            </Typography>


            <Typography

              variant="body2"

              color="text.secondary"

            >

              Receta

            </Typography>


            <Divider />


            {/* ==================================================
                RECETA
            ================================================== */}

            <Paper

              elevation={0}

              sx={{

                p: 2,

                mt: 1,

                backgroundColor:
                  "rgba(212,167,44,0.04)",

                border:
                  "1px solid rgba(212,167,44,0.20)",

                borderRadius:
                  2,

              }}

            >

              <Typography

                variant="h6"

                sx={{

                  color:
                    "#D4A72C",

                  fontWeight:
                    600,

                  mb: 0.5,

                }}

              >

                Receta / Fórmula

              </Typography>


              <Typography

                variant="body2"

                color="text.secondary"

                sx={{

                  mb: 2,

                }}

              >

                Ingredientes necesarios para elaborar
                1 kg de producto terminado.

              </Typography>


              {
                materiasPrimas.length ===
                  0 && (

                  <Typography

                    variant="body2"

                    sx={{

                      mb: 2,

                      color:
                        "#E53935",

                    }}

                  >

                    No hay productos marcados como
                    materia prima disponibles.

                  </Typography>

                )
              }


              {
                product.receta.length ===
                  0 && (

                  <Typography

                    variant="body2"

                    color="text.secondary"

                    sx={{

                      mb: 2,

                      fontStyle:
                        "italic",

                    }}

                  >

                    Todavía no hay ingredientes
                    cargados.

                  </Typography>

                )
              }


              {
                product.receta.map(
                  (
                    ingredient,
                    index
                  ) => (

                    <Box

                      key={index}

                      sx={{

                        display:
                          "grid",

                        gridTemplateColumns:
                          "1fr 140px 130px 48px",

                        gap: 1,

                        alignItems:
                          "center",

                        mb: 1.5,

                      }}

                    >

                      <TextField

                        select

                        size="small"

                        label="Materia prima"

                        value={

                          ingredient.productoId ||

                          ingredient.materiaPrimaId ||

                          ""

                        }

                        onChange={(event) =>
                          handleMateriaPrimaChange(

                            index,

                            event.target.value

                          )
                        }

                      >

                        {
                          materiasPrimas.map(
                            (
                              materiaPrima
                            ) => (

                              <MenuItem

                                key={
                                  materiaPrima.id
                                }

                                value={
                                  materiaPrima.id
                                }

                              >

                                {
                                  materiaPrima.nombre
                                }

                              </MenuItem>

                            )
                          )
                        }

                      </TextField>


                      <TextField

                        size="small"

                        label="Cantidad"

                        type="number"

                        value={
                          ingredient.cantidad
                        }

                        onChange={(event) =>
                          handleRecipeChange(

                            index,

                            "cantidad",

                            event.target.value

                          )
                        }

                        inputProps={{

                          min:
                            0,

                          step:
                            "0.001",

                        }}

                      />


                      <TextField

                        select

                        size="small"

                        label="Unidad"

                        value={

                          ingredient.unidad ||

                          "kg"

                        }

                        onChange={(event) =>
                          handleRecipeChange(

                            index,

                            "unidad",

                            event.target.value

                          )
                        }

                      >

                        <MenuItem value="kg">
                          kg
                        </MenuItem>

                        <MenuItem value="g">
                          g
                        </MenuItem>

                        <MenuItem value="unidad">
                          unidad
                        </MenuItem>

                        <MenuItem value="litro">
                          litro
                        </MenuItem>

                        <MenuItem value="ml">
                          ml
                        </MenuItem>

                      </TextField>


                      <IconButton

                        color="error"

                        onClick={() =>
                          removeIngredient(
                            index
                          )
                        }

                      >

                        <DeleteIcon />

                      </IconButton>

                    </Box>

                  )
                )
              }


              <Button

                variant="outlined"

                startIcon={
                  <AddIcon />
                }

                onClick={
                  addIngredient
                }

                disabled={
                  materiasPrimas.length ===
                    0
                }

                sx={{

                  mt: 1,

                }}

              >

                Agregar ingrediente

              </Button>


              <Box

                sx={{

                  mt: 2,

                  pt: 2,

                  borderTop:
                    "1px solid rgba(255,255,255,0.08)",

                }}

              >

                <Typography

                  variant="body2"

                  color="text.secondary"

                >

                  Rendimiento de referencia:

                </Typography>


                <Typography

                  fontWeight={600}

                >

                  1 kg de producto terminado

                </Typography>

              </Box>

            </Paper>

          </>

        )
      }


      {/* ====================================================
          GUARDAR
      ==================================================== */}

      <Button

        type="submit"

        variant="contained"

        sx={{

          mt: 1,

        }}

      >

        {

          initialProduct

            ? "Actualizar producto"

            : "Guardar producto"

        }

      </Button>

    </Box>

  );

}