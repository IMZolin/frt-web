import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Button, Step, StepLabel, Stepper } from '@mui/material';
import './stepper.css';

const StepperWrapper = ({ name, stepContent, steps, handleNextStep, handlePrevStep, activeStep, isLoad, urlPage, typeRun}) => {
  const navigate = useNavigate();
  const isNotNextStep = activeStep === steps.length - 1 && typeRun === null;

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
          <div className="header-container">
            <Button component={Link} to="/" className="btn-back" color="error" variant="outlined" style={{ marginLeft: '20px' }}>
              Back to menu
            </Button>
            <h2 variant="h4" style={{ margin: '0 auto', textAlign: 'center' }}>
              {name}
            </h2>
          </div>
          <div className="stepper">
            <div className="stepper-container">
            <div className='stepper-box'>
                <div className="btn-stack" style={{ marginBottom: '30px' }}>
                  <Button disabled={activeStep === 0} onClick={handlePrevStep} className="btn-back" variant="outlined">
                    Back
                  </Button>
                  {isNotNextStep ? null : <Button variant="outlined" color="primary" onClick={handleButtonClick} disabled={!isLoad} style={{marginLeft: '3px'}}>
                    {activeStep === steps.length - 1 ? `Go to ${typeRun}` : 'Next'}
                  </Button>}
                </div>
                <Stepper alternativeLabel activeStep={activeStep} className="stepper-steps">
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </div>
              <form>{stepContent(activeStep)}</form>
            </div>
          </div>
        </>
      )}
      <Outlet />
    </div>
  );
};

export default StepperWrapper;
