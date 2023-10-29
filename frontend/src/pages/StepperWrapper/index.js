import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Button, Step, StepLabel, Stepper } from '@mui/material';
import './stepper.css';

const StepperWrapper = ({ name, stepContent, steps, handleNextStep, handlePrevStep, activeStep, isLoad, urlPage, typeRun }) => {
  const navigate = useNavigate();
  const isNotNextStep = activeStep === steps.length - 1 && typeRun === null;
  const customTextColor = "#f7fff8";

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
          <div className="header-container" style={{ display: 'flex' }}>
            <div className="btn-stack">
              <Button component={Link} to="/" className="btn-back" color="error" variant="contained">
                Back to menu
              </Button>
              <div className="btn-stack-buttons">
                <Button disabled={activeStep === 0} onClick={handlePrevStep} className="btn-back-2" variant="contained" style={{ marginRight: '1%' }}>
                  Back
                </Button>
                {isNotNextStep ? null : <Button variant="contained" color="primary" onClick={handleButtonClick} disabled={!isLoad} className="btn-back-2">
                  {activeStep === steps.length - 1 ? `Go to ${typeRun}` : 'Next'}
                </Button>}
              </div>
            </div>
            <div className="stepper-head">
              <h2 variant="h4" style={{ margin: '0 auto', textAlign: 'center' }}>
                {name}
              </h2>
              <div className='stepper-box'>
                <Stepper alternativeLabel activeStep={activeStep} className="stepper-steps">
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel style={{ color: customTextColor }}>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </div>
              </div>
          </div>
          <div className="stepper">
            <div className="stepper-container">
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
