import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

import Menu from "./Menu";
import SearchBar from "./SearchBar";
import AddArticleModal from "./AddArticleModal";

export default function Header({ onSearch, onSelectTopic, onGoHome, selectedTopic }) {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = () => onSearch?.(search);

  const handleClear = () => {
    setSearch("");
    onSearch?.("");
  };

  const goHome = () => {
    onGoHome?.();         
    navigate("/");        
  };

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          px: { xs: 1, sm: 3 },
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* LEFT */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Menu
            selectedTopic={selectedTopic}
            onGoHome={() => onGoHome?.()}
            onSelectTopic={(slug) => onSelectTopic?.(slug)}
            onAddArticle={() => setAddOpen(true)}
          />
  
          <Typography
            onClick={goHome}
            role="button"
            sx={{
              fontWeight: 900,
              cursor: "pointer",
              userSelect: "none",
              lineHeight: 1,
              fontSize: { xs: 28, sm: 34 }, // 👈 меньше на мобилке
            }}
          >
            NC-News
          </Typography>
        </Box>
  
        {/* CENTER: search (desktop only) */}
        <Box
          sx={{
            display: { xs: "none", sm: "block" },
            flex: 1,
            maxWidth: 560,
            mx: "auto",
          }}
        >
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={handleSearch}
            onClear={handleClear}
            loading={false}
          />
        </Box>
  
        {/* RIGHT */}
        <Box sx={{ ml: "auto" }}>
          <Button
            variant="contained"
            onClick={() => setAddOpen(true)}
            sx={{
              bgcolor: "black",
              "&:hover": { bgcolor: "#111" },
              textTransform: "none",
              borderRadius: { xs: "50%", sm: 3 },
              minWidth: { xs: 44, sm: "auto" },
              width: { xs: 44, sm: "auto" },
              height: { xs: 44, sm: 40 },
              px: { xs: 0, sm: 2 },
            }}
          >
            <AddIcon />
            <Box sx={{ display: { xs: "none", sm: "inline" }, ml: 1 }}>
              Add article
            </Box>
          </Button>
        </Box>
      </Box>
  
      {/* Mobile search row */}
      <Box sx={{ display: { xs: "block", sm: "none" }, px: 2, pb: 1.5 }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          onSearch={handleSearch}
          onClear={handleClear}
          loading={false}
        />
      </Box>
  
      <AddArticleModal open={addOpen} onClose={() => setAddOpen(false)} />
    </Box>
  );
}