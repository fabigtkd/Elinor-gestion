import { Box, Typography, Button } from "@mui/material";

export default function PageHeader({
  title,
  subtitle,
  buttonText,
  onClick,
}) {

  return (
    <Box
      sx={{
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
        mb:4,
      }}
    >

      <Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight:700,
          }}
        >
          {title}
        </Typography>

        <Typography
          color="text.secondary"
        >
          {subtitle}
        </Typography>

      </Box>


      {buttonText && (

        <Button
          variant="contained"
          onClick={onClick}
        >
          {buttonText}
        </Button>

      )}

    </Box>
  );
}