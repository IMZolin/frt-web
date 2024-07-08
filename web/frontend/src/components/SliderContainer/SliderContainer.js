import React from "react";
import Slider from "./Slider";

const SliderContainer = ({state, imageShow, isScale, maxScale = 2}) => {
    return (
        <>
            <div className="slider-container">
                <div>
                    <Slider
                        className="slider"
                        idSlider={"layer-slider"}
                        nameSlider={"Layer"}
                        mimSlider={"0"}
                        maxSlider={imageShow.length - 1}
                        step={"1"}
                        value={state.layer}
                        onChange={(e) => state.handleLayerChange(e, imageShow.length - 1)}
                    />
                </div>
                <div>
                    {isScale ? <Slider
                        className="slider"
                        idSlider={"scale-slider"}
                        nameSlider={"Scale"}
                        mimSlider={"1"}
                        maxSlider={maxScale}
                        step={"0.01"}
                        value={state.scale}
                        onChange={(e) => state.handleScaleChange(e, 2)}
                    /> : null}
                </div>
                <div>
                    <Slider
                        className="slider"
                        idSlider={"brightness-slider"}
                        nameSlider={"Brightness"}
                        mimSlider={"1"}
                        maxSlider={"3"}
                        step={"0.01"}
                        value={state.levelBrightness}
                        onChange={state.handleSliderBrightnessChange}
                    />
                </div>

            </div>
        </>
    );
};
export default SliderContainer;