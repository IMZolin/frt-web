import React from 'react';
import StepperWrapper from '..';
import {useStateValues} from "../state";
import useAxiosStore from '../../../app/store/axiosStore';
import {base64ToTiff} from '../../../shared/hooks/showImages';
import '../stepper.css';
import PreprocessStep from "../../../components/SpecificStep/Preprocesser/PreprocessStep";
import ImageLoader from "../../../components/SpecificStep/ImageLoader/ImageLoader";
import Downloader from "../../../components/SpecificStep/Downloader/Downloader";
import SliderContainer from "../../../components/SliderContainer/SliderContainer";
import CustomButton from "../../../components/CustomButton/CustomButton";
import SurveyBanner from "../../../components/SurveyBanner";
import TifViewer from "../../../components/TifViewer";
import TifRow from "../../../components/TifRow";

const NeuralNetwork = () => {
    const state = useStateValues();
    const steps = ['Load image', 'Preprocessing', 'Deconvolution', 'Save results'];
    const axiosStore = useAxiosStore();

    const handleCNNDeconvolution = async () => {
        console.log("Attempting deconvolution");
        state.setBanner({status: 'info', message: 'CNN deconvolution was started'});
        try {
            const response = await axiosStore.cnnDeconImage();
            console.log('Response:', response);

            if (response.image_show) {
                state.setBanner({status: 'success', message: 'CNN deconvolution was successful'});
                const newResult = response.image_show.map((base64Data, index) => {
                    return base64ToTiff(base64Data, 'image/tiff', `cnn_decon_img_${index}.tiff`);
                });
                state.setResultImage(newResult);
                console.log(state.resultImage);
            } else {
                console.log('No CNN deconvolution result found in the response.');
                state.setBanner({status: 'error', message: 'No CNN deconvolution result found in the response.'});
            }
        } catch (error) {
            console.error('Error in CNN deconvolution:', error);
            const errorMessage = error.response && error.response.data && error.response.data.detail
                ? error.response.data.detail
                : error.message;
            state.setBanner({status: 'error', message: 'Error in CNN deconvolution: ' + errorMessage});
        }
    };


    const getStepContent = (step) => {
        switch (step) {
            case steps.indexOf('Load image'):
                return (
                    <ImageLoader
                        state={state}
                        imageType={'source_img'}
                        setFiles={state.setSourceImage}
                        getProjections={false}
                        addProjections={null}
                        isVoxel={true}
                        nameImage={'Source image'}
                        makePreload={false}
                        addDimensions={state.setImageDimensions}
                    />
                );
            case steps.indexOf('Preprocessing'):
                return (
                    <PreprocessStep state={state}/>
                );
            case steps.indexOf('Deconvolution'):
                return (
                    <div className="row">
                        <div className="column-1" style={{zIndex: 2, border: `1px solid var(--button-color)`}}>
                            <SliderContainer
                                state={state}
                                imageShow={state.sourceImage}
                                isScale={false}
                            />
                            <CustomButton
                                nameBtn={"Deconvolve"}
                                colorBtn={'var(--button-color2)'}
                                handleProcess={handleCNNDeconvolution}
                            />
                        </div>
                        <div className="column-2" style={{zIndex: 1}}>
                            {state.banner.status &&
                                <SurveyBanner status={state.banner.status} message={state.banner.message}
                                              onClose={state.closeBanner}/>}
                            <div className="images__preview">
                                <TifRow
                                    tifJSXList={[
                                        <TifViewer
                                            img={state.preprocImage ? state.preprocImage[state.layer] : state.sourceImage[state.layer]}
                                            scale={1}
                                            brightness={state.levelBrightness}
                                            imageProjection={null}
                                            imageName={state.preprocImage ? 'Denoised image' : 'Source image'}
                                            imageDimensions={state.imageDimensions}
                                        />,
                                        <TifViewer
                                            img={state.resultImage[state.layer]}
                                            scale={1}
                                            brightness={state.levelBrightness}
                                            imageProjection={null}
                                            imageName={'Deconvolved image'}
                                            imageDimensions={state.imageDimensions}
                                        />
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                );
            case steps.indexOf('Save results'):
                return (
                    <Downloader
                        state={state}
                        imagesShow={state.resultImage}
                        imageType={'cnn_decon_img'}
                        imageProjection={null}
                        isScale={false}
                        nameImage={'CNN Deconvolved image'}
                        imageDimensions={state.imageDimensions}
                    />
                );
            default:
                return 'unknown step';
        }
    };

    return (
        <div>
            <StepperWrapper
                name="CNN deconvolution"
                stepContent={getStepContent}
                steps={steps}
                handleNextStep={state.handleNextStep}
                handlePrevStep={state.handlePrevStep}
                activeStep={state.activeStep}
                isLoad={state.isLoad}
                typeRun={null}
            />
        </div>
    );
};

export default NeuralNetwork;
