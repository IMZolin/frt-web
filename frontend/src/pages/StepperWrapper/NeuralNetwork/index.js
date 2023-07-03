import React from 'react';
import { Button, Checkbox, FormControlLabel, TextField } from '@mui/material';
import StepperWrapper from '..';
import TifCompare from '../../../components/TifCompare';
import TiffStackViewer from '../../../components/TiffStackViewer';
import Dropzone from '../../../components/Dropzone';
import { useStateValues } from "../state";
import '../stepper.css';

const NeuralNetwork = () => {
  const state = useStateValues();
  const steps = ['Load image', 'Preprocessing', 'Deconvolution', 'Save results'];

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <>
            <Dropzone files={state.files} addFiles={state.addFiles} />
          </>
        );
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
                    onChange={state.handleSliderChange}
                  />
                </div>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={state.maximizeIntensity}
                      onChange={(e) => state.setMaximizeIntensity(e.target.checked)}
                      name="maximize-intensity"
                      color="primary"
                    />
                  }
                  label="Maximize intensity"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={state.makeGaussianBlur}
                      onChange={state.handleGaussianBlurToggle}
                      name="make-gaussian-blur"
                      color="primary"
                    />
                  }
                  label="Make Gaussian blur"
                />
                <Button className="btn-run" color="success" variant="outlined">
                  Apply
                </Button>
                {state.makeGaussianBlur === true ? (
                  <TextField
                    className="gaussian-blur-count"
                    id="gaussian-blur-count"
                    label=""
                    variant="outlined"
                    placeholder=""
                    fullWidth
                    margin="normal"
                    onChange={(e) => state.setGaussianBlurCount(e.target.value)}
                    value={state.gaussianBlurCount}
                  />
                ) : null}
              </div>
              <div className="column-2">
                <div className="images__preview">
                  <TifCompare files_1={state.files} files_2={state.files} scale={state.scale}/>
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
                  <TifCompare files_1={state.files} files_2={state.files} scale={state.scale}/>
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
                  <TiffStackViewer tiffList={state.files} scale={state.scale} />
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
        files={state.files}
      />
    </div>
  );
};

export default NeuralNetwork;
