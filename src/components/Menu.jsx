import { useEffect, useState } from "react";
import {
  Box,
  Collapse,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popover,
  Typography,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import { fetchTopics } from "../api"; 

export default function Menu({ onGoHome, onSelectTopic, onAddArticle, selectedTopic }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [themesOpen, setThemesOpen] = useState(false);
  const [topics, setTopics] = useState([]);

  const open = Boolean(anchorEl);

  useEffect(() => {
    fetchTopics()
      .then((data) => setTopics(data.topics || []))
      .catch(() => setTopics([]));
  }, []);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => {
    setAnchorEl(null);
    setThemesOpen(false);
  };

  return (
    <>
      <IconButton onClick={handleOpen} aria-label="Open menu">
        <MenuIcon />
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 260,
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        <Paper elevation={0} sx={{ p: 0.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1,
              py: 1,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <MenuIcon fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Menu
            </Typography>
          </Box>

          <MenuList dense sx={{ py: 0.5 }}>
            <MenuItem
              onClick={() => {
                onGoHome?.();
                handleClose();
              }}
            >
              <ListItemIcon>
                <HomeOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </MenuItem>

            <MenuItem onClick={() => setThemesOpen((v) => !v)}>
              <ListItemIcon>
                <LabelOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Themes" />
              {themesOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </MenuItem>

            <Collapse in={themesOpen} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 2, pr: 1, pb: 0.5 }}>
                {topics.map((t) => {
                  const active = selectedTopic === t.slug;
                  return (
                    <MenuItem
                      key={t.slug}
                      onClick={() => {
                        onSelectTopic?.(t.slug);
                        handleClose();
                      }}
                      sx={{
                        borderRadius: 1.5,
                        my: 0.25,
                        bgcolor: active ? "action.selected" : "transparent",
                      }}
                    >
                      <ListItemText
                        primary={t.slug}
                        secondary={t.description}
                        primaryTypographyProps={{ sx: { textTransform: "capitalize" } }}
                        secondaryTypographyProps={{
                          sx: {
                            display: "block",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          },
                        }}
                      />
                    </MenuItem>
                  );
                })}
              </Box>
            </Collapse>

            <MenuItem
              onClick={() => {
                onAddArticle?.();
                handleClose();
              }}
            >
              <ListItemIcon>
                <AddOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Add Article" />
            </MenuItem>
          </MenuList>
        </Paper>
      </Popover>
    </>
  );
}