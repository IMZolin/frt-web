import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Button, Typography } from '@mui/material';
import { Stepper, Step, StepLabel, StepButton, makeStyles} from "@material-ui/core";
import './stepper.css';

const StepperWrapper = ({ name, stepContent, steps, handleNextStep, handlePrevStep, activeStep, isLoad, urlPage, typeRun, darkMode }) => {
  const navigate = useNavigate();
  const isNotNextStep = activeStep === steps.length - 1 && typeRun === null;
  const [customTextColor, setCustomTextColor] = useState(getComputedStyle(document.documentElement).getPropertyValue('--text-color-light'));
  const [customStep, setCustomStep] = useState(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-light'));
  const [customStepCompleted, setCustomStepCompleted] = useState(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-light2'));
  const [customBorder, setCustomBorder] = useState(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-light'));
  const useStyles = makeStyles(() => ({
    root: {
      "& .MuiStepIcon-active": { color: `${customStep}` },
      "& .MuiStepIcon-completed": { color: `${customStepCompleted}` },
    }
  }));
  const c = useStyles();
  useEffect(() => {
    if (darkMode) {
      setCustomTextColor(getComputedStyle(document.documentElement).getPropertyValue('--text-color-dark'));
      setCustomStep(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-dark'));
      setCustomStepCompleted(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-dark2'));
      setCustomBorder(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-dark'));
    } else {
      setCustomTextColor(getComputedStyle(document.documentElement).getPropertyValue('--text-color-light'));
      setCustomStep(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-light'));
      setCustomStepCompleted(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-light2'));
      setCustomBorder(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-light'));
    }
  }, [darkMode]);
  
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
            <div className="btn-stack" style={{border: `1px solid ${customBorder}`}}>
              <Button component={Link} to="/" className="btn-back" color="error" variant="outlined">
                Back to menu
              </Button>
              <div className="btn-stack-buttons">
                <Button disabled={activeStep === 0} onClick={handlePrevStep} className="btn-back-2" variant="outlined" style={{ marginRight: '1%' }}>
                  Back
                </Button>
                {isNotNextStep ? null : (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleButtonClick}
                    disabled={!isLoad}
                    className={'btn-back-2'}
                    style={{fontSize: `${typeRun === 'Deconvolution' ? '10px' : ''}`}}
                  >
                    {activeStep === steps.length - 1 ? `Go to ${typeRun}` : 'Next'}
                  </Button>
                )}
              </div>
            </div>
            <div className="stepper-head">
              <h2 variant="h4" style={{ margin: '0 auto', textAlign: 'center' }}>
                {name}
              </h2>
              <div className='stepper-box'>
                <Stepper alternativeLabel activeStep={activeStep} className={c.root} style={{backgroundColor: 'transparent', margin: '0 auto', width: '100%'}}>
                  {steps.map((label) => (
                    <Step key={label} className="custom-step">
                      <StepLabel style={{ 
                        color: customTextColor,
                        }}>
                          <Typography variant="caption" color={customTextColor}>      
                            <strong>{label}</strong>
                          </Typography>
                        </StepLabel>
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
