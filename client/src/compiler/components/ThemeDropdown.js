import React from "react";
// import Select from "react-select";
import { useState } from "react";
import monacoThemes from "monaco-themes/themes/themelist";
import { customStyles } from "../constants/customStyles";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

const ThemeDropdown = ({ handleThemeChange, theme }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (event) => {
    const selectedTheme = event.target.value;
    handleThemeChange({
      value: selectedTheme,
      label: monacoThemes[selectedTheme],
    });
  };

  return (
    <>
      <Select
        labelId="theme-dropdown-label"
        id="theme-dropdown"
        open={open}
        onClose={handleClose}
        onOpen={handleOpen}
        value={theme.value}
        onChange={handleChange}
      >
        {Object.entries(monacoThemes).map(([themeId, themeName]) => (
          <MenuItem key={themeId} value={themeId}>
            {themeName}
          </MenuItem>
        ))}
      </Select>
    </>
  );
};

export default ThemeDropdown;
