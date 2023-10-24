import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const ChooseList = ({ name, list, selected, onChange }) => {
  return (
    <div style={{ marginTop: "20px"}}>
      <FormControl fullWidth>
        <InputLabel>{name}</InputLabel>
        <Select style={{ marginTop: "5px" }} value={selected} onChange={(e) => onChange(e.target.value)}>
          {list.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default ChooseList;



