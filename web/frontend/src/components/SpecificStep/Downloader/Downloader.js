import {TextField} from "@mui/material";
import {hexToRgb} from "../../../shared/hooks/showImages";
import FileDownloader from "../../FileDownloader";
import TifViewer from "../../TifViewer";
import React from "react";

const Downloader = (state, imagesShow, imagesSave) =>{
    return (
        <div className="row">
            <div className="column-1">
                <div className="slider-container">
                    <div>
                        <label htmlFor="layer-slider">Layer:</label><br/>
                        <input
                            id="layer-slider"
                            type="range"
                            min="0"
                            max={imagesShow.length - 1}
                            step="1"
                            value={state.layer2}
                            onChange={(e) => state.handleLayer2Change(e, imagesShow.length - 1)}
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
                <TextField
                    id="filename"
                    label="Filename"
                    variant="outlined"
                    placeholder="Enter a file name"
                    fullWidth
                    margin="normal"
                    name="filename"
                    onChange={(e) => state.setFilename(e.target.value)}
                    value={state.filename}
                    style={{color: state.customTextColor}}
                    sx={{
                        border: `1px solid rgba(${hexToRgb(state.customTextColor)}, 0.2)`,
                        borderRadius: '5px',
                        marginTop: '10px'
                    }}
                    InputLabelProps={{
                        sx: {
                            color: state.customTextColor,
                            textTransform: 'capitalize',
                        },
                    }}
                    inputProps={{
                        style: {color: state.customTextColor},
                    }}
                />
                <FileDownloader
                    fileList={imagesSave}
                    folderName={state.filename}
                    btnName={"Save result"}
                    customBorder={state.customBorder}
                />
            </div>
            <div className="column-2" style={{zIndex: 1}}>
                <div className="images__preview" style={{marginTop: '100px', marginRight: '50px'}}>
                    <TifViewer
                        img={imagesShow[state.layer2]}
                        scale={0.5 * state.scale}
                        brightness={state.brightness}
                        imageProjection={null}
                    />
                </div>
            </div>
        </div>
    );
};
export default Downloader;