import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const ChooseList = ({ name, list, selected, onChange }) => {
  return (
    <FormControl fullWidth>
      <InputLabel>{name}</InputLabel>
      <Select value={selected} onChange={(e) => onChange(e.target.value)}>
        {list.map((item) => (
          <MenuItem key={item} value={item}>
            {item}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ChooseList;



