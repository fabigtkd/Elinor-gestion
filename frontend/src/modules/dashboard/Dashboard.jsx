import {
  Grid,
  Typography,
  Box,
  Button,
} from "@mui/material";


import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";


import StatCard from "../../components/StatCard";
import DashboardHeader from "../../components/DashboardHeader";


import productsData from "../products/data/products";



export default function Dashboard() {


  const products =
    JSON.parse(
      localStorage.getItem("elinor_products")
    ) || productsData;



  const totalProductos =
    products.length;




  const cards = [


    {
      title:"Ventas",
      value:"$ 0",
      color:"#D4A72C",
      icon:<PointOfSaleIcon />,
    },


    {
      title:"Caja",
      value:"$ 0",
      color:"#D4A72C",
      icon:<AccountBalanceWalletIcon />,
    },


    {
      title:"Compras",
      value:"$ 0",
      color:"#D4A72C",
      icon:<ShoppingCartIcon />,
    },


    {
      title:"Productos",
      value:totalProductos,
      color:"#D4A72C",
      icon:<InventoryIcon />,
    },


  ];





  const quickActions = [


    {
      text:"Nueva venta",
      icon:<PointOfSaleIcon />,
    },


    {
      text:"Cierre de caja",
      icon:<AccountBalanceWalletIcon />,
    },


    {
      text:"Stock",
      icon:<InventoryIcon />,
    },


    {
      text:"Reportes",
      icon:<AssessmentIcon />,
    },


  ];





  return (

    <Box>


      <DashboardHeader />



      <Typography

        variant="h6"

        sx={{

          mb:2,

          fontWeight:600,

          color:"#FAFAFA",

          letterSpacing:0.5,

        }}

      >

        Resumen del negocio

      </Typography>




      <Grid

        container

        spacing={3}

      >

        {
          cards.map((card)=>(

            <Grid

              size={{xs:12, md:3}}

              key={card.title}

            >

              <StatCard

                title={card.title}

                value={card.value}

                color={card.color}

                icon={card.icon}

              />


            </Grid>


          ))
        }


      </Grid>





      <Grid

        container

        spacing={2}

        sx={{

          mt:3,

        }}

      >


        {
          quickActions.map((item)=>(


            <Grid

              size={{xs:12, md:3}}

              key={item.text}

            >


              <Button


                fullWidth


                variant="outlined"


                startIcon={item.icon}



                sx={{


                  height:48,


                  color:"#D4A72C",


                  borderColor:"#D4A72C",


                  fontWeight:600,


                  letterSpacing:0.5,


                  backgroundColor:
                    "rgba(212,167,44,0.05)",



                  "&:hover":{


                    backgroundColor:"#D4A72C",


                    color:"#000000",


                    borderColor:"#D4A72C",


                  },


                }}


              >

                {item.text}


              </Button>


            </Grid>


          ))
        }


      </Grid>



    </Box>

  );


}