import React, {useEffect} from 'react';
import StepperWrapper from '..';
import Dropzone from '../../../components/Dropzone';
import TifCompare from '../../../components/TifCompare';
import TifCompare2 from '../../../components/TifCompare2';
import {useStateValues} from "../state";
import {base64ToTiff} from '../../../shared/hooks/showImages';
import useAxiosStore from '../../../app/store/axiosStore';
import ChooseList from '../../../components/ChooseList';

import 'bootstrap/dist/css/bootstrap.min.css';
import CustomButton from "../../../components/CustomButton/CustomButton";
import PreprocessStep from "../../../components/SpecificStep/Preprocesser/PreprocessStep";
import ImageLoader from "../../../components/SpecificStep/ImageLoader/ImageLoader";
import SliderContainer from "../../../components/SliderContainer/SliderContainer";
import CustomTextfield from "../../../components/CustomTextfield/CustomTextfield";
import Downloader from "../../../components/SpecificStep/Downloader/Downloader";
import Slider from "../../../components/SliderContainer/Slider";
import TiffExtractor from "../../../components/TiffExtractor";


const Deconvolution = () => {
    const state = useStateValues();
    const steps = ['Load PSF', 'Load image', 'Preprocessing', 'Deconvolution', 'Save results'];
    const axiosStore = useAxiosStore();

    const handleGetVoxel = async () => {
        try {
            const response = await axiosStore.getVoxel();
            console.log('Response:', response);
            if (response.voxel) {
                state.setVoxelZ(response.voxel[0]);
                state.setVoxelXY(response.voxel[1]);
            } else {
                console.log('No voxel data found in the response.');
                state.setBanner({status: 'error', message: 'No voxel data found in the response.'});
            }
        } catch (error) {
            console.error('Error fetching voxel:', error);
            state.setBanner({status: 'error', message: 'Error fetching voxel:' + error.data.message});
        }
    };

    useEffect(() => {
        if (state.activeStep === 1) {
            handleGetVoxel();
        }
    }, [state.activeStep]);

    const handleDeconvolve = async () => {
        console.log("Im trying make deconvolve");
        try {
            const requestData = {
                iterations: state.iter,
                regularization: state.regularization,
                decon_method: state.deconvMethods[state.deconvMethod]
            };

            const response = await axiosStore.rlDeconImage(requestData);
            console.log('Response:', response);

            if (response.image_show) {
                state.setBanner({status: 'success', message: 'RL deconvolution was successful'});
                const newResult = response.image_show.map((base64Data, index) => {
                    return base64ToTiff(base64Data, 'image/tiff', `rl_decon_img_${index}.tiff`);
                });
                state.setResultImage(newResult);
            } else {
                console.log('No deconvolution result found in the response.');
                state.setBanner({status: 'error', message: 'No deconvolution result found in the response.'});
            }
        } catch (error) {
            console.error('Error in Deconvolution:', error);
            state.setBanner({status: 'error', message: 'Error in Deconvolution:', error});
        }
    };

    function getStepContent(step) {
        switch (step) {
            case steps.indexOf('Load PSF'):
                return (
                    <>
                        <ImageLoader
                            state={state}
                            imageType={'psf'}
                            setFiles={state.setExtractedPSF}
                            getProjections={true}
                            addProjections={state.setExtractedPSFProjection}
                            isVoxel={false}
                            nameImage={'PSF'}
                            makePreload={true}
                        />
                    </>
                );
            case steps.indexOf('Load image'):
                return (
                    <>
                        <div className="row">
                            <div className="column-1" style={{zIndex: 2, border: '1px solid var(--button-color)'}}>
                                <div className="slider-container">
                                    {state.sourceImage.length === state.extractedPSF.length && (
                                        <>
                                            <Slider
                                                idSlider={"layer-slider"}
                                                nameSlider={"Layer"}
                                                mimSlider={"0"}
                                                maxSlider={state.extractedPSF.length - 1}
                                                step={"1"}
                                                value={state.layer}
                                                onChange={(e) => state.handleLayerChange(e, state.extractedPSF.length - 1)}
                                            />
                                        </>
                                    )}<br/>
                                    <div>
                                        <Slider
                                            idSlider={"brightness-slider"}
                                            nameSlider={"Brightness"}
                                            mimSlider={"1"}
                                            maxSlider={"3"}
                                            step={"0.01"}
                                            value={state.levelBrightness}
                                            onChange={state.handleSliderBrightnessChange}
                                        />
                                    </div>
                                </div>
                                <Dropzone
                                    files={state.files}
                                    addFiles={state.addFiles}
                                    setFiles={state.setSourceImage}
                                    getProjections={false}
                                    addProjections={null}
                                    imageType={'source_img'}
                                    nameImage={'Source image'}
                                    makePreload={false}
                                    state={state}
                                />
                            </div>
                            <div className="column-2">
                                {/*{state.banner.status && <SurveyBanner status={state.banner.status} message={state.banner.message} onClose={state.closeBanner} />}*/}
                                <div className="images__preview">
                                    <TifCompare
                                        img_1={state.sourceImage}
                                        img_2={state.extractedPSF}
                                        img_1_projection={null}
                                        img_2_projection={state.extractedPSFProjection[0]}
                                        scale={state.scale}
                                        state={state}
                                        isSameLength={state.sourceImage.length === state.extractedPSF.length}
                                        type='deconvolution'
                                        layerColor={'var(--textfield-color)'}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                );
            case steps.indexOf('Preprocessing'):
                return (
                    <>
                        <PreprocessStep
                            state={state}
                        />
                    </>
                );
            case steps.indexOf('Deconvolution'):
                return (
                    <>
                        <div className="row">
                            <div className="column-1" style={{zIndex: 2, border: `1px solid var(--textfield-color)`}}>
                                <SliderContainer
                                    state={state}
                                    imageShow={state.sourceImage}
                                    isScale={false}
                                />
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <CustomTextfield
                                        label={"Iterations"}
                                        value={state.iter}
                                        setValue={state.setIter}
                                        placeholder={"Enter an iteration number"}
                                    />
                                    <CustomTextfield
                                        label={"Regularization"}
                                        value={state.regularization}
                                        setValue={state.setRegularization}
                                        placeholder={"Enter a regularization"}
                                    />
                                </div>
                                <ChooseList
                                    className="choose-list"
                                    name="Deconvolution method"
                                    list={Object.keys(state.deconvMethods)}
                                    selected={state.deconvMethod}
                                    onChange={state.handleDeconvMethodChange}
                                    customTextColor={'var(--textfield-color)'}
                                />
                                <CustomButton
                                    nameBtn={"Deconvolve"}
                                    colorBtn={'var(--button-color2)'}
                                    handleProcess={handleDeconvolve}
                                />
                            </div>
                            <div className="column-2" style={{zIndex: 1}}>
                                <div className="images__preview">
                                    <TifCompare
                                        img_1={state.preprocImage}
                                        img_2={state.resultImage}
                                        img_1_projection={null}
                                        img_2_projection={null}
                                        scale={state.scale}
                                        state={state}
                                        isSameLength={true}
                                        type='deconvolution'
                                        layerColor={state.customTextColor}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                );
            case steps.indexOf('Save results'):
                return (
                    <>
                        <Downloader
                            state={state}
                            imagesShow={state.resultImage}
                            imagesSave={state.resultImageSave}
                            imageProjection={null}
                            isScale={false}
                        />
                    </>
                );
            default:
                return 'unknown step';
        }
    }

    return (
        <div>
            <StepperWrapper
                name="Richardson–Lucy deconvolution"
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

export default Deconvolution;
