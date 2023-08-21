import React, { useRef } from 'react';
import { Button, TextField } from '@mui/material';
import StepperWrapper from '../../StepperWrapper';
import TifViewer from '../../../components/TifViewer';
import TiffStackViewer from '../../../components/TiffStackViewer';
import TifCompare from '../../../components/TifCompare';
import TiffExtractor from '../../../components/TiffExtractor';
import Dropzone from '../../../components/Dropzone';
import FileDownloader from '../../../components/FileDownloader';
import { useStateValues } from '../state';
import { base64ToTiff } from '../../../shared/hooks/showImages';
import ChooseList from '../../../components/ChooseList';
import useAxiosStore from '../../../app/store/axiosStore';
import './stepper.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const BeadExtractor = () => {
  const state = useStateValues();
  const steps = ['Load beads', 'Mark beads', 'Average bead', 'Save results'];
  const axiosStore = useAxiosStore();
  const canvasRef = useRef();

  const handleBeadExtract = async () => {
    try {
      const beadCoordsStr = state.centerExtractBeads.map(({ x, y }) => `[${x}, ${y}]`).join(', ');

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
      } else {
        console.log('No extracted beads found in the response.');
      }
    } catch (error) {
      console.error('Error in Bead Extract:', error);
    }
  };

  const handleBeadAverage = async () => {
    try {
      const requestData = {
        blur_type: state.blurType,
      };

      const response = await axiosStore.postBeadAverage(requestData);
      console.log('Response:', response);

      if (response.average_bead_show) {
        const file = base64ToTiff(response.average_bead_save, 'image/tiff', `average_bead.tiff`);
        const newAverageBead = response.average_bead_show.map((base64Data, index) => {
          return base64ToTiff(base64Data, 'image/tiff', `average_bead_${index}.tiff`);
        });
        state.setAverageBead(newAverageBead);
        state.setAverageBeadSave([file])
        console.log(state.averageBead)
      } else {
        console.log('No average bead found in the response.');
      }
    } catch (error) {
      console.error('Error in Bead Average:', error);
    }
  };
  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <>
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
                    }
                    }
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
                <Dropzone files={state.beads} addFiles={state.setBeads} imageType={'beads_image'} state={state} />
              </div>
            </div>
          </>
        );
      case 1:
        return (
          <>
            <div className="row">
              <div className="column-1">
                <label htmlFor="layer-slider">Layer:</label>
                <input
                  id="layer-slider"
                  type="range"
                  min="0"
                  max={state.beads.length - 1}
                  step="1"
                  value={state.layer}
                  onChange={(e) => state.handleLayerChange(e, state.beads.length - 1)}
                />
                <label htmlFor="brightness-slider">Brightness:</label>
                <input
                  id="brightness-slider"
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={state.levelBrightness}
                  onChange={state.handleSliderBrightnessChange}
                />
                <label className="subtitle" htmlFor="select-size">Selection Size (px):</label>
                <TextField
                  id="select-size"
                  variant="outlined"
                  placeholder="Enter a select size"
                  fullWidth
                  name="selectSize"
                  onChange={(e) => state.setSelectSize(e.target.value)}
                  value={state.selectSize}
                />
                <Button variant="outlined" color="info" className="btn-run" onClick={(e) => state.handleUndoMark(e, canvasRef)}>
                  Undo mark
                </Button>
                <Button variant="outlined" color="info" className="btn-run" onClick={(e) => state.handleClearMarks(e, canvasRef)}>
                  Clear all marks
                </Button>
                <Button variant="outlined" color="secondary" className="btn-run" onClick={handleBeadExtract}>
                  Extract beads
                </Button>
                <ChooseList
                  className="choose-list"
                  name="Tiff type"
                  list={state.tiffTypes}
                  selected={state.tiffType}
                  onChange={state.handleTiffTypeChange}
                />
                <FileDownloader fileList={state.extractBeads} folderName={"extract_beads"} btnName={"Save beads"} />
              </div>
              <div className="column-2" style={{ zIndex: 1 }}>
                <div className="images__preview">
                  <TiffExtractor
                    img={state.beads[state.layer]}
                    scale={1}
                    state={state}
                    canvasRef={canvasRef}
                  />
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
                    max="5"
                    step="0.1"
                    value={state.scale}
                    onChange={(e) => state.handleScaleChange(e, 5)}
                  />
                </div>
                <label htmlFor="brightness-slider">Brightness:</label>
                <input
                  id="brightness-slider"
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={state.levelBrightness}
                  onChange={state.handleSliderBrightnessChange}
                />
                <ChooseList
                  className="choose-list"
                  name="Blur type"
                  list={state.blurTypes}
                  selected={state.blurType}
                  onChange={state.handleBlurTypeChange}
                />
                <Button variant="outlined" color="secondary" className="btn-run" onClick={handleBeadAverage}>
                  Average Bead
                </Button>
              </div>
              <div className="column-2">
                <div className="images__preview">
                  <TifCompare img_1={state.extractBeads} img_2={state.averageBead} scale={state.scale} state={state} />
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
                  <input
                    id="scale-slider"
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.1"
                    value={state.scale}
                    onChange={(e) => state.handleScaleChange(e, 5)}
                  />
                  <label htmlFor="layer-slider">Layer:</label>
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
                <label htmlFor="brightness-slider">Brightness:</label>
                <input
                  id="brightness-slider"
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={state.levelBrightness}
                  onChange={state.handleSliderBrightnessChange}
                />
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
                <FileDownloader fileList={state.averageBeadSave} folderName={state.filename} btnName={"Save result"} />
              </div>
              <div className="column-2" style={{ zIndex: 1 }}>
                <div className="images__preview">
                  <TifViewer
                    img={state.averageBead[state.layer2]}
                    scale={state.scale}
                    brightness={state.brightness}
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
      />
    </div>
  );
};

export default BeadExtractor;
