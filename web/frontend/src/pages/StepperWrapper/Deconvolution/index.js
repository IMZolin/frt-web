import React, {useEffect} from 'react';
import StepperWrapper from '..';
import Dropzone from '../../../components/Dropzone';
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
import SurveyBanner from "../../../components/SurveyBanner";
import TifViewer from "../../../components/TifViewer";
import TifRow from "../../../components/TifRow";


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
        state.setBanner({status: 'info', message: 'RL deconvolution was started'});
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
                            addDimensions={state.setPsfDimensions}
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
                                    addDimensions={state.setImageDimensions}
                                />
                            </div>
                            <div className="column-2">
                                {state.banner.status &&
                                    <SurveyBanner status={state.banner.status} message={state.banner.message}
                                                  onClose={state.closeBanner}/>}
                                <div className="images__preview">
                                    <TifRow
                                        tifJSXList={[
                                            <TifViewer
                                                img={state.sourceImage[state.layer]}
                                                scale={1}
                                                brightness={state.levelBrightness}
                                                imageProjection={null}
                                                imageName={'Source image'}
                                                imageDimensions={state.imageDimensions}
                                            />,
                                            <TifViewer
                                                img={state.extractedPSF}
                                                scale={1}
                                                brightness={state.levelBrightness}
                                                imageProjection={state.extractedPSFProjection[0]}
                                                imageName={'PSF'}
                                                imageDimensions={state.psfDimensions}
                                            />
                                        ]}
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
                                                img={null}
                                                scale={1}
                                                brightness={state.levelBrightness}
                                                imageProjection={state.extractedPSFProjection[0]}
                                                imageName={'PSF'}
                                                imageDimensions={state.psfDimensions}
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
                    </>
                );
            case steps.indexOf('Save results'):
                return (
                    <>
                        <Downloader
                            state={state}
                            imagesShow={state.resultImage}
                            imageType={'rl_decon_img'}
                            imageProjection={null}
                            isScale={false}
                            nameImage={'RL Deconvolved image'}
                            imageDimensions={state.imageDimensions}
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
