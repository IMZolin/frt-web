import { Button, TextField } from "@mui/material";
import StepperWrapper from '../../StepperWrapper';
import TifCompare from '../../../components/TifCompare';
import TiffStackViewer from '../../../components/TiffStackViewer';
import ChooseList from '../../../components/ChooseList';
import FileDownloader from '../../../components/FileDownloader';
import Dropzone from '../../../components/Dropzone';
import { useStateValues } from "../state";
import { base64ToTiff } from '../../../shared/hooks/showImages';
import useAxiosStore from '../../../app/store/axiosStore';
import './stepper.css';
import 'bootstrap/dist/css/bootstrap.min.css';


const StepperPSF = () => {
    const state = useStateValues();
    const steps = ['Load average bead', 'Bead parameters', 'Run PSF', 'Save results'];
    const axiosStore = useAxiosStore();

    const handlePSFExtract = async () => {
        console.log("Im tryin make psf extraction");
        
        try {
          const requestData = {
            resolutionXY: state.voxelX,
            resolutionZ: state.voxelZ,
            beadSize: state.beadSize,
            iter: state.iter,
            regularization: state.regularization,
            deconvMethod: state.deconvMethods[state.deconvMethod]
          };

          const response = await axiosStore.postPSFExtract(requestData);
          console.log('Response:', response);
    
          if (response.extracted_psf) {
            const file = base64ToTiff(response.extracted_psf_save, 'image/tiff', `extracted_psf.tiff`);
            state.setExtractedPSF([response.extracted_psf]);
            state.setExtractedPSFSave([file])
            console.log(state.extractedPSF)
          } else {
            console.log('No extracted PSF found in the response.');
          }
        } catch (error) {
          console.error('Error in PSF extraction:', error);
          window.alert('Error in PSF extraction: ' + error);
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
                                            state.setVoxelY(e.target.value)}
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
                                <Dropzone files={state.averageBead} addFiles={state.setAverageBead} imageType={'averaged_bead'} state={state}/>
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
                                    />                                </div>
                                <TextField
                                    id="beadSize"
                                    label="Bead size (micron)"
                                    variant="outlined"
                                    placeholder="Enter a bead size"
                                    fullWidth
                                    margin="normal"
                                    name="beadSize"
                                    onChange={(e) => state.setBeadSize(e.target.value)}
                                    value={state.beadSize}
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
                                <div className="box-parameters">
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
                                </div>
                                
                                <Button variant="outlined" color="secondary" className="btn-run" onClick={handlePSFExtract}>
                                    Calculate PSF
                                </Button>
                            </div>
                            <div className="column-2">
                                <div className="images__preview">
                                    <TifCompare img_1={state.extractedPSF} img_2={state.averageBead} scale={state.scale} state={state} />
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
                                <FileDownloader fileList={state.extractedPSFSave} folderName={"psf"} btnName={"Save result"} />
                            </div>
                            <div className="column-2" style={{ zIndex: 1 }}>
                                <div className="images__preview">
                                    <TiffStackViewer tiffList={state.extractedPSF} scale={state.scale} state={state} canvasRef={null} isExtract={false}/>
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
                name="PSF calculation"
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
export default StepperPSF;