import {TextField} from "@mui/material";
import {hexToRgb, toggle} from "../../../shared/hooks/showImages";
import Dropzone from "../../Dropzone";
import React from "react";


const ImageLoader = (state, imageType, setFiles, addProjections, isProjections, isVoxel = true) => {
    return (
        <div className="row">
            {toggle(
                <div className="column-1" style={{zIndex: 2, border: `1px solid ${state.customBorder}`}}>
                    <div className="subtitle">Voxel size:</div>
                    <div className="voxel-box">
                        <TextField
                            className="stepper-resolution"
                            id="resolution-x"
                            label="Voxel-XY (micron)"
                            variant="outlined"
                            placeholder="Enter the resolution in X and Y direction"
                            fullWidth
                            margin="normal"
                            onChange={(e) => state.setVoxelXY(e.target.value)}
                            value={state.voxelXY}
                            sx={{
                                border: `1px solid rgba(${hexToRgb(state.customTextColor)}, 0.3)`,
                                borderRadius: '5px',
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
                        <TextField
                            className="stepper-resolution"
                            id="resolution-z"
                            label="Voxel-Z (micron)"
                            variant="outlined"
                            placeholder="Enter the resolution in Z direction"
                            fullWidth
                            margin="normal"
                            onChange={(e) => state.setVoxelZ(e.target.value)}
                            value={state.voxelZ}
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
                    </div>
                </div>, isVoxel)}
            <div className="column-2" style={{zIndex: 1}}>
                <Dropzone
                    files={state.files}
                    addFiles={state.addFiles}
                    setFiles={setFiles}
                    addProjections={addProjections}
                    imageType={imageType}
                    state={state}
                />
            </div>
        </div>
    );
};
export default ImageLoader;