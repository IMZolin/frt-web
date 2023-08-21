import React from 'react';
import { Button, TextField } from "@mui/material";
import StepperWrapper from '..';
import Dropzone from '../../../components/Dropzone';
import TifCompare from '../../../components/TifCompare';
import TiffStackViewer from '../../../components/TiffStackViewer';
import FileDownloader from '../../../components/FileDownloader';
import { useStateValues } from "../state";
import ChooseList from '../../../components/ChooseList';

import 'bootstrap/dist/css/bootstrap.min.css';

const Deconvolution = () => {
  const state = useStateValues();
  const steps = ['Load PSF', 'Load image', 'Run Deconvolution', 'Save results'];

  const handleDeconvolve = async () => {
    console.log("Im tryin make deconvolve");
    
    // TODO : need here to provide deconvolution and saving result in 2 variables: 'resultImage' (for preview) and 'resultImageSave' (for saving in file). It is like in PSF index.js
    state.setResultImage(state.sourceImage);
    console.log(state.sourceImage)
    state.setResultImageSave(state.sourceImage);   
  };

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (<>
                  <div className="row">
                    <div className="column-1" style={{ zIndex: 2 }}>
                      <div className="subtitle">Voxel size:</div>
                      <div className="voxel-box">
                        <TextField
                          className="stepper-resolution"
                          id="resolution-x"
                          label="Resolution-XY (micron/pxl)"
                          variant="outlined"
                          placeholder="Enter the resolution in X and Y direction"
                          fullWidth
                          margin="normal"
                          onChange={(e) => {
                            state.setVoxelX(e.target.value);
                            state.setVoxelY(e.target.value)
                          }}
                          value={state.voxelX}
                        />
                        <TextField
                          className="stepper-resolution"
                          id="resolution-z"
                          label="Resolution-Z (micron/pxl)"
                          variant="outlined"
                          placeholder="Enter the resolution in Z direction"
                          fullWidth
                          margin="normal"
                          onChange={(e) => state.setVoxelZ(e.target.value)}
                          value={state.voxelZ}
                        />
                      </div>
                    </div>
                    <div className="column-2" style={{ zIndex: 1 }}>
                      <Dropzone files={state.extractedPSF} addFiles={state.setExtractedPSF} imageType={'extracted_PSF'} state={state} />
                    </div>
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
                <Dropzone files={state.sourceImage} addFiles={state.setSourceImage} imageType={'source_img'} state={state}/>
              </div>
              <div className="column-2">
                <div className="images__preview">
                  <TifCompare img_1={state.extractedPSF} img_2={state.sourceImage} scale={state.scale} state={state}/>
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
                    onChange={(e) => state.handleScaleChange(e, 10)}
                  />
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
                  list={Object.keys(state.deconvMethods)}
                  selected={state.deconvMethod}
                  onChange={state.handleDeconvMethodChange}
                />
                <Button
                  variant="outlined"
                  className="btn-run"
                  disabled={!(state.sourceImage.length == 0 || state.extractedPSF.length)} 
                  onClick={handleDeconvolve}
                >
                  Deconvolve
                </Button>
              </div>
              <div className="column-2" style={{ zIndex: 1 }}>
                <div className="images__preview">
                <TifCompare img_1={state.sourceImage} img_2={state.resultImage} scale={state.scale} state={state}/>
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
                    onChange={(e) => state.handleScaleChange(e, 10)}
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
                <FileDownloader fileList={state.resultImageSave} folderName={state.filename} btnName={"Save result"} />
              </div>
              <div className="column-2" style={{ zIndex: 1 }}>
                <div className="images__preview">
                  <TiffStackViewer tiffList={state.resultImage} scale={state.scale} state={state} canvasRef={null} isExtract={false}/>
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
