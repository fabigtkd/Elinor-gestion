import { Box, Typography, TextField, MenuItem, Button, Paper, Divider } from "@mui/material";

import { useMemo, useState } from "react";

export default function Costos() {
  const [datos, setDatos] = useState({
    nombre: "",
    unidad: "kg",
    costo: "",
    margen: "",
    precioVenta: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;

    setDatos((actual) => ({
      ...actual,
      [name]: value,
    }));
  }

  function limpiar() {
    setDatos({
      nombre: "",
      unidad: "kg",
      costo: "",
      margen: "",
      precioVenta: "",
    });
  }

  const resultado = useMemo(() => {
    const costo = Number(datos.costo || 0);
    const margen = Number(datos.margen || 0);
    const precioVenta = Number(datos.precioVenta || 0);

    let precioSugerido = 0;
    let gananciaSugerida = 0;
    let gananciaActual = 0;
    let margenReal = 0;
    let diferenciaPrecio = 0;

    if (costo > 0 && margen >= 0 && margen < 100) {
      precioSugerido = costo / (1 - margen / 100);
      gananciaSugerida = precioSugerido - costo;
    }

    if (costo > 0 && precioVenta > 0) {
      gananciaActual = precioVenta - costo;
      margenReal = (gananciaActual / precioVenta) * 100;
    }

    if (precioVenta > 0 && precioSugerido > 0) {
      diferenciaPrecio = precioSugerido - precioVenta;
    }

    return {
      precioSugerido,
      gananciaSugerida,
      gananciaActual,
      margenReal,
      diferenciaPrecio,
    };
  }, [datos]);

  function moneda(valor) {
    return Number(valor || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  function porcentaje(valor) {
    return Number(valor || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  }

  const hayResultado = resultado.precioSugerido > 0;

  const hayPrecioActual = Number(datos.precioVenta || 0) > 0 && Number(datos.costo || 0) > 0;

  return (
    <Box sx={{ width: "100%", maxWidth: 900 }}>
      {/* ENCABEZADO */}

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Costos
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Calculadora de costos y precios
        </Typography>
      </Box>

      {/* CALCULADORA */}

      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          border: "1px solid rgba(212,167,44,0.18)",
          boxShadow: "0 8px 22px rgba(0,0,0,0.28)",
        }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Calculadora de precio
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Ingresá los valores manualmente para calcular el precio sugerido.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "2fr 1fr",
            },
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            label="Producto"
            name="nombre"
            value={datos.nombre}
            onChange={handleChange}
            placeholder="Ej.: Milanesa de pollo"
          />

          <TextField select fullWidth label="Unidad" name="unidad" value={datos.unidad} onChange={handleChange}>
            <MenuItem value="kg">Kilogramo</MenuItem>
            <MenuItem value="unidad">Unidad</MenuItem>
          </TextField>

          <TextField
            fullWidth
            type="number"
            label={`Costo por ${datos.unidad}`}
            name="costo"
            value={datos.costo}
            onChange={handleChange}
            inputProps={{ min: 0, step: "0.01" }}
          />

          <TextField
            fullWidth
            type="number"
            label="Margen deseado %"
            name="margen"
            value={datos.margen}
            onChange={handleChange}
            inputProps={{ min: 0, max: 99.99, step: "0.1" }}
          />

          <TextField
            fullWidth
            type="number"
            label={`Precio de venta actual por ${datos.unidad}`}
            name="precioVenta"
            value={datos.precioVenta}
            onChange={handleChange}
            inputProps={{ min: 0, step: "0.01" }}
            sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}
          />
        </Box>

        {/* RESULTADO PRINCIPAL */}

        <Box
          sx={{
            mt: 3,
            p: 3,
            borderRadius: 2,
            backgroundColor: "rgba(212,167,44,0.08)",
            border: "1px solid rgba(212,167,44,0.22)",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Precio sugerido
          </Typography>

          <Typography variant="h3" fontWeight="bold" sx={{ mt: 0.5, mb: 1 }}>
            ${moneda(resultado.precioSugerido)}
          </Typography>

          {hayResultado && (
            <Typography variant="body2" color="text.secondary">
              Ganancia: {" $"}
              {moneda(resultado.gananciaSugerida)}
              {" por "}
              {datos.unidad}
            </Typography>
          )}
        </Box>

        {/* ANALISIS DEL PRECIO ACTUAL */}

        {hayPrecioActual && (
          <>
            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Análisis del precio actual
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                gap: 2,
              }}
            >
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Ganancia actual
                </Typography>

                <Typography variant="h6" fontWeight="bold">
                  ${moneda(resultado.gananciaActual)}
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Margen real
                </Typography>

                <Typography variant="h6" fontWeight="bold">
                  {porcentaje(resultado.margenReal)}%
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Diferencia con sugerido
                </Typography>

                <Typography variant="h6" fontWeight="bold">
                  {resultado.diferenciaPrecio >= 0 ? "+" : ""}${moneda(resultado.diferenciaPrecio)}
                </Typography>
              </Paper>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {resultado.diferenciaPrecio > 0
                ? `El precio actual está $${moneda(resultado.diferenciaPrecio)} por debajo del sugerido.`
                : resultado.diferenciaPrecio < 0
                  ? `El precio actual está $${moneda(Math.abs(resultado.diferenciaPrecio))} por encima del sugerido.`
                  : "El precio actual coincide con el precio sugerido."}
            </Typography>
          </>
        )}

        {/* BOTONES */}

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button variant="outlined" onClick={limpiar}>
            Limpiar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
