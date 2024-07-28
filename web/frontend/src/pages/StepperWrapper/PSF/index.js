import React from 'react';
import StepperWrapper from '../../StepperWrapper';
import TifCompare from '../../../components/TifCompare';
import ChooseList from '../../../components/ChooseList';
import {useStateValues} from "../state";
import {base64ToTiff} from '../../../shared/hooks/showImages';
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
    const steps = ['Load average bead', 'Calculate PSF', 'Save results'];
    const axiosStore = useAxiosStore();

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
                state.setBanner({ status: 'success', message: 'PSF computed successfully'});
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
                state.setBanner({ status: 'error', message: 'No extracted PSF found in the response.'});
            }
        } catch (error) {
            console.error('Error in PSF extraction:', error);
            state.setBanner({ status: 'error', message: 'Error in PSF extraction: ' + error.response.data.message});
        }
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
                            getProjections={true}
                            addProjections={state.setAverageBeadProjection}
                            isVoxel={false}
                            nameImage={'Averaged bead'}
                            makePreload={true}
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