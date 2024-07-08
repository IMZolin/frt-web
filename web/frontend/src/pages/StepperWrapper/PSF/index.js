import React, {useEffect, useState} from 'react';
import StepperWrapper from '../../StepperWrapper';
import TifCompare from '../../../components/TifCompare';
import ChooseList from '../../../components/ChooseList';
import {useStateValues} from "../state";
import {base64ToTiff} from '../../../shared/hooks/showImages';
import {hexToRgb} from '../../../shared/hooks/showImages';
import useAxiosStore from '../../../app/store/axiosStore';
import './stepper.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Downloader from "../../../components/SpecificStep/Downloader/Downloader";
import ImageLoader from "../../../components/SpecificStep/ImageLoader/ImageLoader";
import CustomButton from "../../../components/CustomButton/CustomButton";
import SliderContainer from "../../../components/SliderContainer/SliderContainer";
import CustomTextfield from "../../../components/CustomTextfield/CustomTextfield";


const StepperPSF = () => {
    const state = useStateValues();
    const [bannerStatus, setBannerStatus] = useState(null);
    const [bannerMessage, setBannerMessage] = useState('');
    const steps = ['Load average bead', 'Calculate PSF', 'Save results'];
    const axiosStore = useAxiosStore();

    const handleGetAverageBead = async () => {
        try {
            const response = await axiosStore.getData({
                image_type: 'avg_bead',
                is_compress: true
            });
            console.log('Response:', response);

            if (response.image_show && response.projections) {
                setBannerStatus('success');
                setBannerMessage('Averaged bead preloaded successfully');
                const newAverageBead = response.image_show.map((base64Data, index) => {
                    return base64ToTiff(base64Data, 'image/tiff', `avg_bead_${index}.tiff`);
                });
                const newProjection = response.projections.map((base64Data, index) => {
                    return base64ToTiff(base64Data, 'image/tiff', `avg_bead_xyz_${index}.tiff`);
                });
                state.setAverageBeadProjection(newProjection);
                state.setAverageBead(newAverageBead);
                state.setIsLoad(true);
            } else {
                console.log('No average bead data found in the response.');
                setBannerStatus('error');
                setBannerMessage(`Error: ${response.message}`);
            }
        } catch (error) {
            console.error('Error fetching average bead:', error);
            setBannerStatus('error');
            setBannerMessage(`Error posting data: ${error.message}`);
        }
    };

    useEffect(() => {
        if (state.activeStep === 0) {
            handleGetAverageBead();
        }
    }, [state.activeStep]);

    const handlePSFCalculate = async () => {
        console.log("Im trying make psf extraction");
        try {
            const requestData = {
                bead_size: state.beadSize,
                iterations: state.iter,
                regularization: state.regularization,
                zoom_factor: state.zoomFactor,
                decon_method: state.deconvMethods[state.deconvMethod]
            };

            const response = await axiosStore.calcPSF(requestData);
            console.log('Response:', response);

            if (response.image_show && response.projections) {
                setBannerStatus('success');
                setBannerMessage('PSF computed successfully');
                const newExtractPSF = response.image_show.map((base64Data, index) => {
                    return base64ToTiff(base64Data, 'image/tiff', `psf_${index}.tiff`);
                });
                const newProjection = response.projections.map((base64Data, index) => {
                    return base64ToTiff(base64Data, 'image/tiff', `psf_xyz_${index}.tif`);
                });
                state.setExtractedPSFProjection(newProjection);
                state.setExtractedPSF(newExtractPSF);
            } else {
                console.log('No extracted PSF found in the response.');
                window.alert('No extracted PSF found in the response.');
            }
        } catch (error) {
            console.error('Error in PSF extraction:', error);
            window.alert('Error in PSF extraction: ' + error.response.data.message);
        }
    };

    const closeBanner = () => {
        setBannerStatus(null);
        setBannerMessage('');
    };

    function getStepContent(step) {
        switch (step) {
            case steps.indexOf('Load average bead'):
                return (
                    <>
                        <ImageLoader
                            state={state}
                            imageType={'avg_bead'}
                            setFiles={state.setAverageBead}
                            isProjections={true}
                            addProjections={state.setAverageBeadProjection}
                            isVoxel={false}
                        />
                    </>
                );
            case steps.indexOf('Calculate PSF'):
                return (
                    <>
                        <div className="row">
                            <div className="column-1" style={{zIndex: 2, border: '1px solid var(--button-color)'}}>
                                <SliderContainer
                                    state={state}
                                    imageShow={state.averageBead}
                                    isScale={true}
                                />
                                <div className="box-parameters">
                                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                        <CustomTextfield
                                            label={"Bead size"}
                                            value={state.beadSize}
                                            setValue={state.setBeadSize}
                                            placeholder={"Enter a bead size"}
                                        />
                                        <CustomTextfield
                                            label={"Zoom factor"}
                                            value={state.zoomFactor}
                                            setValue={state.setZoomFactor}
                                            placeholder={"Enter an zoom factor"}
                                        />
                                    </div>
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
                                </div>
                                <CustomButton
                                    nameBtn={"Calculate PSF"}
                                    colorBtn={'var(--button-color2)'}
                                    handleProcess={handlePSFCalculate}
                                />
                            </div>
                            <div className="column-2">
                                <div className="images__preview" style={{marginTop: '150px'}}>
                                    <TifCompare
                                        img_1={state.averageBead}
                                        img_2={state.extractedPSF}
                                        img_1_projection={state.averageBeadProjection[0]}
                                        img_2_projection={state.extractedPSFProjection[0]}
                                        scale={state.scale}
                                        state={state}
                                        isSameLength={true}
                                        type='psf'
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
                            imagesShow={state.extractedPSF}
                            imagesSave={state.extractedPSFSave}
                            imageProjection={state.extractedPSFProjection[0]}
                            isScale={true}
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
                name="PSF calculation"
                stepContent={getStepContent}
                steps={steps}
                handleNextStep={state.handleNextStep}
                handlePrevStep={state.handlePrevStep}
                activeStep={state.activeStep}
                isLoad={state.isLoad}
                urlPage='/deconvolution'
                typeRun='Deconvolution'
            />
        </div>
    );
};
export default StepperPSF;