import { useState } from "react";
import { Button, TextField } from "@mui/material";
import { DropzoneAreaBase } from "material-ui-dropzone";
import StepperWrapper from '..';
import TifCompare from '../../../components/TifCompare';
import TifViewer from '../../../components/TifViewer';
import 'bootstrap/dist/css/bootstrap.min.css';


const Deconvolution = () => {
  const [files, addFiles] = useState([]);
  const [beadSize, setBeadSize] = useState(200);
  const [iter, setIter] = useState(50);
  const [iterPSF, setIterPSF] = useState(50);
  const [resolution1, setResolution1] = useState(22);
  const [resolution2, setResolution2] = useState(100);
  const [activeStep, setActiveStep] = useState(0);
  const [filename, setFilename] = useState('');
  const [scale, setScale] = useState(5);
  const steps = ['Load image', 'Load PSF', 'Run Deconvolution', 'Save results'];

  const handleSliderChange = (e) => {
    const value = e.target.value;
    const maxScale = 10;
    const newScale = value > maxScale ? maxScale : value;
    setScale(newScale);
  }
  const handleNextStep = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handlePrevStep = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const completedFun = () => {
    console.log('Completed');
    handleNextStep();
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
  }
  const [statePSF, setStatePSF] = useState('dropzone');

  function handlePSFChange(event) {
    setStatePSF(event.target.checked ? 'stepper-psf' : 'dropzone');
  }

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <>
            <DropzoneAreaBase
              fileObjects={files}
              showPreviewsInDropzone={true}
              useChipsForPreview
              onAdd={(newFile) => {
                newFile[0].id = Math.floor(Math.random() * 10000);
                console.log(newFile);
                addFiles((prevFiles) => [...prevFiles, newFile[0]]);
              }}
              onDelete={(delFile) => {
                addFiles((prevFiles) =>
                  prevFiles.filter((file) => file.id !== delFile.id),
                );
              }}
              acceptedFiles={['.tif', '.tiff']}
            />
          </>
        );
      case 1:
        return (
          <>
            <div className="row">

              {statePSF === 'dropzone' ? (
                <>
                  <div className="column-1">
                    <label htmlFor="toggle">Restart PSF:</label>
                    <input
                      type="checkbox"
                      id="toggle"
                      checked={statePSF === 'stepper-psf'}
                      onChange={handlePSFChange}
                    />
                    <div className="slider-container">
                      <label htmlFor="scale-slider">Scale:</label>
                      <input id="scale-slider" type="range" min="0.5" max="10" step="0.1" value={scale} onChange={handleSliderChange} />
                    </div>
                    <DropzoneAreaBase
                      fileObjects={files}
                      showPreviewsInDropzone={true}
                      useChipsForPreview
                      onAdd={(newFile) => {
                        newFile[0].id = Math.floor(Math.random() * 10000);
                        console.log(newFile);
                        addFiles((prevFiles) => [...prevFiles, newFile[0]]);
                      }}
                      onDelete={(delFile) => {
                        addFiles((prevFiles) =>
                          prevFiles.filter((file) => file.id !== delFile.id),
                        );
                      }}
                      acceptedFiles={['.tif', '.tiff']}
                    />
                  </div>
                  <div className="column-2">
                    <div className="images__preview">
                      {files.map((file) => (
                        <TifViewer img={file} scale={scale} />
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="column-1">
                    <label htmlFor="toggle">Restart PSF:</label>
                    <input
                      type="checkbox"
                      id="toggle"
                      checked={statePSF === 'stepper-psf'}
                      onChange={handlePSFChange}
                    />
                    <div className="slider-container">
                      <label htmlFor="scale-slider">Scale:</label>
                      <input id="scale-slider" type="range" min="0.5" max="10" step="0.1" value={scale} onChange={handleSliderChange} />
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
                        onChange={(e) => setBeadSize(e.target.value)}
                        value={beadSize}
                      />
                      <div className="stepper-resolutions">
                        <TextField
                          className="stepper-resolution"
                          id="resolution-x"
                          label="Resolution XY (nm/pxl)"
                          variant="outlined"
                          placeholder="Enter the resolution in X direction"
                          fullWidth
                          margin="normal"
                          onChange={(e) => setResolution1(e.target.value)}
                          value={resolution1}
                        />
                        <TextField
                          className="stepper-resolution"
                          id="resolution-z"
                          label="Resolution Z (nm/pxl)"
                          variant="outlined"
                          placeholder=""
                          fullWidth
                          margin="normal"
                          onChange={(e) => setResolution2(e.target.value)}
                          value={resolution2}
                        />
                      </div>
                    </div>
                    <TextField
                      id="iter"
                      label="Iteartion number"
                      variant="outlined"
                      placeholder="Enter a iteartion number"
                      fullWidth
                      margin="normal"
                      name="iter"
                      onChange={(e) => setIterPSF(e.target.value)}
                      value={iterPSF}
                    />
                    <Button
                      variant="outlined"
                      color="secondary"
                      className="btn-run"
                    >
                      Run PSF
                    </Button>
                  </div>
                  <div className="column-2">
                    <div className="images__preview">
                      {files.map((file) => (
                        <TifCompare img_1={file} img_2={file} scale={scale} />
                      ))}
                    </div>
                  </div>
                </>
              )}
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
                  <input id="scale-slider" type="range" min="0.5" max="10" step="0.1" value={scale} onChange={handleSliderChange} />
                </div>
                <TextField
                  id="iter"
                  label="Iteartion number"
                  variant="outlined"
                  placeholder="Enter a iteartion number"
                  fullWidth
                  margin="normal"
                  name="iter"
                  onChange={(e) => setIter(e.target.value)}
                  value={iter}
                />
                <Button
                  variant="outlined"
                  className="btn-run"
                >
                  Run Deconvolution
                </Button>
              </div>
              <div className="column-2" style={{ zIndex: 1 }}>
                <div className="images__preview">
                  {files.map((file) => (
                    <TifViewer
                      img={file}
                      scale={scale}
                      onClick={handleButtonClick}
                      className="single-tif"
                      style={{ transform: `scale(${scale})`, objectFit: "contain" }}
                    />
                  ))}
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
                  <input id="scale-slider" type="range" min="0.5" max="10" step="0.1" value={scale} onChange={handleSliderChange} />
                </div>
                <TextField
                  id="filename"
                  label="Filename"
                  variant="outlined"
                  placeholder="Enter a file name"
                  fullWidth
                  margin="normal"
                  name="filename"
                  onChange={(e) => setFilename(e.target.value)}
                  value={filename}
                />
              </div>
              <div className="column-2" style={{ zIndex: 1 }}>
                <div className="images__preview">
                  {files.map((file) => (
                    <TifViewer
                      img={file}
                      scale={scale}
                      onClick={handleButtonClick}
                      className="single-tif"
                      style={{ transform: `scale(${scale})`, objectFit: "contain" }}
                    />
                  ))}
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
        handleNextStep={activeStep === steps.length - 1 ? completedFun : handleNextStep}
        handlePrevStep={handlePrevStep}
        activeStep={activeStep}
        files={files}
      />
    </div>
  );
};
export default Deconvolution;