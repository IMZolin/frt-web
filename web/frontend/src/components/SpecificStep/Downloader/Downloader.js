import FileDownloader from "../../FileDownloader";
import TifViewer from "../../TifViewer";
import React from "react";
import SliderContainer from "../../SliderContainer/SliderContainer";
import CustomTextfield from "../../CustomTextfield/CustomTextfield";

const Downloader = ({state, imageType, imagesShow, imagesSave, imageProjection, isScale}) =>{
    return (
        <div className="row">
            <div className="column-1" style={{border: `1px solid var(--button-color)`}}>
                <SliderContainer
                    state={state}
                    imageShow={imagesShow}
                    isScale={isScale}
                />
                <CustomTextfield
                    label={"Filename"}
                    value={state.filename}
                    setValue={state.setFilename}
                    placeholder={"Enter a file name"}
                />
                <FileDownloader
                    fileList={imagesSave}
                    folderName={state.filename}
                    btnName={"Save result"}
                />
            </div>
            <div className="column-2" style={{zIndex: 1}}>
                <div className="images__preview" style={{marginRight: '50px'}}>
                    <TifViewer
                        img={imagesShow[state.layer]}
                        scale={state.scale}
                        brightness={state.brightness}
                        imageProjection={imageProjection}
                    />
                </div>
            </div>
        </div>
    );
};
export default Downloader;