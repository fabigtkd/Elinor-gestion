import { Paper, Typography } from "@mui/material";

export default function Dashboard() {
  return (
    <Paper
      sx={{
        padding: 4,
        background: "#1f2937",
        color: "white",
      }}
    >
      <Typography variant="h4">
        Dashboard Elinor Gestión
      </Typography>

      <Typography sx={{ mt: 2 }}>
        Sistema integral para gestión de pollerías.
      </Typography>
    </Paper>
  );
}