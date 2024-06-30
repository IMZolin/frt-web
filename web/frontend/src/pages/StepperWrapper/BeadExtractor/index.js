import React, {useRef, useState, useEffect} from 'react';
import {Button, TextField, collapseClasses} from '@mui/material';
import StepperWrapper from '../../StepperWrapper';
import TifViewer from '../../../components/TifViewer';
import TifCompare from '../../../components/TifCompare';
import TiffExtractor from '../../../components/TiffExtractor';
import useBeadMark from '../../../components/TiffExtractor/hook';
import Dropzone from '../../../components/Dropzone';
import FileDownloader from '../../../components/FileDownloader';
import {useStateValues} from '../state';
import {base64ToTiff} from '../../../shared/hooks/showImages';
import {hexToRgb} from '../../../shared/hooks/showImages';
import ChooseList from '../../../components/ChooseList';
import useAxiosStore from '../../../app/store/axiosStore';
import './stepper.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const BeadExtractor = ({darkMode}) => {
    const state = useStateValues();
    const steps = ['Load beads', 'Segment & average beads', 'Save results'];
    const axiosStore = useAxiosStore();
    const canvasRef = useRef();
    const markBead = useBeadMark();

    useEffect(() => {
        if (darkMode) {
            state.setCustomTextColor(getComputedStyle(document.documentElement).getPropertyValue('--text-color-dark'));
            state.setCustomBorder(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-dark'));
        } else {
            state.setCustomTextColor(getComputedStyle(document.documentElement).getPropertyValue('--text-color-light'));
            state.setCustomBorder(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-light'));
        }
    }, [darkMode]);

    const handleBeadMark = async () => {
        try {
            if (state.centerExtractBeads.length > 0) {
                for (const beadCoords of state.centerExtractBeads) {
                    await state.handleAllDrawClick(canvasRef, beadCoords.x, beadCoords.y, markBead);
                }
            } else {
                console.log('No beads to mark.');
            }
        } catch (error) {
            console.error('Error in Bead Mark:', error);
            window.alert('Error in Bead Mark: ', error.response);
        }
    };
    useEffect(() => {
        if (state.activeStep === 1) {
            handleBeadMark();
        }
    }, [state.activeStep]);

    const handleBeadExtract = async () => {
        try {
            const beadCoordsStr = state.centerExtractBeads.map(({x, y}) => `[${x}, ${y}]`).join(', ');

            const requestData = {
                select_size: state.selectSize,
                bead_coords: `[${beadCoordsStr}]`,
            };

            const response = await axiosStore.postBeadExtract(requestData);
            console.log('Response:', response);
            if (response.extracted_beads) {
                const newExtractBeads = response.extracted_beads.map((base64Data, index) => {
                    return base64ToTiff(base64Data, 'image/tiff', `extracted_bead_${index}.tiff`);
                });

                state.setExtractBeads(newExtractBeads);
                console.log(state.extractBeads);
                window.alert(`Beads extracting successfully: ${response.extracted_beads.length} beads`);
            } else {
                console.log('No extracted beads found in the response.');
                window.alert('No extracted beads found in the response.');
            }
        } catch (error) {
            console.error('Error in Bead extraction: ', error);
            window.alert('Error in Bead extraction: ' + error.response);
        }
    };

    const handleBeadAverage = async () => {
        try {
            const requestData = {
                denoise_type: state.denoiseType,
            };

            const response = await axiosStore.calcAverageBead(requestData);
            console.log('Response:', response);
            if (response.image_show) {
                const file = base64ToTiff(response.image_save, 'image/tiff', `average_bead.tiff`);
                const newAverageBead = response.image_show.map((base64Data, index) => {
                    return base64ToTiff(base64Data, 'image/tiff', `average_bead_${index}.tiff`);
                });
                state.setAverageBead(newAverageBead);
                state.setAverageBeadSave([file]);
                if (response.projections) {
                    const newProjection = response.projections.map((base64Data, index) => {
                        return base64ToTiff(base64Data, 'image/tiff', `avg_bead_xyz_${index}.tiff`);
                    });
                    state.setAverageBeadProjection(newProjection);
                    console.log(response.projections);
                } else {
                    console.log('No average bead projection found in the response.');
                    window.alert('No average bead projection found in the response.');
                }
            } else {
                console.log('No average bead found in the response.');
                window.alert('No average bead found in the response.');
            }
        } catch (error) {
            console.error('Error in Bead Average:', error);
            window.alert('Error in Bead Average: ' + error.response);
        }
    };

    const handleBeadAutosegment = async () => {
        try {
            const requestData = {
                max_area: state.maxArea,
            };
            const response = await axiosStore.getAutosegmentBeads(requestData);
            console.log('Response:', response);
            if (response.bead_coords) {

            } else {
                console.log('No bead coordinates found in the response.');
                window.alert('No bead coordinates found in the response.');
            }
        } catch (error) {
            console.error('Error in Bead Autosegmentation:', error);
            window.alert('Error in Bead Autosegmentation: ' + error.response);
        }
    };

    function getStepContent(step) {
        switch (step) {
            case steps.indexOf('Load beads'):
                return (
                    <>
                        <div className="row">
                            <div className="column-1" style={{zIndex: 2, border: `1px solid ${state.customBorder}`}}>
                                <div className="subtitle">Voxel size:</div>
                                <div className="voxel-box">
                                    <TextField
                                        className="stepper-resolution"
                                        id="resolution-x"
                                        label="Resolution-XY (micron)"
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
                                        label="Resolution-Z (micron)"
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
                                    setFiles={state.setBeads}
                                    addMultiFile={null}
                                    addProjections={null}
                                    imageType={'beads_image'}
                                    state={state}
                                    isSaveImage={false}
                                    isProjections={false}
                                />
                            </div>
                        </div>
                    </>
                );
            case steps.indexOf('Segment & average beads'):
                return (
                    <>
                        <div className="row">
                            <div className="column-1"
                                 style={{marginTop: '-10px', border: `1px solid ${state.customBorder}`}}>
                                <div className="slider-container">
                                    <div>
                                        <label htmlFor="layer-slider">Layer:</label><br/>
                                        <input
                                            id="layer-slider"
                                            type="range"
                                            min="0"
                                            max={state.beads.length - 1}
                                            step="1"
                                            value={state.layer}
                                            onChange={(e) => state.handleLayerChange(e, state.beads.length - 1)}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="brightness-slider">Brightness:</label>
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
                                    <div>
                                        <label className="subtitle" htmlFor="select-size">Selection Size (px):</label>
                                        <TextField
                                            id="select-size"
                                            variant="outlined"
                                            className="stepper-resolution"
                                            placeholder="Enter a select size"
                                            fullWidth
                                            name="selectSize"
                                            margin="normal"
                                            onChange={(e) => state.setSelectSize(e.target.value)}
                                            value={state.selectSize}
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
                                <div className="button-row"
                                     style={{display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px'}}>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        className="btn-run"
                                        onClick={(e) => state.handleUndoMark(e, canvasRef)}
                                    >
                                        Undo mark
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        className="btn-run"
                                        onClick={(e) => state.handleClearMarks(e, canvasRef)}
                                    >
                                        Clear all marks
                                    </Button>
                                </div>
                                <Button
                                    variant="contained"
                                    color="success"
                                    className="btn-run"
                                    onClick={handleBeadAutosegment}
                                >
                                    Auto-segment beads
                                </Button>
                                <ChooseList
                                    className="choose-list"
                                    name="Blur type"
                                    list={state.denoiseTypes}
                                    selected={state.denoiseType}
                                    onChange={state.handleDenoiseTypeChange}
                                    customTextColor={state.customTextColor}
                                />
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    className="btn-run"
                                    onClick={handleBeadAverage}
                                >
                                    Average beads
                                </Button>
                            </div>
                            <div className="column-2" style={{zIndex: 1, marginLeft: '20px', marginTop: '-10px'}}>
                                <div className="images__preview">
                                    <TiffExtractor
                                        img={state.beads[state.layer]}
                                        scale={1}
                                        state={state}
                                        canvasRef={canvasRef}
                                        customBorder={state.customBorder}
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
                                        <label htmlFor="layer-slider">Layer:</label><br/>
                                        <input
                                            id="layer-slider"
                                            type="range"
                                            min="0"
                                            max={state.averageBead.length - 1}
                                            step="1"
                                            value={state.layer2}
                                            onChange={(e) => state.handleLayer2Change(e, state.averageBead.length - 1)}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="scale-slider">Scale:</label><br/>
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
                                <FileDownloader
                                    fileList={state.averageBeadSave}
                                    folderName={state.filename}
                                    btnName={"Save result"}
                                />
                            </div>
                            <div className="column-2" style={{zIndex: 1}}>
                                <div className="images__preview" style={{marginRight: '110px', marginTop: '-60px'}}>
                                    <TifViewer
                                        img={state.averageBead[state.layer2]}
                                        scale={state.scale}
                                        brightness={state.levelBrightness}
                                        imageProjection={state.averageBeadProjection[0]}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                );
            default:
                return "unknown step";
        }
    }

    return (
        <div>
            <StepperWrapper
                name="Bead extraction"
                stepContent={getStepContent}
                steps={steps}
                handleNextStep={state.handleNextStep}
                handlePrevStep={state.handlePrevStep}
                activeStep={state.activeStep}
                isLoad={state.isLoad}
                urlPage='/psf'
                typeRun='PSF'
                darkMode={darkMode}
            />
        </div>
    );
};

export default BeadExtractor;
