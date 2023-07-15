import { Button, TextField } from "@mui/material";
import StepperWrapper from '../../StepperWrapper';
import TifCompare from '../../../components/TifCompare';
import TiffStackViewer from '../../../components/TiffStackViewer';
import ChooseList from '../../../components/ChooseList';
import Dropzone from '../../../components/Dropzone';
import { useStateValues } from "../state";
import './stepper.css';
import 'bootstrap/dist/css/bootstrap.min.css';


const StepperPSF = () => {
    const state = useStateValues();
    const steps = ['Load average bead', 'Bead parameters', 'Run PSF', 'Save results'];

    function getStepContent(step) {
        switch (step) {
            case 0:
                return (
                    <>
                        <Dropzone files={state.averageBead} addFiles={state.setAverageBead} imageType={'averaged_bead'} state={state}/>
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
                                    onChange={(e) => state.setResolutionXY(e.target.value)}
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
                                    onChange={(e) => state.setResolutionZ(e.target.value)}
                                    value={state.resolutionZ}

                                />
                            </div>
                            <div className="column-2" style={{ zIndex: 1 }}>
                                <div className="images__preview">
                                    <TiffStackViewer tiffList={state.averageBead} scale={state.scale} />
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
                                    list={Object.values(state.deconvMethods)}
                                    selected={state.deconvMethod} 
                                    onChange={state.handleDeconvMethodChange}
                                />
                                </div>
                                
                                <Button variant="outlined" color="secondary" className="btn-run">
                                    Calculate PSF
                                </Button>
                            </div>
                            <div className="column-2">
                                <div className="images__preview">
                                    <TifCompare files_1={state.averageBead} files_2={state.averageBead} scale={state.scale}/>
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
                                    <TiffStackViewer tiffList={state.averageBead} scale={state.scale} />
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