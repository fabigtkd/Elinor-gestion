import { Box, Typography } from "@mui/material";
import { useState, useEffect } from "react";

import ProductsTable from "./components/ProductsTable";
import ProductToolbar from "./components/ProductToolbar";
import ProductDialog from "./components/ProductDialog";

import productsData from "./data/products";


export default function Products() {

  const [products, setProducts] = useState(() => {

  const savedProducts =
    localStorage.getItem("elinor_products");

  if (savedProducts) {
    return JSON.parse(savedProducts);
  }

  return productsData.map((product, index) => ({
    ...product,
    id: product.id || index + 1,
  }));

});

  const [search, setSearch] = useState("");

  const [openDialog, setOpenDialog] = useState(false);

  const [productToEdit, setProductToEdit] = useState(null);
  useEffect(() => {

  localStorage.setItem(
    "elinor_products",
    JSON.stringify(products)
  );
}, [products]);


  const handleSaveProduct = (product) => {
console.log("GUARDANDO PRODUCTO", product);
    if (product.id) {

      setProducts(
        products.map((item) =>
          item.id === product.id
            ? product
            : item
        )
      );

    } else {

      setProducts([
        ...products,
        {
          ...product,
          id: Date.now(),
        },
      ]);

    }

    setOpenDialog(false);
    setProductToEdit(null);

  };


  const handleDeleteProduct = (id) => {

    setProducts(
      products.filter(
        (product) => product.id !== id
      )
    );

  };


  const handleEditProduct = (product) => {

    setProductToEdit(product);
    setOpenDialog(true);

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
        onNewProduct={() => {
          setProductToEdit(null);
          setOpenDialog(true);
        }}
      />


      <ProductsTable
        products={
          filteredProducts.map((product) => ({
            ...product,
            onEdit: handleEditProduct,
            onDelete: handleDeleteProduct,
          }))
        }
      />


      <ProductDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
      />


    </Box>

  );

}