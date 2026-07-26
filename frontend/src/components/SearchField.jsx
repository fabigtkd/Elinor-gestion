import {
  TextField,
  InputAdornment,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";


export default function SearchField({
  value,
  onChange,
  placeholder = "Buscar...",
}) {

  return (

    <TextField

      fullWidth

      value={value}

      onChange={(e) => onChange(e.target.value)}

      placeholder={placeholder}

      variant="outlined"

      InputProps={{
        startAdornment: (

          <InputAdornment position="start">

            <SearchIcon />

          </InputAdornment>

        ),
      }}

      sx={{
        backgroundColor:"#fff",
        borderRadius:2,
        mb:3,
      }}

    />

  );

}