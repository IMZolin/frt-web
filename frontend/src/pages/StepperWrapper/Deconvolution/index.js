import React from 'react';
import { Button, TextField } from "@mui/material";
import StepperWrapper from '..';
import Dropzone from '../../../components/Dropzone';
import TifCompare from '../../../components/TifCompare';
import TiffStackViewer from '../../../components/TiffStackViewer';
import { useStateValues } from "../state";
import ChooseList from '../../../components/ChooseList';

import 'bootstrap/dist/css/bootstrap.min.css';

const Deconvolution = () => {
  const state = useStateValues();
  const steps = ['Load image', 'Load PSF', 'Run Deconvolution', 'Save results'];

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <>
            <Dropzone files={state.extractBeads} addFiles={state.setExtractBeads} imageType={'extract_beads'} state={state}/>
          </>
        );
      case 1:
        return (
          <>
            <div className="row">
              <div className="column-1">
                <div className="slider-container">
                  <label htmlFor="scale-slider">Scale:</label>
                  <input id="scale-slider" type="range" min="0.5" max="10" step="0.1" value={state.scale} onChange={state.handleSliderChange} />
                </div>
                <Dropzone files={state.psfFiles} addFiles={state.addPsfFiles} imageType={'psf_image'} state={state}/>
              </div>
              <div className="column-2">
                <div className="images__preview">
                  <TifCompare files_1={state.extractBeads} files_2={state.psfFiles} scale={state.scale} />
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
                  <input id="scale-slider" type="range" min="0.5" max="10" step="0.1" value={state.scale} onChange={state.handleSliderChange} />
                </div>
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
                  list={Object.values(state.deconvMethods)}
                  selected={state.deconvMethod}
                  onChange={state.handleDeconvMethodChange}
                />
                <Button
                  variant="outlined"
                  className="btn-run"
                  disabled={!state.psfFiles.length} 
                >
                  Deconvolve
                </Button>
              </div>
              <div className="column-2" style={{ zIndex: 1 }}>
                <div className="images__preview">
                  <TifCompare files_1={state.extractBeads}files_2={state.psfFiles} scale={state.scale}  brightness={state.levelBrightness}/>
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
                  <input id="scale-slider" type="range" min="0.5" max="10" step="0.1" value={state.scale} onChange={state.handleSliderChange} />
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
                  <TiffStackViewer tiffList={state.extractBeads} scale={state.scale} />
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
        name="Deconvolution"
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

export default Deconvolution;
