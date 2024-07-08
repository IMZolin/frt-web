import {Button} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";

const CustomButton = ({nameBtn, colorBtn, handleProcess}) => {
    const buttonRef = useRef(null);
    const [isAdjusted, setIsAdjusted] = useState(false);

    useEffect(() => {
        const button = buttonRef.current;
        if (button && button.scrollHeight > button.clientHeight) {
            setIsAdjusted(true);
        }
    }, []);
    return (
        <Button
            variant="contained"
            style={{
                backgroundColor: colorBtn,
                padding: "12px 12px",
                fontSize: "14px"
            }}
            className="btn-run"
            onClick={handleProcess}
        >
            {nameBtn}
        </Button>
    );
};
export default CustomButton;