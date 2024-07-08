import React from 'react';
import Dropzone from "../../Dropzone";
import "../../../pages/StepperWrapper/stepper.css"
import VoxelBox from "../../VoxelBox/VoxelBox";


const ImageLoader = ({state, imageType, setFiles, isProjections, addProjections, isVoxel = true}) => {

    return (
        <div className="row" style={{justifyContent: "center"}}>
            {isVoxel ? <div className="column-1" style={{zIndex: 2, border: `1px solid var(--button-color)`}}>
                <VoxelBox
                    voxelXY={state.voxelXY}
                    voxelZ={state.voxelZ}
                    setVoxelXY={state.setVoxelXY}
                    setVoxelZ={state.setVoxelZ}
                />
            </div> : null}
            <div className="column-2" style={{zIndex: 1}}>
                <Dropzone
                    files={state.files}
                    addFiles={state.addFiles}
                    setFiles={setFiles}
                    isProjections={isProjections}
                    addProjections={addProjections}
                    imageType={imageType}
                    state={state}
                />
            </div>
        </div>
    );
};
export default ImageLoader;