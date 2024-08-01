import React from 'react';
import StepperWrapper from '..';
import TifCompare from '../../../components/TifCompare';
import { useStateValues } from "../state";
import useAxiosStore from '../../../app/store/axiosStore';
import { base64ToTiff } from '../../../shared/hooks/showImages';
import '../stepper.css';
import PreprocessStep from "../../../components/SpecificStep/Preprocesser/PreprocessStep";
import ImageLoader from "../../../components/SpecificStep/ImageLoader/ImageLoader";
import Downloader from "../../../components/SpecificStep/Downloader/Downloader";
import SliderContainer from "../../../components/SliderContainer/SliderContainer";
import CustomButton from "../../../components/CustomButton/CustomButton";
import TifCompare2 from "../../../components/TifCompare2";

const NeuralNetwork = () => {
    const state = useStateValues();
    const steps = ['Load image', 'Preprocessing', 'Deconvolution', 'Save results'];
    const axiosStore = useAxiosStore();

    const handleCNNDeconvolution = async () => {
        console.log("Attempting deconvolution");
        try {
            const response = await axiosStore.cnnDeconImage();
            console.log('Response:', response);

            if (response.image_show) {
                state.setBanner({ status: 'success', message: 'CNN deconvolution was successful' });
                const newResult = response.image_show.map((base64Data, index) => {
                    return base64ToTiff(base64Data, 'image/tiff', `cnn_decon_img_${index}.tiff`);
                });
                state.setResultImage(newResult);
            } else {
                console.log('No CNN deconvolution result found in the response.');
                state.setBanner({ status: 'error', message: 'No CNN deconvolution result found in the response.' });
            }
        } catch (error) {
            console.error('Error in CNN deconvolution:', error);
            state.setBanner({ status: 'error', message: 'Error in CNN deconvolution: ' + error});
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
                    />
                );
            case steps.indexOf('Preprocessing'):
                return (
                    <PreprocessStep state={state} />
                );
            case steps.indexOf('Deconvolution'):
                return (
                    <div className="row">
                        <div className="column-1" style={{ zIndex: 2, border: `1px solid var(--button-color)` }}>
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
                        <div className="column-2" style={{ zIndex: 1 }}>
                            <div className="images__preview">
                                <TifCompare2
                                        img_1={state.preprocImage}
                                        img_2={null}
                                        img_3={state.resultImage}
                                        img_1_projection={null}
                                        img_2_projection={null}
                                        img_3_projection={null}
                                        scale={state.scale}
                                        state={state}
                                        isSameLength={state.sourceImage.length === state.extractedPSF.length}
                                        type='deconvolution-2'
                                        layerColor={'var(--textfield-color)'}
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
                        imagesSave={state.resultImageSave}
                        imageProjection={null}
                        isScale={false}
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
