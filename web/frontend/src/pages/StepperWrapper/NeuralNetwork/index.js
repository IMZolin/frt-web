import React, {useEffect, useState} from 'react';
import {Button, TextField} from '@mui/material';
import StepperWrapper from '..';
import TifCompare from '../../../components/TifCompare';
import TifViewer from '../../../components/TifViewer';
import Dropzone from '../../../components/Dropzone';
import {useStateValues} from "../state";
import useAxiosStore from '../../../app/store/axiosStore';
import {base64ToTiff} from '../../../shared/hooks/showImages';
import {hexToRgb} from '../../../shared/hooks/showImages';
import ChooseList from '../../../components/ChooseList';
import FileDownloader from '../../../components/FileDownloader';
import '../stepper.css';
import PreprocessStep from "../../../components/SpecificStep/Preprocesser/PreprocessStep";
import ImageLoader from "../../../components/SpecificStep/ImageLoader/ImageLoader";
import Downloader from "../../../components/SpecificStep/Downloader/Downloader";

const NeuralNetwork = ({darkMode}) => {
    const state = useStateValues();
    const steps = ['Load image', 'Preprocessing', 'Deconvolution', 'Save results'];
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
    const handlePreprocessing = async () => {
        console.log("Im trying make preprocessing");
        // window.alert("Im trying make preprocessing");
        try {
            const requestData = {
                denoise_type: state.denoiseType
            };
            console.log(requestData);

            const response = await axiosStore.preprocessImage(requestData);
            console.log('Response:', response);

            if (response.image_show) {
                // const file = base64ToTiff(response.preproc_save, 'image/tiff', `result_preproc.tiff`);
                const preprocessedImage = response.image_show.map((base64Data, index) => {
                    return base64ToTiff(base64Data, 'image/tiff', `result_preproc_${index}.tiff`);
                });
                state.setPreprocImage(preprocessedImage);
                // state.setPreprocImageSave([file]);
            } else {
                console.log('No preprocessing result found in the response.');
                window.alert('No preprocessing result found in the response.');
            }
        } catch (error) {
            console.error('Error in preprocessing:', error);
            window.alert('Error in preprocessing: ' + error);
        }
    };

    const handleCNNDeconvolution = async () => {
        console.log("Im trying make deconvolution");
        try {

            const response = await axiosStore.cnnDeconImage();
            console.log('Response:', response);

            if (response.image_show) {
                // const file = base64ToTiff(response.deconv_save, 'image/tiff', `result_deconv.tiff`);
                const cnnDeconImage = response.image_show.map((base64Data, index) => {
                    return base64ToTiff(base64Data, 'image/tiff', `cnn_decon_img_${index}.tiff`);
                });
                state.setResultImage(cnnDeconImage);
                // state.setResultImageSave([file]);
            } else {
                console.log('No cnn deconvolution result found in the response.');
                window.alert('No cnn deconvolution result found in the response.');
            }
        } catch (error) {
            console.error('Error in cnn deconvolution:', error);
            window.alert('Error in cnn deconvolution: ' + error);
        }
    };

    function getStepContent(step) {
        switch (step) {
            case steps.indexOf('Load image'):
                return (
                    <>
                        <div className="row">
                            <div className="column-1" style={{zIndex: 2, border: `1px solid ${state.customBorder}`}}>
                                <div className="subtitle">Voxel size:</div>
                                <div className="voxel-box">
                                    <TextField
                                        className="stepper-resolution"
                                        id="resolution-x"
                                        label="Voxel-XY (micron)"
                                        variant="outlined"
                                        placeholder="Enter the resolution in X and Y direction"
                                        fullWidth
                                        margin="normal"
                                        onChange={(e) => state.setVoxelXY(e.target.value)}
                                        value={state.voxelXY}
                                        sx={{
                                            border: `1px solid rgba(${hexToRgb(state.customTextColor)}, 0.3)`,
                                            borderRadius: '5px',
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
                                        className="stepper-resolution"
                                        id="resolution-z"
                                        label="Voxel-Z (micron)"
                                        variant="outlined"
                                        placeholder="Enter the resolution in Z direction"
                                        fullWidth
                                        margin="normal"
                                        onChange={(e) => state.setVoxelZ(e.target.value)}
                                        value={state.voxelZ}
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
                                </div>
                            </div>
                            <div className="column-2" style={{zIndex: 1}}>
                                <Dropzone
                                    files={state.files}
                                    addFiles={state.addFiles}
                                    setFiles={state.setSourceImage}
                                    addProjections={null}
                                    imageType={'source_img'}
                                    state={state}
                                    darkMode={darkMode}
                                />
                            </div>
                        </div>
                    </>
                );
            case steps.indexOf('Preprocessing'):
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
                                            max={state.sourceImage.length - 1}
                                            step="1"
                                            value={state.layer}
                                            onChange={(e) => state.handleLayerChange(e, state.sourceImage.length - 1)}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="scale-slider" style={{fontSize: "16px"}}>Scale:</label><br/>
                                        <input
                                            id="scale-slider"
                                            type="range"
                                            min="0.5"
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
                                <div className="box-parameters">
                                    <ChooseList
                                        className="choose-list"
                                        name="Blur type"
                                        list={state.denoiseTypes}
                                        selected={state.denoiseType}
                                        onChange={state.handleDenoiseTypeChange}
                                        customTextColor={state.customTextColor}
                                    />
                                </div>
                                <Button
                                    variant="contained"
                                    style={{
                                        backgroundColor: state.customBorder,
                                        padding: "12px 12px",
                                        fontSize: "14px",
                                        marginTop: "5px"
                                    }}
                                    className="btn-run"
                                    onClick={handlePreprocessing}
                                >
                                    Make preprocessing
                                </Button>
                            </div>
                            <div className="column-2">
                                <div className="images__preview">
                                    <TifCompare
                                        img_1={state.sourceImage}
                                        img_2={state.preprocImage}
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
            case steps.indexOf('Deconvolution'):
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
                                            max={state.sourceImage.length - 1}
                                            step="1"
                                            value={state.layer}
                                            onChange={(e) => state.handleLayerChange(e, state.sourceImage.length - 1)}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="scale-slider" style={{fontSize: "16px"}}>Scale:</label><br/>
                                        <input
                                            id="scale-slider"
                                            type="range"
                                            min="0.5"
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
                                <Button
                                    variant="contained"
                                    style={{
                                        backgroundColor: state.customBorder2,
                                        padding: "12px 12px",
                                        fontSize: "14px",
                                        marginTop: "5px"
                                        }}
                                    className="btn-run"
                                    onClick={handleCNNDeconvolution}
                                >
                                    Deconvolve
                                </Button>
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
                        <div className="row">
                            <div className="column-1">
                                <div className="slider-container">
                                    <div>
                                        <label htmlFor="layer-slider">Layer:</label><br/>
                                        <input
                                            id="layer-slider"
                                            type="range"
                                            min="0"
                                            max={state.resultImageSave.length - 1}
                                            step="1"
                                            value={state.layer2}
                                            onChange={(e) => state.handleLayer2Change(e, state.resultImage.length - 1)}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="scale-slider">Scale:</label><br/>
                                        <input
                                            id="scale-slider"
                                            type="range"
                                            min="0.5"
                                            max="7"
                                            step="0.1"
                                            value={state.scale}
                                            onChange={(e) => state.handleScaleChange(e, 7)}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="brightness-slider">Brightness:</label><br/>
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
                                    style={{color: state.customTextColor}}
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
                                    fileList={state.resultImageSave}
                                    folderName={state.filename}
                                    btnName={"Save result"}
                                    customBorder={state.customBorder}
                                />
                            </div>
                            <div className="column-2" style={{zIndex: 1}}>
                                <div className="images__preview" style={{marginTop: '100px', marginRight: '50px'}}>
                                    <TifViewer
                                        img={state.resultImage[state.layer2]}
                                        scale={0.5 * state.scale}
                                        brightness={state.brightness}
                                        imageProjection={null}
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
                name="CNN deconvolution"
                stepContent={getStepContent}
                steps={steps}
                handleNextStep={state.handleNextStep}
                handlePrevStep={state.handlePrevStep}
                activeStep={state.activeStep}
                isLoad={state.isLoad}
                typeRun={null}
                darkMode={darkMode}
            />
        </div>
    );
};

export default NeuralNetwork;
