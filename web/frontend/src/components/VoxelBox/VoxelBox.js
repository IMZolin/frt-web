import React from "react";
import CustomTextfield from "../CustomTextfield/CustomTextfield";

const VoxelBox = ({ voxelXY, setVoxelXY, voxelZ, setVoxelZ }) => {
    return (
        <>
            <div className="subtitle">Voxel size:</div>
            <div className="voxel-box">
                <CustomTextfield
                    label={"Voxel-XY (micron)"}
                    value={voxelXY}
                    setValue={setVoxelXY}
                    placeholder={"Enter the X-Y voxel dimensions"}
                />
                <CustomTextfield
                    label={"Voxel-Z (micron)"}
                    value={voxelZ}
                    setValue={setVoxelZ}
                    placeholder={"Enter the Z voxel dimensions"}
                />
            </div>
        </>
    );
};

export default VoxelBox;
