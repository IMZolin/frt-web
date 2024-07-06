import React, { useEffect, useState } from 'react';
import { Button, TextField } from "@mui/material";
import StepperWrapper from '..';
import Dropzone from '../../../components/Dropzone';
import TifCompare from '../../../components/TifCompare';
import TifCompare2 from '../../../components/TifCompare2';
import TifViewer from '../../../components/TifViewer';
import FileDownloader from '../../../components/FileDownloader';
import { useStateValues } from "../state";
import { base64ToTiff } from '../../../shared/hooks/showImages';
import { hexToRgb } from '../../../shared/hooks/showImages';
import useAxiosStore from '../../../app/store/axiosStore';
import ChooseList from '../../../components/ChooseList';

import 'bootstrap/dist/css/bootstrap.min.css';

const Deconvolution = ({darkMode}) => {
  const state = useStateValues();
  const steps = ['Load PSF', 'Load image', 'Preprocessing', 'Deconvolution', 'Save results'];
  const axiosStore = useAxiosStore();
  
  useEffect(() => {
    if (darkMode) {
      state.setCustomTextColor(getComputedStyle(document.documentElement).getPropertyValue('--text-color-dark'));
      state.setCustomBorder(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-dark'));
    } else {
      state.setCustomTextColor(getComputedStyle(document.documentElement).getPropertyValue('--text-color-light'));
      state.setCustomBorder(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-light'));
    }
  }, [darkMode]);

  const handleGetPSF = async () => {
    try {
      const response = await axiosStore.getData('psf');
      console.log('Response:', response);

      if (response.image_show) {
        // const file = base64ToTiff(response.psf_save, 'image/tiff', `extracted_psf.tiff`);
        const newExtractPSF = response.image_show.map((base64Data, index) => {
          return base64ToTiff(base64Data, 'image/tiff', `psf_${index}.tiff`);
        });
        const projection = response.projections.map((base64Data, index) => {
          return base64ToTiff(base64Data, 'image/tiff', `psf_xyz_${index}.tiff`);
        });
        state.setExtractedPSFProjection(projection);
        state.setExtractedPSF(newExtractPSF);
        // state.setExtractedPSFSave([file]);
        state.setIsLoad(true);
        // state.setResolution2(response.resolution);
      } else {
        console.log('No psf data found in the response.');
        window.alert('No psf data found in the response.');
      }
    } catch (error) {
      console.error('Error fetching psf:', error);
      window.alert('Error fetching psf:', error);
    }
  };

  const handleGetVoxel = async () => {
    try {
      const response = await axiosStore.getVoxel();
      console.log('Response:', response);

      if (response.voxel) {
        state.setVoxelZ(response.voxel[0]);
        state.setVoxelXY(response.voxel[1]);
      } else {
        console.log('No voxel data found in the response.');
        window.alert('No voxel data found in the response.');
      }
    } catch (error) {
      console.error('Error fetching voxel:', error);
      window.alert('Error fetching voxel:', error);
    }
  };

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

  useEffect(() => {
    if (state.activeStep === 0) {
      handleGetPSF();
    }
    else if (state.activeStep === 1) {
      handleGetVoxel();
    }
  }, [state.activeStep]);

  const handleDeconvolve = async () => {
    console.log("Im trying make deconvolve");
    // window.alert("Im trying make deconvolve");
    try {
      const requestData = {
        iterations: state.iter,
        regularization: state.regularization,
        decon_method: state.deconvMethods[state.deconvMethod]
      };

      const response = await axiosStore.rlDeconImage(requestData);
      console.log('Response:', response);

      if (response.image_show) {
        // const file = base64ToTiff(response.deconv_save, 'image/tiff', `result_deconv.tiff`);
        const newResult = response.deconv_show.map((base64Data, index) => {
          return base64ToTiff(base64Data, 'image/tiff', `rl_decon_img_${index}.tiff`);
        });
        // const newProjection = response.img_projection.map((base64Data, index) => {
        //   return base64ToTiff(base64Data, 'image/tiff', `result_deconv_xyz_${index}.tiff`);
        // });
        // state.setResultImageProjection(newProjection);
        state.setResultImage(newResult);
        console.log(newResult);
        // state.setResultImageSave([file]);
      } else {
        console.log('No deconvolution result found in the response.');
        window.alert('No deconvolution result found in the response.');
      }
    } catch (error) {
      console.error('Error in Deconvolution:', error);
      window.alert('Error in Deconvolution: ' + error);
    }
  };

  function getStepContent(step) {
    switch (step) {
      case steps.indexOf('Load PSF'):
        return (<>
          <div className="row">
            <Dropzone
                files={state.files}
                addFiles={state.addFiles}
                setFiles={state.extractedPSF}
                isProjections={true}
                addProjections={state.extractedPSFProjection}
                imageType={'psf'}
                state={state}
                darkMode={darkMode}
            />
          </div>
        </>);
      case steps.indexOf('Load image'):
        return (
          <>
            <div className="row">
              <div className="column-1" style={{ zIndex: 2, border: `1px solid ${state.customBorder}`}}>
                <div className="slider-container">
                  {state.sourceImage.length === state.extractedPSF.length && (
                    <>
                      <label htmlFor="layer-slider">Layer:</label><br />
                      <input
                        id="layer-slider"
                        type="range"
                        min="0"
                        max={state.extractedPSF.length - 1}
                        step="1"
                        value={state.layer}
                        onChange={(e) => state.handleLayerChange(e, state.extractedPSF.length - 1)}
                      />
                    </>
                  )}<br />
                  <div>
                    <label htmlFor="scale-slider">Scale:</label><br />
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
                    <label htmlFor="brightness-slider">Brightness:</label><br />
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
                <Dropzone 
                  files={state.sourceImageSave} 
                  addFiles={state.setSourceImageSave} 
                  imageType={'source_img'} 
                  state={state} 
                />
              </div>
              <div className="column-2">
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
                    layerColor={state.customTextColor}
                  />
                </div>
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
                                        name="Denoise type"
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
                    <Button
                        variant="contained"
                        style={{
                            backgroundColor: state.customBorder,
                            padding: "12px 12px",
                            fontSize: "14px",
                            marginTop: "5px"
                        }}
                        className="btn-run"
                        disabled={!(state.sourceImage.length == 0 || state.extractedPSF.length)}
                        onClick={handleDeconvolve}
                    >
                        Deconvolve
                    </Button>
                </div>
                <div className="column-2" style={{zIndex: 1}}>
                    <div className="images__preview">
                        <TifCompare2
                            img_1={state.sourceImage}
                            img_2={null}
                            img_3={state.resultImage}
                            img_1_projection={null}
                            img_2_projection={state.extractedPSFProjection[0]}
                            img_3_projection={null}
                            scale={state.scale}
                            state={state}
                            isSameLength={state.sourceImage.length === state.extractedPSF.lengt}
                            type='deconvolution-2'
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
                                        max={state.resultImage.length - 1}
                                        step="1"
                                        value={state.layer2}
                                        onChange={(e) => state.handleLayer2Change(e, state.resultImage.length - 1)}
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
                    brightness={state.levelBrightness}
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
        name="Richardson–Lucy deconvolution"
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

export default Deconvolution;
