import React, { useEffect } from 'react';
import { Button, TextField } from "@mui/material";
import StepperWrapper from '..';
import Dropzone from '../../../components/Dropzone';
import TifCompare from '../../../components/TifCompare';
import TifViewer from '../../../components/TifViewer';
import FileDownloader from '../../../components/FileDownloader';
import { useStateValues } from "../state";
import { base64ToTiff } from '../../../shared/hooks/showImages';
import useAxiosStore from '../../../app/store/axiosStore';
import ChooseList from '../../../components/ChooseList';

import 'bootstrap/dist/css/bootstrap.min.css';

const Deconvolution = () => {
  const state = useStateValues();
  const steps = ['Load PSF', 'Load image', 'Run Deconvolution', 'Save results'];
  const axiosStore = useAxiosStore();

  const handleGetPSF = async () => {
    try {
        const response = await axiosStore.getPSF();
        console.log('Response:', response);

        if (response.psf_show && response.psf_save) {
            const file = base64ToTiff(response.psf_save, 'image/tiff', `extracted_psf.tiff`);
            const newExtractPSF = response.psf_show.map((base64Data, index) => {
                return base64ToTiff(base64Data, 'image/tiff', `extracted_psf_${index}.tiff`);
            });
            state.setExtractedPSF(newExtractPSF);
            state.setExtractedPSFSave([file]);
            state.setIsLoad(true);
            state.setResolution2(response.resolution);
            if (response.voxel) {
                state.setVoxelX(response.voxel.X);
                state.setVoxelY(response.voxel.Y);
                state.setVoxelZ(response.voxel.Z);
            }    
        } else {
            console.log('No psf data found in the response.');
        }
    } catch (error) {
        console.error('Error fetching average bead:', error);
    }
};

  const handleGetVoxel = async () => {
    try {
      const response = await axiosStore.getVoxel();
      console.log('Response:', response);

      if (response.voxel) {
        state.setVoxelX(response.voxel.X);
        state.setVoxelY(response.voxel.Y);
        state.setVoxelZ(response.voxel.Z);
      } else {
        console.log('No voxel data found in the response.');
      }
    } catch (error) {
      console.error('Error fetching average bead:', error);
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
    console.log("Im tryin make deconvolve");
    try {
      const requestData = {
        iter: state.iter,
        regularization: state.regularization,
        deconvMethod: state.deconvMethods[state.deconvMethod]
      };

      const response = await axiosStore.postDeconvolution(requestData);
      console.log('Response:', response);

      if (response.deconv_show) {
          const file = base64ToTiff(response.deconv_save, 'image/tiff', `result_deconv.tiff`);
          const newResult = response.deconv_show.map((base64Data, index) => {
              return base64ToTiff(base64Data, 'image/tiff', `result_deconv_${index}.tiff`);
          });
          state.setResultImage(newResult);
          console.log(newResult);
          state.setResultImageSave([file]); 
      } else {
          console.log('No deconvolution result found in the response.');
      }
  } catch (error) {
      console.error('Error in Deconvolution:', error);
      window.alert('Error in Deconvolution: ' + error);
  }
  };

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (<>
                  <div className="row">
                    <Dropzone files={state.extractedPSFSave} addFiles={state.setExtractedPSFSave} imageType={'extracted_psf'} state={state}/>
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
                <Dropzone files={state.sourceImageSave} addFiles={state.setSourceImageSave} imageType={'source_img'} state={state} />
              </div>
              <div className="column-2">
                <div className="images__preview">
                  <TifCompare img_1={state.sourceImage} img_2={state.extractedPSF} scale={state.scale} state={state}/>
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
                      <FileDownloader fileList={state.resultImageSave} folderName={state.filename} btnName={"Save result"} />
                  </div>
                  <div className="column-2" style={{ zIndex: 1 }}>
                      <div className="images__preview">
                          <TifViewer
                              img={state.resultImage[state.layer2]}
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
