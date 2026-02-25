import { Box, TextField, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

export default function SearchBar({
  value,
  onChange,
  onSearch,
  onClear,
  loading,
}) {
  const submit = (e) => {
    e.preventDefault();
    onSearch?.();
  };

  return (
    <Box
      component="form"
      onSubmit={submit}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <TextField
        placeholder="Search..."
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        size="small"
        sx={{ flex: 1 }}
      />

      <IconButton type="submit" disabled={loading}>
        <SearchIcon />
      </IconButton>

      {value && (
        <IconButton onClick={onClear}>
          <CloseIcon />
        </IconButton>
      )}
    </Box>
  );
}