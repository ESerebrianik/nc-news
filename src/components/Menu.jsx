import { useState } from "react";
import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NavDrawer from "./NavDrawer";

export default function Menu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        sx={{ color: "text.primary" }}
      >
        <MenuIcon />
      </IconButton>

      <NavDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}