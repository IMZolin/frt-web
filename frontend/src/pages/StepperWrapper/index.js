import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Button, Step, StepLabel, Stepper } from '@mui/material';
import './stepper.css';

const StepperWrapper = ({ name, stepContent, steps, handleNextStep, handlePrevStep, activeStep, isLoad, urlPage, typeRun}) => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (activeStep === steps.length - 1) {
      navigate(urlPage);
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
              <Button variant="contained" color="primary" onClick={handleButtonClick} disabled={!isLoad}>
                {activeStep === steps.length - 1 ? `Go to ${typeRun}` : 'Next'}
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
