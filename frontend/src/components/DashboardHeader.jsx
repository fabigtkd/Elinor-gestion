import {
  Box,
  Typography,
} from "@mui/material";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";


export default function DashboardHeader() {


  const fecha = new Date().toLocaleDateString(
    "es-AR",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );


  return (

    <Box

      sx={{

        mb:5,

        pb:3,

        borderBottom:
          "1px solid rgba(212,167,44,0.25)",

      }}

    >


      <Box

        sx={{

          display:"flex",

          justifyContent:"space-between",

          alignItems:"center",

          flexWrap:"wrap",

          gap:2,

        }}

      >


        <Box>


          <Typography

            sx={{

              color:"#D4A72C",

              fontSize:"2rem",

              fontWeight:800,

              letterSpacing:2,

              lineHeight:1,

            }}

          >

            Elinor Gestión


          </Typography>



          <Typography

            sx={{

              mt:1,

              color:"#BDBDBD",

              fontSize:"0.95rem",

            }}

          >

            Centro de control del negocio


          </Typography>


        </Box>





        <Box

          sx={{

            display:"flex",

            alignItems:"center",

            gap:1,

          }}

        >


          <CalendarMonthIcon

            sx={{

              color:"#D4A72C",

              fontSize:22,

            }}

          />



          <Typography

            sx={{

              color:"#E0E0E0",

              textTransform:"capitalize",

              fontSize:"0.9rem",

            }}

          >

            {fecha}


          </Typography>


        </Box>



      </Box>



    </Box>


  );

}