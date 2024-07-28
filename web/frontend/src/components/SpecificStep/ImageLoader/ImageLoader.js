import React from 'react';
import Dropzone from "../../Dropzone";
import "../../../pages/StepperWrapper/stepper.css"
import VoxelBox from "../../VoxelBox/VoxelBox";


const ImageLoader = ({state, imageType, nameImage, makePreload, setFiles, getProjections, addProjections, isVoxel = true}) => {


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
                    getProjections={getProjections}
                    addProjections={addProjections}
                    imageType={imageType}
                    nameImage={nameImage}
                    makePreload={makePreload}
                    state={state}
                />
            </div>
        </div>
    );
};
export default ImageLoader;