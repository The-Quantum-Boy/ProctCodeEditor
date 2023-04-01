import React from "react";
import { useState } from "react";

import { languageOptions } from "../constants/languageOptions";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

const LanguagesDropdown = ({ onSelectChange }) => {
  const [selectedOption, setSelectedOption] = useState(languageOptions[0]);

  const handleSelectChange = (event) => {
    const selectedValue = event.target.value;
    const selectedOption = languageOptions.find(
      (option) => option.value === selectedValue
    );
    setSelectedOption(selectedOption);
    onSelectChange(selectedOption);
  };

  return (
    <Select
      labelId="filter-by-category"
      id="filter-by-category"
      value={selectedOption.value}
      onChange={handleSelectChange}
      style={{ width: "350px" }}
    >
      {languageOptions.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );
};

export default LanguagesDropdown;
