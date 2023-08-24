import React, { useEffect } from 'react';
import { Button, TextField } from "@mui/material";
import StepperWrapper from '../../StepperWrapper';
import TifViewer from '../../../components/TifViewer';
import TifCompare from '../../../components/TifCompare';
import ChooseList from '../../../components/ChooseList';
import FileDownloader from '../../../components/FileDownloader';
import Dropzone from '../../../components/Dropzone';
import { useStateValues } from "../state";
import { base64ToTiff } from '../../../shared/hooks/showImages';
import useAxiosStore from '../../../app/store/axiosStore';
import './stepper.css';
import 'bootstrap/dist/css/bootstrap.min.css';


const StepperPSF = () => {
    const state = useStateValues();
    const steps = ['Load average bead', 'Calculate PSF', 'Save results'];
    const axiosStore = useAxiosStore();

    const handleGetAverageBead = async () => {
        try {
            const response = await axiosStore.getAverageBead();
            console.log('Response:', response);

            if (response.average_bead_show && response.average_bead_save) {
                const file = base64ToTiff(response.average_bead_save, 'image/tiff', `average_bead.tiff`);
                const newAverageBead = response.average_bead_show.map((base64Data, index) => {
                    return base64ToTiff(base64Data, 'image/tiff', `average_bead_${index}.tiff`);
                });
                state.setAverageBead(newAverageBead);
                state.setAverageBeadSave([file])
                state.setIsLoad(true);
                if (response.voxel) {
                    state.setVoxelX(response.voxel.X);
                    state.setVoxelY(response.voxel.Y);
                    state.setVoxelZ(response.voxel.Z);
                }    
            } else {
                console.log('No average bead data found in the response.');
            }
        } catch (error) {
            console.error('Error fetching average bead:', error);
        }
    };

    useEffect(() => {
        if (state.activeStep === 0) {
            handleGetAverageBead();
        }
    }, [state.activeStep]);

    const handlePSFExtract = async () => {
        console.log("Im tryin make psf extraction");

        try {
            const requestData = {
                beadSize: state.beadSize,
                iter: state.iter,
                regularization: state.regularization,
                deconvMethod: state.deconvMethods[state.deconvMethod]
            };

            const response = await axiosStore.postPSFExtract(requestData);
            console.log('Response:', response);

            if (response.extracted_psf_show) {
                const file = base64ToTiff(response.extracted_psf_save, 'image/tiff', `extracted_psf.tiff`);
                const newExtractPSF = response.extracted_psf_show.map((base64Data, index) => {
                    return base64ToTiff(base64Data, 'image/tiff', `extracted_psf_${index}.tiff`);
                });
                state.setExtractedPSF(newExtractPSF);
                state.setExtractedPSFSave([file]);
            } else {
                console.log('No extracted PSF found in the response.');
            }
        } catch (error) {
            console.error('Error in PSF extraction:', error);
            window.alert('Error in PSF extraction: ' + error);
        }
    };

    function getStepContent(step) {
        switch (step) {
            case 0:
                return (
                    <>
                        <div className="row">
                            <Dropzone files={state.averageBeadSave} addFiles={state.setAverageBeadSave} imageType={'averaged_bead'} state={state} />
                        </div>
                    </>);
            case 1:
                return (
                    <>
                        <div className="row">
                            <div className="column-1">
                                <div className="slider-container">
                                    <label htmlFor="scale-slider">Scale:</label>
                                    <input
                                        id="scale-slider"
                                        type="range"
                                        min="0.5"
                                        max="10"
                                        step="0.1"
                                        value={state.scale}
                                        onChange={(e) => state.handleScaleChange(e, 10)}
                                    />
                                </div>
                                <div className="box-parameters">
                                    <TextField
                                        id="beadSize"
                                        label="Bead size (micron)"
                                        variant="outlined"
                                        placeholder="Enter a bead size"
                                        fullWidth
                                        margin="normal"
                                        name="beadSize"
                                        onChange={(e) => state.setBeadSize(e.target.value)}
                                        value={state.beadSize}
                                    />
                                    <TextField
                                        id="iter"
                                        label="Iteration number"
                                        variant="outlined"
                                        placeholder="Enter an iteration number"
                                        fullWidth
                                        margin="normal"
                                        name="iter"
                                        onChange={(e) => state.setIter(e.target.value)}
                                        value={state.iter}
                                    />
                                    <TextField
                                        id="regularization"
                                        label="Regularization"
                                        variant="outlined"
                                        placeholder="Enter a regularization"
                                        fullWidth
                                        margin="normal"
                                        name="regularization"
                                        onChange={(e) => state.setRegularization(e.target.value)}
                                        value={state.regularization}
                                    />
                                    <ChooseList
                                        className="choose-list"
                                        name="Deconvolution method"
                                        list={Object.keys(state.deconvMethods)}
                                        selected={state.deconvMethod}
                                        onChange={state.handleDeconvMethodChange}
                                    />
                                </div>

                                <Button variant="outlined" color="secondary" className="btn-run" onClick={handlePSFExtract}>
                                    Calculate PSF
                                </Button>
                            </div>
                            <div className="column-2">
                                <div className="images__preview">
                                    <TifCompare img_1={state.averageBead} img_2={state.extractedPSF} scale={state.scale} state={state} />
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 2:
                return (
                    <>
                        <div className="row">
                            <div className="column-1" style={{ zIndex: 2 }}>
                                <div className="slider-container">
                                    <label htmlFor="scale-slider">Scale:</label>
                                    <input id="scale-slider" type="range" min="0.5" max="10" step="0.1" value={state.scale} onChange={state.handleScaleChange} />
                                    <label htmlFor="layer-slider">Layer:</label>
                                    <input
                                        id="layer-slider"
                                        type="range"
                                        min="0"
                                        max={state.extractedPSF.length - 1}
                                        step="1"
                                        value={state.layer2}
                                        onChange={(e) => state.handleLayer2Change(e, state.extractedPSF.length - 1)}
                                    />
                                </div>
                                <TextField
                                    id="filename"
                                    label="Filename"
                                    variant="outlined"
                                    placeholder="Enter a file name"
                                    fullWidth
                                    margin="normal"
                                    name="filename"
                                    onChange={(e) => state.setFilename(e.target.value)}
                                    value={state.filename}
                                />
                                <FileDownloader fileList={state.extractedPSFSave} folderName={state.filename} btnName={"Save result"} />
                            </div>
                            <div className="column-2" style={{ zIndex: 1 }}>
                                <div className="images__preview">
                                    <TifViewer
                                        img={state.extractedPSF[state.layer2]}
                                        scale={state.scale}
                                        brightness={state.brightness}
                                    />
                                </div>
                            </div>
                        </div>
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