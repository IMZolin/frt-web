import React from 'react';
import { Button, Checkbox, FormControlLabel, TextField } from '@mui/material';
import StepperWrapper from '..';
import TifCompare from '../../../components/TifCompare';
import TiffStackViewer from '../../../components/TiffStackViewer';
import Dropzone from '../../../components/Dropzone';
import { useStateValues } from "../state";
import useAxiosStore from '../../../app/store/axiosStore';
import { base64ToTiff } from '../../../shared/hooks/showImages';
import '../stepper.css';

const NeuralNetwork = () => {
  const state = useStateValues();
  const steps = ['Load image', 'Preprocessing', 'Deconvolution', 'Save results'];
  const axiosStore = useAxiosStore();

  const handlePreprocessing = async () => {
    console.log("Im tryin make preprocessing");
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

          state.setPreprocImage(newResult);
          console.log(newResult);
          state.setPreprocImageSave([file]); 
      } else {
          console.log('No preprocessing result found in the response.');
      }
    } catch (error) {
      console.error('Error in preprocessing:', error);
      window.alert('Error in preprocessing: ' + error);
    }
  };

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (<>
          <div className="row">
            <Dropzone files={state.sourceImage} addFiles={state.setSourceImage} imageType={'source_img'} state={state}/>
          </div>
        </>);
      case 1:
        return (<>
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
                        />
                    </div>

                    <Button variant="outlined" color="secondary" className="btn-run" onClick={handlePreprocessing}>
                        Make preprocessing
                    </Button>
                </div>
                <div className="column-2">
                    <div className="images__preview">
                        <TifCompare img_1={state.sourceImage} img_2={state.preprocImage} scale={state.scale} state={state} />
                    </div>
                </div>
            </div>
        </>
    );
      case 2:
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
                    onChange={state.handleSliderChange}
                  />
                </div>
                <div className="stepper-psf">
                  <TextField
                    id="beadSize"
                    label="Bead size"
                    variant="outlined"
                    placeholder="Enter a bead size"
                    fullWidth
                    margin="normal"
                    name="beadSize"
                    onChange={(e) => state.setBeadSize(e.target.value)}
                    value={state.beadSize}
                  />
                  <TextField
                    className="stepper-resolution"
                    id="resolution-x"
                    label="Resolution XY (nm/pxl)"
                    variant="outlined"
                    placeholder="Enter the resolution in X direction"
                    fullWidth
                    margin="normal"
                    onChange={(e) => state.setResolution1(e.target.value)}
                    value={state.resolutionXY}
                  />
                  <TextField
                    className="stepper-resolution"
                    id="resolution-z"
                    label="Resolution Z (nm/pxl)"
                    variant="outlined"
                    placeholder=""
                    fullWidth
                    margin="normal"
                    onChange={(e) => state.setResolution2(e.target.value)}
                    value={state.resolutionZ}
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
                  <Button variant="outlined" className="btn-run">
                    Run Deconvolution
                  </Button>
                </div>
              </div>
              <div className="column-2">
                <div className="images__preview">
                  <TifCompare files_1={state.extractBeads} files_2={state.averageBead} scale={state.scale} state={state} canvasRef={null} isExtract={false}/>
                </div>
              </div>
            </div>
          </>
        );
      case 3:
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
                    onChange={state.handleSliderChange}
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
              </div>
              <div className="column-2" style={{ zIndex: 1 }}>
                <div className="images__preview">
                  <TiffStackViewer tiffList={state.averageBead} scale={state.scale} state={state} canvasRef={null} isExtract={false}/>
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
        name="Neural networks"
        stepContent={getStepContent}
        steps={steps}
        handleNextStep={state.handleNextStep}
        handlePrevStep={state.handlePrevStep}
        activeStep={state.activeStep}
        isLoad={state.isLoad}
      />
    </div>
  );
};

export default NeuralNetwork;
