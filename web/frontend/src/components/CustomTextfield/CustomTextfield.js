import React from "react";
import { TextField } from "@mui/material";

const CustomTextfield = ({ label, value, setValue, placeholder }) => {
    return (
        <TextField
            id="resolution-x"
            label={label}
            variant="outlined"
            placeholder={placeholder}
            fullWidth
            margin="normal"
            onChange={(e) => setValue(e.target.value)}
            value={value}
            sx={{
                border: `1px inset var(--textfield-color)`,
                borderRadius: '5px',
            }}
            InputLabelProps={{
                sx: {
                    color: 'var(--textfield-color)',
                    textTransform: 'capitalize',
                    fontWeight: 'bold'
                },
            }}
            inputProps={{
                style: { color: 'var(--textfield-color)' },
            }}
        />
    );
};

export default CustomTextfield;
