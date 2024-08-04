import React from 'react';
import ChooseList from "../../ChooseList";
import CustomButton from "../../CustomButton/CustomButton";
import SliderContainer from "../../SliderContainer/SliderContainer";
import {base64ToTiff} from "../../../shared/hooks/showImages";
import useAxiosStore from "../../../app/store/axiosStore";
import SurveyBanner from "../../SurveyBanner";
import TifViewer from "../../TifViewer";
import TifRow from "../../TifRow";

const PreprocessStep = ({state}) => {
    const axiosStore = useAxiosStore();
    const handlePreprocessing = async () => {
        state.setBanner({status: 'info', message: 'Image preprocessing started'});
        try {

            const response = await axiosStore.preprocessImage(state.denoiseType);
            console.log('Response:', response);

            if (response.image_show) {
                state.setBanner({status: 'success', message: 'Image preprocessed successfully'});
                const preprocessedImage = response.image_show.map((base64Data, index) => {
                    return base64ToTiff(base64Data, 'image/tiff', `result_preproc_${index}.tiff`);
                });
                state.setPreprocImage(preprocessedImage);
            } else {
                console.log('No preprocessing result found in the response.');
                state.setBanner({status: 'error', message: `Error in preprocessing: ${response.message}`});
            }
        } catch (error) {
            console.error('Error in preprocessing:', error);
            state.setBanner({status: 'error', message: `Error in preprocessing: ${error.message}`});
        }
    };
    return (
        <div className="row">
            <div className="column-1" style={{zIndex: 2, border: `1px solid var(--button-color)`}}>
                <SliderContainer
                    state={state}
                    imageShow={state.sourceImage}
                    isScale={false}
                />
                <div className="box-parameters">
                    <ChooseList
                        className="choose-list"
                        name="Denoise type"
                        list={state.denoiseTypes}
                        selected={state.denoiseType}
                        onChange={state.handleDenoiseTypeChange}
                        customTextColor={'var(--textfield-color)'}
                    />
                </div>
                <CustomButton
                    nameBtn={"Make preprocessing"}
                    colorBtn={'var(--button-color)'}
                    handleProcess={handlePreprocessing}
                />
            </div>
            <div className="column-2">
                {state.banner.status && <SurveyBanner status={state.banner.status} message={state.banner.message}
                                                      onClose={state.closeBanner}/>}
                <div className="images__preview" style={{marginTop: '60px'}}>
                    <TifRow
                        tifJSXList={[
                            <TifViewer
                                img={state.sourceImage[state.layer]}
                                scale={1}
                                brightness={state.levelBrightness}
                                imageProjection={null}
                                imageName={'Source image'}
                            />,
                            <TifViewer
                                img={state.preprocImage[state.layer]}
                                scale={1}
                                brightness={state.levelBrightness}
                                imageProjection={null}
                                imageName={'Denoised image'}
                            />
                        ]}
                    />
                </div>
            </div>
        </div>
    );
};

export default PreprocessStep;
