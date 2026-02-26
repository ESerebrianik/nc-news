import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import Menu from "./Menu";
import SearchBar from "./SearchBar";
import AddArticleModal from "./AddArticleModal";

export default function Header({ onSearch, onSelectTopic, onGoHome, selectedTopic }) {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const handleSearch = () => onSearch?.(search);

  const handleClear = () => {
    setSearch("");
    onSearch?.("");
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          position: "sticky",
          top: 0,
          zIndex: 1100,
          bgcolor: "background.paper",
        }}
      >
        {/* LEFT: burger + title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Menu
            selectedTopic={selectedTopic}
            onGoHome={() => onGoHome?.()}
            onSelectTopic={(slug) => onSelectTopic?.(slug)}
            onAddArticle={() => setAddOpen(true)}
          />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            NC-News
          </Typography>
        </Box>

        {/* CENTER: search (абсолютный центр) */}
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: 500,
            px: 2,
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

        {/* RIGHT: add article */}
        <Box sx={{ marginLeft: "auto" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddOpen(true)}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              bgcolor: "black",
              "&:hover": { bgcolor: "#111" },
            }}
          >
            Add article
          </Button>
        </Box>
      </Box>

      <AddArticleModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}