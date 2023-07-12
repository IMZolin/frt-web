import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button, Step, StepLabel, Stepper } from '@mui/material';
import { useStateValues } from './state';
import useAxiosStore from '../../app/store/axiosStore';
import './stepper.css';

const StepperWrapper = ({ name, stepContent, steps, handleNextStep, handlePrevStep, activeStep, files}) => {
  const state = useStateValues();
  const axiosStore = useAxiosStore();
  //!TODO: Connect file downloads (front + back)
  const handleNext = async () => {
    if (activeStep === 0) {
      try {
        let formData = new FormData();
        const fileObjects = files.map((file) => file.file);
  
        fileObjects.forEach((file) => {
          formData.append('file', file);
        });
  
        const response = await axiosStore.postData({
          file: fileObjects,
          voxelX: state.voxelX,
          voxelY: state.voxelY,
          voxelZ: state.voxelZ
        });
  
        console.log('Response:', response);
        handleNextStep();
      } catch (error) {
        console.error('Error posting data:', error);
      }
    } else {
      handleNextStep();
    }
  };
   

  return (
    <div>
      {activeStep === steps.length ? (
        <h2 variant="h4" align="center">
          Loading...
        </h2>
      ) : (
        <>
          <h2 variant="h4" align="center">
            {name}
          </h2>
          <div className="stepper">
            <Button component={Link} to="/" className="btn-back" color="error" variant="outlined">
              Back to menu
            </Button>
            <div className="stepper-container">
              <form>{stepContent(activeStep)}</form>
              <Stepper alternativeLabel activeStep={activeStep} className="stepper-steps">
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </div>
            <div>
              <Button disabled={activeStep === 0} onClick={handlePrevStep} className="btn-back">
                Back
              </Button>
              <Button variant="contained" color="primary" onClick={handleNext} disabled={files.length === 0}>
                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        </>
      )}
      <Outlet />
    </div>
  );
};

export default StepperWrapper;
