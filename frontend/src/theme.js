import { createTheme } from "@mui/material/styles";

const theme = createTheme({

  palette: {

    mode: "dark",

    primary: {
      main: "#D4A72C",
      contrastText: "#111111",
    },

    secondary: {
      main: "#F2A900",
      contrastText: "#111111",
    },


    background: {

      default: "#111111",

      paper: "#1B1B1B",

    },


    text: {

      primary: "#FAFAFA",

      secondary: "#BDBDBD",

    },


    success: {
      main: "#7CB342",
    },


    warning: {
      main: "#F2A900",
    },


    error: {
      main: "#E53935",
    },

  },


  shape: {

    borderRadius: 16,

  },


  typography: {

    fontFamily:
      "'Montserrat', 'Segoe UI', Roboto, sans-serif",


    h4: {

      fontWeight: 600,

      letterSpacing: 0.5,

    },


    h5: {

      fontWeight: 600,

    },


    h6: {

      fontWeight: 500,

    },


    button: {

      textTransform: "none",

      fontWeight: 700,

    },

  },


  components: {


    MuiCssBaseline: {

      styleOverrides: {

        body: {

          backgroundColor: "#111111",

        },

      },

    },


    MuiPaper: {

      styleOverrides: {

        root: {

          backgroundColor: "#1B1B1B",

          backgroundImage: "none",

          borderRadius: 16,

          border:
            "1px solid rgba(212,167,44,0.18)",

        },

      },

    },


    MuiCard: {

      styleOverrides: {

        root: {

          backgroundColor: "#1B1B1B",

          borderRadius: 18,

          border:
            "1px solid rgba(212,167,44,0.25)",

          boxShadow:
            "0 10px 30px rgba(0,0,0,0.45)",

        },

      },

    },


    MuiButton: {

      styleOverrides: {


        root: {

          borderRadius: 12,

          height: 44,

        },


        containedPrimary: {

          background:
            "linear-gradient(135deg,#D4A72C,#F2A900)",

          color:"#111111",

          "&:hover": {

            background:
              "linear-gradient(135deg,#F2A900,#D4A72C)",

          },

        },


        outlinedPrimary: {

          borderColor:"#D4A72C",

          color:"#D4A72C",

          "&:hover": {

            borderColor:"#F2A900",

            backgroundColor:
              "rgba(212,167,44,0.12)",

          },

        },

      },

    },


    MuiListItemButton: {

      styleOverrides: {

        root: {

          borderRadius: 12,

        },

      },

    },


    MuiTextField: {

      defaultProps: {

        variant:"outlined",

      },

    },


    MuiOutlinedInput: {

      styleOverrides: {

        root: {

          borderRadius:12,

        },

      },

    },


  },


});


export default theme;