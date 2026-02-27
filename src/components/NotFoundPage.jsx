import { Box, Button, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: "auto",
        mt: 6,
        px: 2,
        textAlign: "center",
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        404 — Page not found
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        We couldn’t find <b>{location.pathname}</b>.
      </Typography>

      <Button
        variant="contained"
        onClick={() => navigate("/")}
        sx={{
          textTransform: "none",
          borderRadius: 2,
          bgcolor: "black",
          "&:hover": { bgcolor: "#111" },
        }}
      >
        Go to Home
      </Button>
    </Box>
  );
}