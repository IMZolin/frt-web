import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button, Step, StepLabel, Stepper } from '@mui/material';
import useAxiosStore from '../../app/store/axiosStore';
import './stepper.css';

const StepperFRT = ({ name, stepContent, steps, handleNextStep, handlePrevStep, activeStep, files, handleBackClick }) => {
  const axiosStore = useAxiosStore();

  const handleNext = async () => {
    if (activeStep === 0) {
      const formData = new FormData();
      formData.append('file', files[0]);

      try {
        await axiosStore.postData(formData);
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

export default StepperFRT;
