import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Button, Typography } from '@mui/material';
import { Stepper, Step, StepLabel, makeStyles} from "@material-ui/core";
import './stepper.css';

const StepperWrapper = ({ name, stepContent, steps, handleNextStep, handlePrevStep, activeStep, isLoad, urlPage, typeRun }) => {
  const navigate = useNavigate();
  const isNotNextStep = activeStep === steps.length - 1 && typeRun === null;
  const lessFontSize = activeStep === steps.length - 1 && typeRun  === 'Deconvolution';
  const useStyles = makeStyles(() => ({
    root: {
      "& .MuiStepIcon-active": { color: `var(--button-color)` },
      "& .MuiStepIcon-completed": { color: `var(--button-color2)` },
    }
  }));
  const c = useStyles();

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
            <div className="btn-stack" style={{border: `1px solid var(--button-color)`}}>
              <Button component={Link} to="/" className="btn-back" color="error" variant="contained">
                Back to menu
              </Button>
              <div className="btn-stack-buttons">
                <Button disabled={activeStep === 0} onClick={handlePrevStep} className="btn-back-2" variant="contained" style={{ marginRight: '1%' }}>
                  Back
                </Button>
                {isNotNextStep ? null : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleButtonClick}
                    disabled={!isLoad}
                    className={'btn-back-2'}
                    style={{fontSize: `${lessFontSize ? '10px' : ''}`}}
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
                        color: "var(--textfield-color)",
                        }}>
                          <Typography variant="caption" color={"var(--textfield-color)"}>
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
