import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const ChooseList = ({ name, list, selected, onChange, customTextColor }) => {
  return (
    <div style={{ marginTop: "20px" }}>
      <FormControl fullWidth style={{ color: customTextColor }}>
        <InputLabel style={{ color: customTextColor }}>{name}</InputLabel>
        <Select
          style={{ marginTop: "5px", color: customTextColor, backgroundColor: 'transparent' }}
          value={selected}
          onChange={(e) => onChange(e.target.value)}
        >
          {list.map((item) => (
            <MenuItem key={item} value={item} style={{ backgroundColor: 'transparent' }}>
              {item}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default ChooseList;
