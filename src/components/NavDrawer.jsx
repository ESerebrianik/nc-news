import {
    Box,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Typography,
  } from "@mui/material";
  
  import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
  import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
  import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
  
  export default function NavDrawer({ open, onClose }) {
    const go = (path) => {
      // Временно. Когда подключишь react-router, заменим на navigate(path)
      window.history.pushState({}, "", path);
      onClose?.();
    };
  
    return (
      <Drawer anchor="left" open={open} onClose={onClose}>
        <Box sx={{ width: 280 }} role="presentation" onKeyDown={(e) => e.key === "Escape" && onClose?.()}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">NC News</Typography>
            <Typography variant="body2" color="text.secondary">
              Menu
            </Typography>
          </Box>
  
          <Divider />
  
          <List>
            <ListItemButton onClick={() => go("/")}>
              <ListItemIcon>
                <HomeOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
  
            <ListItemButton onClick={() => go("/articles")}>
              <ListItemIcon>
                <ArticleOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Articles" />
            </ListItemButton>
  
            <ListItemButton onClick={() => go("/topics")}>
              <ListItemIcon>
                <LocalOfferOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Topics" />
            </ListItemButton>
          </List>
  
          <Divider />
        </Box>
      </Drawer>
    );
  }