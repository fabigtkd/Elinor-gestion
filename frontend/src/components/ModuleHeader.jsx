import { Box, Typography } from "@mui/material";


export default function ModuleHeader({
  title,
  subtitle,
}) {

  return (

    <Box

      sx={{

        textAlign: "center",

        mb: 4,

      }}

    >


      <Typography

        variant="h4"

        sx={{

          color:"#FAFAFA",

          fontWeight:700,

          letterSpacing:1,

        }}

      >

        {title}

      </Typography>




      <Typography

        sx={{

          color:"rgba(255,255,255,0.6)",

          mt:1,

          fontSize:"0.95rem",

        }}

      >

        {subtitle}

      </Typography>




      <Box

        sx={{

          width:70,

          height:2,

          backgroundColor:"#D4A72C",

          margin:"18px auto 0",

        }}

      />


    </Box>


  );

}