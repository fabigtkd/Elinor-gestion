import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";

import theme from "./theme";

import AppRouter from "./app/router/AppRouter";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>

    <ThemeProvider theme={theme}>

      <CssBaseline />

      <AppRouter />

    </ThemeProvider>

  </React.StrictMode>
);