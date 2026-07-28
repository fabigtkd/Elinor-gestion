import {
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";


export default function StatCard({
  title,
  value,
  color = "#D4A72C",
  icon,
}) {


  return (

    <Card

      sx={{

        height:"100%",

        minHeight:150,

        background:
          "linear-gradient(145deg,#181818,#101010)",

        border:
          "1px solid rgba(212,167,44,0.18)",

        borderRadius:3,

        overflow:"hidden",

        transition:"0.25s ease",


        "&:hover":{

          transform:
            "translateY(-4px)",

          borderColor:
            "rgba(212,167,44,0.45)",

          boxShadow:
            "0 12px 30px rgba(0,0,0,0.45)",

        },


      }}

    >


      <CardContent

        sx={{

          p:3,

        }}

      >


        <Box

          sx={{

            display:"flex",

            justifyContent:"space-between",

            alignItems:"flex-start",

          }}

        >


          <Box>


            <Typography

              sx={{

                color:"#AFAFAF",

                fontSize:"0.85rem",

                letterSpacing:0.5,

                mb:1,

              }}

            >

              {title}

            </Typography>



            <Typography

              sx={{

                color:"#FAFAFA",

                fontSize:"1.8rem",

                fontWeight:700,

                letterSpacing:1,

              }}

            >

              {value}

            </Typography>


          </Box>




          <Box

            sx={{

              width:46,

              height:46,

              borderRadius:2,

              display:"flex",

              alignItems:"center",

              justifyContent:"center",

              color:color,

              background:
                "rgba(212,167,44,0.08)",

              border:
                "1px solid rgba(212,167,44,0.25)",

            }}

          >

            {icon}

          </Box>



        </Box>



      </CardContent>


    </Card>


  );

}