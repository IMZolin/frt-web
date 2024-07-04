import React from 'react';
import ChooseList from "../../ChooseList";
import { Button } from "@mui/material";
import TifCompare from "../../TifCompare";

const PreprocessStep = ({ state, handlePreprocessing }) => {
    return (
        <div className="row">
            <div className="column-1" style={{ zIndex: 2, border: `1px solid ${state.customBorder}` }}>
                <div className="slider-container">
                    <div>
                        <label htmlFor="layer-slider">Layer:</label><br/>
                        <input
                            id="layer-slider"
                            type="range"
                            min="0"
                            max={state.sourceImage.length - 1}
                            step="1"
                            value={state.layer}
                            onChange={(e) => state.handleLayerChange(e, state.sourceImage.length - 1)}
                        />
                    </div>
                    <div>
                        <label htmlFor="scale-slider">Scale:</label><br/>
                        <input
                            id="scale-slider"
                            type="range"
                            min="0.5"
                            max="7"
                            step="0.1"
                            value={state.scale}
                            onChange={(e) => state.handleScaleChange(e, 7)}
                        />
                    </div>
                    <div>
                        <label htmlFor="brightness-slider">Brightness:</label><br/>
                        <input
                            id="brightness-slider"
                            type="range"
                            min="1"
                            max="3"
                            step="0.01"
                            value={state.levelBrightness}
                            onChange={state.handleSliderBrightnessChange}
                        />
                    </div>
                </div>
                <div className="box-parameters">
                    <ChooseList
                        className="choose-list"
                        name="Blur type"
                        list={state.denoiseTypes}
                        selected={state.denoiseType}
                        onChange={state.handleDenoiseTypeChange}
                        customTextColor={state.customTextColor}
                    />
                </div>
                <Button variant="outlined" color="secondary" className="btn-run"
                        onClick={handlePreprocessing}>
                    Make preprocessing
                </Button>
            </div>
            <div className="column-2">
                <div className="images__preview">
                    <TifCompare
                        img_1={state.sourceImage}
                        img_2={state.preprocImage}
                        img_1_projection={null}
                        img_2_projection={null}
                        scale={state.scale}
                        state={state}
                        isSameLength={true}
                        type='deconvolution'
                        layerColor={state.customTextColor}
                    />
                </div>
            </div>
        </div>
    );
};

export default PreprocessStep;
