import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";

import theme from "./theme";

import AppRouter from "./app/router/AppRouter";

import "./index.css";


ReactDOM.createRoot(
  document.getElementById("root")
).render(

  <React.StrictMode>

    <BrowserRouter>

      <ThemeProvider theme={theme}>

        <CssBaseline />

        <AppRouter />

      </ThemeProvider>

    </BrowserRouter>

  </React.StrictMode>

);