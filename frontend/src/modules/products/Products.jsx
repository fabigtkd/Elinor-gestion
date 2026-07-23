import { Box, Typography } from "@mui/material";
import { useState } from "react";

import ProductsTable from "./components/ProductsTable";
import ProductToolbar from "./components/ProductToolbar";
import ProductDialog from "./components/ProductDialog";

import productsData from "./data/products";


export default function Products() {

  const [products, setProducts] = useState(productsData);

  const [search, setSearch] = useState("");

  const [openDialog, setOpenDialog] = useState(false);


  const handleAddProduct = (newProduct) => {

    setProducts([
      ...products,
      {
        ...newProduct,
        id: Date.now(),
      },
    ]);

    setOpenDialog(false);

  };


  const handleDeleteProduct = (id) => {

    setProducts(
      products.filter(
        (product) => product.id !== id
      )
    );

  };


  const filteredProducts = products.filter((product) =>
    product.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );


  return (

    <Box>

      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ mb: 3 }}
      >
        Productos y Stock
      </Typography>


      <ProductToolbar
        search={search}
        setSearch={setSearch}
        onNewProduct={() => setOpenDialog(true)}
      />


      <ProductsTable
        products={
          filteredProducts.map((product) => ({
            ...product,
            onEdit: (item) =>
              console.log("Editar:", item),

            onDelete: handleDeleteProduct,
          }))
        }
      />


      <ProductDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleAddProduct}
      />


    </Box>

  );
}