import { Box, Typography } from "@mui/material";
import ModuleHeader from "../../components/ModuleHeader";
import ElinorCard from "../../components/ElinorCard";

// NOTA: Esta pantalla es un placeholder temporal.
// El archivo original de Stock se perdió antes de poder guardarse
// (nunca llegó a subirse a GitHub). Esta versión mínima existe solo
// para que el proyecto compile y funcione mientras se define y
// reconstruye el contenido real de esta pantalla.

function Stock() {
  return (
    <Box>
      <ModuleHeader
        title="Stock"
        subtitle="Esta pantalla está en construcción"
      />
      <ElinorCard>
        <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
          Todavía no se definió el contenido de esta sección. Se va a
          reconstruir próximamente.
        </Typography>
      </ElinorCard>
    </Box>
  );
}

export default Stock;