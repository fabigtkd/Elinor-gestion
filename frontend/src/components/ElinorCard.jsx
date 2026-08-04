import { Card } from "@mui/material";

export default function ElinorCard({
  children,
  sx = {},
}) {

  return (

    <Card
      sx={{
        width:"100%",
        maxWidth:"none",

        backgroundColor:"#111111",

        border:
          "1px solid rgba(212,167,44,0.22)",

        borderRadius:3,

        boxShadow:
          "0 6px 20px rgba(0,0,0,0.35)",

        ...sx,
      }}
    >

      {children}

    </Card>

  );

}