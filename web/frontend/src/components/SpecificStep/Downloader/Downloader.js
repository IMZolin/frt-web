import TifViewer from "../../TifViewer";
import React from "react";
import SliderContainer from "../../SliderContainer/SliderContainer";
import CustomTextfield from "../../CustomTextfield/CustomTextfield";
import {base64ToTiff} from "../../../shared/hooks/showImages";
import CustomButton from "../../CustomButton/CustomButton";
import {handleDownloadFile} from "./hook";
import useAxiosStore from "../../../app/store/axiosStore";

const Downloader = ({state, imageType, imagesShow, imageProjection, nameImage, isScale}) =>{
    const axiosStore = useAxiosStore();

    const handleDownload = async () => {
        try {
          const response = await axiosStore.getData({
            image_type: imageType,
            get_projections: false,
            get_compressed: false
          });
          console.log('Response:', response);

          if (response.image_show !== null) {
            state.setBanner({ status: 'success', message: `${nameImage} preloaded successfully` });
            const file = base64ToTiff(response.image_show, 'image/tiff', `${imageType}.tiff`);
            handleDownloadFile([file], state.filename)
          } else {
            console.log(`No ${nameImage} data found in the response.`);
            state.setBanner({ status: 'info', message: `Cache not found (${nameImage}): ${response.message}` });
          }
        } catch (error) {
          console.error(`Error fetching ${nameImage}:`, error);
          state.setBanner({ status: 'info', message: `Cache not found (${nameImage}): ${error}` });
        }
      };
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
                <CustomButton
                    nameBtn={"Save result"}
                    colorBtn={'var(--button-color)'}
                    handleProcess={handleDownload}
                />
            </div>
            <div className="column-2" style={{zIndex: 1}}>
                <div className="images__preview">
                    <TifViewer
                        img={null}
                        scale={state.scale}
                        brightness={state.levelBrightness}
                        imageProjection={imageProjection}
                    />
                </div>
            </div>
        </div>
    );
};
export default Downloader;