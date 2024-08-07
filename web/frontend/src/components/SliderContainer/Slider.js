import React from "react";

const Slider = ({idSlider, nameSlider, mimSlider, maxSlider, step, value, onChange}) => {
    return(
        <>
            <label htmlFor={idSlider} style={{fontSize: "16px"}}>{nameSlider}:</label><br/>
            <input
                id={idSlider}
                type="range"
                min={mimSlider}
                max={maxSlider}
                step={step}
                value={value}
                onChange={onChange}
            />
        </>
    );
};
export default Slider;