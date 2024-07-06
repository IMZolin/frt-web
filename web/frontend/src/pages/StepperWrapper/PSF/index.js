import React, {useEffect, useState} from 'react';
import {Button, TextField} from "@mui/material";
import StepperWrapper from '../../StepperWrapper';
import TifViewer from '../../../components/TifViewer';
import TifCompare from '../../../components/TifCompare';
import ChooseList from '../../../components/ChooseList';
import FileDownloader from '../../../components/FileDownloader';
import Dropzone from '../../../components/Dropzone';
import {useStateValues} from "../state";
import {base64ToTiff} from '../../../shared/hooks/showImages';
import {hexToRgb} from '../../../shared/hooks/showImages';
import useAxiosStore from '../../../app/store/axiosStore';
import './stepper.css';
import 'bootstrap/dist/css/bootstrap.min.css';


const StepperPSF = ({darkMode}) => {
    const state = useStateValues();
    const steps = ['Load average bead', 'Calculate PSF', 'Save results'];
    const axiosStore = useAxiosStore();

    useEffect(() => {
    if (darkMode) {
        state.setCustomTextColor(getComputedStyle(document.documentElement).getPropertyValue('--text-color-dark'));
        state.setCustomBorder(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-dark'));
        state.setCustomBorder2(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-dark2'));
    } else {
        state.setCustomTextColor(getComputedStyle(document.documentElement).getPropertyValue('--text-color-light'));
        state.setCustomBorder(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-light'));
        state.setCustomBorder2(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-light2'));
    }
    }, [darkMode]);

    const handleGetAverageBead = async () => {
        try {
            const response = await axiosStore.getData('avg_bead');
            console.log('Response:', response);

            if (response.image_show && response.projections) {
                // const file = base64ToTiff(response.image_save, 'image/tiff', `average_bead.tiff`);
                const newAverageBead = response.image_show.map((base64Data, index) => {
                    return base64ToTiff(base64Data, 'image/tiff', `avg_bead_${index}.tiff`);
                });
                const newProjection = response.projections.map((base64Data, index) => {
                    return base64ToTiff(base64Data, 'image/tiff', `avg_bead_xyz_${index}.tiff`);
                });
                state.setAverageBeadProjection(newProjection);
                state.setAverageBead(newAverageBead);
                // state.setAverageBeadSave([file]);
                state.setIsLoad(true);
            } else {
                console.log('No average bead data found in the response.');
                window.alert('No average bead data found in the response.');
            }
        } catch (error) {
            console.error('Error fetching average bead:', error);
            if (error.response && error.response.data && error.response.data.message) {
                window.alert('Error in PSF extraction: ' + error.response.data.message);
            } else {
                window.alert('Error in PSF extraction: ' + error.message);
            }
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
                // const file = base64ToTiff(response.image_save, 'image/tiff', `psf.tif`);
                const newExtractPSF = response.image_show.map((base64Data, index) => {
                    return base64ToTiff(base64Data, 'image/tiff', `psf_${index}.tiff`);
                });
                const newProjection = response.projections.map((base64Data, index) => {
                    return base64ToTiff(base64Data, 'image/tiff', `psf_xyz_${index}.tif`);
                });
                state.setExtractedPSFProjection(newProjection);
                state.setExtractedPSF(newExtractPSF);
                // state.setExtractedPSFSave([file]);
            } else {
                console.log('No extracted PSF found in the response.');
                window.alert('No extracted PSF found in the response.');
            }
        } catch (error) {
            console.error('Error in PSF extraction:', error);
            window.alert('Error in PSF extraction: ' + error.response.data.message);
        }
    };

    function getStepContent(step) {
        switch (step) {
            case steps.indexOf('Load average bead'):
                return (
                    <>
                        <div className="row">
                            <Dropzone
                                files={state.files}
                                addFiles={state.addFiles}
                                setFiles={state.setAverageBead}
                                addMultiFile={state.averageBeadSave}
                                addProjections={state.setAverageBeadSave}
                                imageType={'avg_bead'}
                                state={state}
                                isSaveImage={true}
                            />
                        </div>
                    </>);
            case steps.indexOf('Calculate PSF'):
                return (
                    <>
                        <div className="row">
                            <div className="column-1" style={{zIndex: 2, border: `1px solid ${state.customBorder}`}}>
                                <div className="slider-container">
                                    <div>
                                        <label htmlFor="layer-slider" style={{fontSize: "16px"}}>Layer:</label><br/>
                                        <input
                                            id="layer-slider"
                                            type="range"
                                            min="0"
                                            max={state.averageBead.length - 1}
                                            step="1"
                                            value={state.layer}
                                            onChange={(e) => state.handleLayerChange(e, state.averageBead.length - 1)}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="scale-slider" style={{fontSize: "16px"}}>Scale:</label><br/>
                                        <input
                                            id="scale-slider"
                                            type="range"
                                            min="3"
                                            max="7"
                                            step="0.1"
                                            value={state.scale}
                                            onChange={(e) => state.handleScaleChange(e, 7)}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="brightness-slider"
                                               style={{fontSize: "16px"}}>Brightness:</label><br/>
                                        <input
                                            id="brightness-slider"
                                            type="range"
                                            min="1"
                                            max="3"
                                            step="0.01"
                                            value={state.levelBrightness}
                                            onChange={state.handleSliderBrightnessChange}
                                        />
                                    </div>
                                </div>
                                <div className="box-parameters">
                                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
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
                                            sx={{
                                                border: `1px solid rgba(${hexToRgb(state.customTextColor)}, 0.3)`,
                                                borderRadius: '5px',
                                                '& .MuiInputLabel-outlined': {
                                                    whiteSpace: 'normal',
                                                    overflow: 'visible',
                                                    textOverflow: 'unset'
                                                },
                                                marginRight: '5px'
                                            }}
                                            InputLabelProps={{
                                                sx: {
                                                    color: state.customTextColor,
                                                    textTransform: 'capitalize',
                                                },
                                            }}
                                            inputProps={{
                                                style: {color: state.customTextColor},
                                            }}
                                        />
                                        <TextField
                                            id="zoom"
                                            label="Zoom factor"
                                            variant="outlined"
                                            placeholder="Enter an zoom factor"
                                            fullWidth
                                            margin="normal"
                                            name="zoom"
                                            onChange={(e) => state.setZoomFactor(e.target.value)}
                                            value={state.zoomFactor}
                                            sx={{
                                                border: `1px solid rgba(${hexToRgb(state.customTextColor)}, 0.3)`,
                                                borderRadius: '5px',
                                                '& .MuiInputLabel-outlined': {
                                                    whiteSpace: 'normal',
                                                    overflow: 'visible',
                                                    textOverflow: 'unset'
                                                }
                                            }}
                                            InputLabelProps={{
                                                sx: {
                                                    color: state.customTextColor,
                                                    textTransform: 'capitalize',
                                                },
                                            }}
                                            inputProps={{
                                                style: {color: state.customTextColor},
                                            }}
                                        />
                                    </div>
                                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                        <TextField
                                            id="iter"
                                            label="Iterations"
                                            variant="outlined"
                                            placeholder="Enter an iteration number"
                                            fullWidth
                                            margin="normal"
                                            name="iter"
                                            onChange={(e) => state.setIter(e.target.value)}
                                            value={state.iter}
                                            sx={{
                                                border: `1px solid rgba(${hexToRgb(state.customTextColor)}, 0.3)`,
                                                borderRadius: '5px',
                                                '& .MuiInputLabel-outlined': {
                                                    whiteSpace: 'normal',
                                                    overflow: 'visible',
                                                    textOverflow: 'unset'
                                                },
                                                marginRight: '5px'
                                            }}
                                            InputLabelProps={{
                                                sx: {
                                                    color: state.customTextColor,
                                                    textTransform: 'capitalize',
                                                    paddingY: '2px'
                                                },
                                            }}
                                            inputProps={{
                                                style: {color: state.customTextColor},
                                            }}
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
                                            sx={{
                                                border: `1px solid rgba(${hexToRgb(state.customTextColor)}, 0.3)`,
                                                borderRadius: '5px',
                                                '& .MuiInputLabel-outlined': {
                                                    whiteSpace: 'normal',
                                                    overflow: 'visible',
                                                    textOverflow: 'unset',
                                                }
                                            }}
                                            InputLabelProps={{
                                                sx: {
                                                    color: state.customTextColor,
                                                    textTransform: 'capitalize',
                                                },
                                            }}
                                            inputProps={{
                                                style: {color: state.customTextColor},
                                            }}
                                        />
                                    </div>
                                    <ChooseList
                                        className="choose-list"
                                        name="Deconvolution method"
                                        list={Object.keys(state.deconvMethods)}
                                        selected={state.deconvMethod}
                                        onChange={state.handleDeconvMethodChange}
                                        customTextColor={state.customTextColor}
                                    />
                                </div>
                                <Button
                                    variant="contained"
                                    style={{
                                        backgroundColor: state.customBorder2,
                                        padding: "12px 12px",
                                        fontSize: "14px",
                                        marginTop: "5px"
                                    }}
                                    className="btn-run"
                                    onClick={handlePSFCalculate}
                                >
                                    Calculate PSF
                                </Button>
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
                        <div className="row">
                            <div className="column-1" style={{zIndex: 2, border: `1px solid ${state.customBorder}`}}>
                                <div className="slider-container">
                                    <div>
                                        <label htmlFor="layer-slider" style={{fontSize: "16px"}}>Layer:</label><br/>
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
                                    <div>
                                        <label htmlFor="scale-slider" style={{fontSize: "16px"}}>Scale:</label><br/>
                                        <input
                                            id="scale-slider"
                                            type="range"
                                            min="3"
                                            max="7"
                                            step="0.1"
                                            value={state.scale}
                                            onChange={(e) => state.handleScaleChange(e, 7)}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="brightness-slider" style={{fontSize: "16px"}}>Brightness:</label><br/>
                                        <input
                                            id="brightness-slider"
                                            type="range"
                                            min="1"
                                            max="3"
                                            step="0.01"
                                            value={state.levelBrightness}
                                            onChange={state.handleSliderBrightnessChange}
                                        />
                                    </div>
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
                                    sx={{
                                        border: `1px solid rgba(${hexToRgb(state.customTextColor)}, 0.2)`,
                                        borderRadius: '5px',
                                        marginTop: '10px'
                                    }}
                                    InputLabelProps={{
                                        sx: {
                                            color: state.customTextColor,
                                            textTransform: 'capitalize',
                                        },
                                    }}
                                    inputProps={{
                                        style: {color: state.customTextColor},
                                    }}
                                />
                                <FileDownloader
                                    fileList={state.extractedPSFSave}
                                    folderName={state.filename}
                                    btnName={"Save result"}
                                    customBorder={state.customBorder}
                                />
                            </div>
                            <div className="column-2" style={{zIndex: 1}}>
                                <div className="images__preview" style={{marginTop: '-60px'}}>
                                    <TifViewer
                                        img={state.extractedPSF[state.layer2]}
                                        scale={state.scale}
                                        brightness={state.levelBrightness}
                                        imageProjection={state.extractedPSFProjection[0]}
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
                darkMode={darkMode}
            />
        </div>
    );
};
export default StepperPSF;