import React from 'react';
import { Button, TextField } from '@mui/material';
import StepperWrapper from '../../StepperWrapper';
import TifCompare from '../../../components/TifCompare';
import TiffStackViewer from '../../../components/TiffStackViewer';
import Dropzone from '../../../components/Dropzone';
import { useStateValues } from '../state';
import ChooseList from '../../../components/ChooseList';
import useAxiosStore from '../../../app/store/axiosStore';
import {downloadFiles} from '../../../shared/hooks/downloadFiles';
import './stepper.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const BeadExtractor = () => {
  const state = useStateValues();
  const steps = ['Load beads', 'Mark beads', 'Average bead', 'Save results'];
  const axiosStore = useAxiosStore();
  function base64ToBlob(base64Data, contentType) {
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024);
  
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
  
    return new Blob(byteArrays, { type: contentType });
  }
  
  const handleBeadExtract = async () => {
    try {
      const requestData = {
        select_size: state.selectSize, 
        bead_coords: '[[39, 102], [181, 21], [234, 272], [336, 612], [103, 591], [564, 737], [481, 718], [510, 646], [534, 934], [351, 977], [258, 1023], [119, 1059], [459, 1589], [77, 1605], [172, 1478], [184, 1358]]', 
        is_deleted: state.isDeleted, 
      };
  
      const response = await axiosStore.postBeadExtract(requestData);
      console.log('Bead Extract Response:', response);
  
      if (response.extracted_beads) {
        response.extracted_beads.forEach((base64Data, index) => {
          const blob = base64ToBlob(base64Data, 'image/tiff');
          const file = new File([blob], `extracted_bead_${index}.tiff`, { type: 'image/tiff' });
          console.log(file);
        });
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
      console.log('Bead Average Response:', response);
  
      if (response.average_bead) {
        const blob = base64ToBlob(response.average_bead, 'image/tiff');
        const file = new File([blob], `average_bead.tiff`, { type: 'image/tiff' });
        console.log('Average Bead Image:', file);
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
                    label="X (nm/pxl)"
                    variant="outlined"
                    placeholder="Enter the resolution in X direction"
                    fullWidth
                    margin="normal"
                    onChange={(e) => state.setVoxelX(e.target.value)}
                    value={state.voxelX}
                  />
                  <TextField
                    className="stepper-resolution"
                    id="resolution-y"
                    label="Y (nm/pxl)"
                    variant="outlined"
                    placeholder=""
                    fullWidth
                    margin="normal"
                    onChange={(e) => state.setVoxelY(e.target.value)}
                    value={state.voxelY}
                  />
                  <TextField
                    className="stepper-resolution"
                    id="resolution-z"
                    label="Z (nm/pxl)"
                    variant="outlined"
                    placeholder=""
                    fullWidth
                    margin="normal"
                    onChange={(e) => state.setVoxelZ(e.target.value)}
                    value={state.voxelZ}
                  />
                </div>
              </div>
              <div className="column-2" style={{ zIndex: 1 }}>
                <Dropzone files={state.beads} addFiles={state.setBeads} imageType={'beads_image'} state={state}/>
              </div>
            </div>
          </>
        );
      case 1:
        return (
          <>
            <div className="row">
              <div className="column-1">
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
                <Button variant="outlined" color="success" className="btn-run" onClick={handleBeadExtract}>
                  Extract beads
                </Button>
                <ChooseList
                  className="choose-list"
                  name="Tiff type"
                  list={state.tiffTypes}
                  selected={state.tiffType}
                  onChange={state.handleTiffTypeChange}
                />
                <Button variant="outlined" color="secondary" className="btn-run">
                  Save beads
                </Button>
              </div>
              <div className="column-2" style={{ zIndex: 1 }}>
                <div className="images__preview">
                  <TiffStackViewer
                    tiffList={state.beads}
                    scale={state.scale}
                    brightness={state.levelBrightness}
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
                    max="10"
                    step="0.1"
                    value={state.scale}
                    onChange={state.handleSliderChange}
                  />
                </div>
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
                  <TifCompare files_1={state.beads} files_2={state.beads} scale={state.scale} />
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
                <Button
                  variant="outlined"
                  color="success"
                  className="btn-run"
                  onClick={() => {
                    downloadFiles(state.beads, state.filename, 'single');
                  }}
                >
                  Save result
                </Button>
              </div>
              <div className="column-2" style={{ zIndex: 1 }}>
                <div className="images__preview">
                  <TiffStackViewer tiffList={state.beads} scale={state.scale} />
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
      />
    </div>
  );
};

export default BeadExtractor;
