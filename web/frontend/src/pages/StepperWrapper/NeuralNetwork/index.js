import React, { useEffect, useState } from 'react';
import { Button, TextField } from '@mui/material';
import StepperWrapper from '..';
import TifCompare from '../../../components/TifCompare';
import TifViewer from '../../../components/TifViewer';
import Dropzone from '../../../components/Dropzone';
import { useStateValues } from "../state";
import useAxiosStore from '../../../app/store/axiosStore';
import { base64ToTiff } from '../../../shared/hooks/showImages';
import { hexToRgb } from '../../../shared/hooks/showImages';
import ChooseList from '../../../components/ChooseList';
import FileDownloader from '../../../components/FileDownloader';
import '../stepper.css';

const NeuralNetwork = ({darkMode}) => {
  const state = useStateValues();
  const steps = ['Load image', 'Preprocessing', 'Deconvolution', 'Save results'];
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
  const handlePreprocessing = async () => {
    console.log("Im trying make preprocessing");
    window.alert("Im trying make preprocessing");
    try {
      const requestData = {
        isNeedGaussBlur: state.makeGaussianBlur,
        gaussBlurRad: state.gaussianBlurCount,
        isNeedMaxIntensity: state.maximizeIntensity,
      };
      console.log(requestData);

      const response = await axiosStore.postPreprocessing(requestData);
      console.log('Response:', response);

      if (response.preproc_show && response.preproc_save) {
        const file = base64ToTiff(response.preproc_save, 'image/tiff', `result_preproc.tiff`);
        const newResult = response.preproc_show.map((base64Data, index) => {
          return base64ToTiff(base64Data, 'image/tiff', `result_preproc_${index}.tiff`);
        });
        const newProjection = response.img_projection.map((base64Data, index) => {
          return base64ToTiff(base64Data, 'image/tiff', `preproc_xyz_${index}.tiff`);
        });
        state.setPreprocImageProjection(newProjection);
        state.setPreprocImage(newResult);
        console.log(newResult);
        state.setPreprocImageSave([file]);
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
    window.alert("Im trying make deconvolution");
    try {
      const requestData = {
        // here will be choosen  model
      };
      console.log(requestData);

      const response = await axiosStore.postCNNDeconvolution(requestData);
      console.log('Response:', response);

      if (response.deconv_show && response.deconv_save) {
        const file = base64ToTiff(response.deconv_save, 'image/tiff', `result_deconv.tiff`);
        const newResult = response.deconv_show.map((base64Data, index) => {
          return base64ToTiff(base64Data, 'image/tiff', `result_deconv_${index}.tiff`);
        });
        const newProjection = response.img_projection.map((base64Data, index) => {
          return base64ToTiff(base64Data, 'image/tiff', `result_deconv_${index}.tiff`);
        });
        state.setResultImageProjection(newProjection);
        state.setResultImage(newResult);
        console.log(newResult);
        state.setResultImageSave([file]);
      } else {
        console.log('No neural deconvolution result found in the response.');
        window.alert('No neural deconvolution result found in the response.');
      }
    } catch (error) {
      console.error('Error in preprocessing:', error);
      window.alert('Error in preprocessing: ' + error);
    }
  };

  function getStepContent(step) {
    switch (step) {
      case steps.indexOf('Load image'):
        return (<>
          <div className="row">
            <Dropzone 
              files={state.sourceImageSave} 
              addFiles={state.setSourceImageSave} 
              imageType={'source_img'} 
              state={state} 
            />
          </div>
        </>);
      case steps.indexOf('Preprocessing'):
        return (<>
          <div className="row">
            <div className="column-1" style={{ zIndex: 2, border: `1px solid ${state.customBorder}`}}>
              <div className="slider-container">
                <div>
                  <label htmlFor="layer-slider">Layer:</label><br />
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
              <div className="box-parameters">
                <div>
                  <input
                    id="is_need_max"
                    type="checkbox"
                    checked={state.maximizeIntensity}
                    onChange={(e) => state.setMaximizeIntensity(e.currentTarget.checked)}
                  />
                  <label>Maximize intensitivities</label>
                </div>
                <div>
                  <input
                    id="is_need_gauss"
                    type="checkbox"
                    checked={state.makeGaussianBlur}
                    onChange={(e) => state.setMakeGaussianBlur(e.currentTarget.checked)}
                  />
                  <label>Gaussian blurring</label>
                </div>
                <TextField
                  id="gaussRad"
                  label="Gaussian blur radius"
                  variant="outlined"
                  placeholder="Enter a radius"
                  fullWidth
                  margin="normal"
                  name="radius"
                  onChange={(e) => state.setGaussianBlurCount(e.target.value)}
                  value={state.gaussianBlurCount}
                  style={{ color: state.customTextColor }}
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
                    style: { color: state.customTextColor},
                  }}
                />
              </div>
              <Button variant="outlined" color="secondary" className="btn-run" onClick={handlePreprocessing}>
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
              <div className="column-1" style={{ zIndex: 2, border: `1px solid ${state.customBorder}`}}>
                <div className="slider-container">
                  <div>
                    <label htmlFor="layer-slider">Layer:</label><br />
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
                <ChooseList
                  className="choose-list"
                  name="CNN models"
                  list={Object.keys(state.cnnDeconvModels)}
                  selected={state.cnnDeconvModel}
                  onChange={state.handleCnnDeconvMethodChange}
                  customTextColor={state.customTextColor}
                />
                <Button
                  variant="outlined"
                  className="btn-run"
                  onClick={handleCNNDeconvolution}
                >
                  Deconvolve
                </Button>
              </div>
              <div className="column-2" style={{ zIndex: 1 }}>
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
        );;
      case steps.indexOf('Save results'):
        return (
          <>
            <div className="row">
              <div className="column-1">
                <div className="slider-container">
                  <div>
                    <label htmlFor="layer-slider">Layer:</label><br />
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
                  style={{ color: state.customTextColor }}
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
                    style: { color: state.customTextColor},
                  }}
                />
                <FileDownloader 
                  fileList={state.resultImageSave} 
                  folderName={state.filename} 
                  btnName={"Save result"} 
                />
              </div>
              <div className="column-2" style={{ zIndex: 1 }}>
                <div className="images__preview" style={{ marginTop: '100px', marginRight: '50px' }}>
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
