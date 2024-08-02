import React, {useRef, useEffect} from 'react';
import StepperWrapper from '../../StepperWrapper';
import TiffExtractor from '../../../components/TiffExtractor';
import useBeadMark from '../../../components/TiffExtractor/hook';
import {useStateValues} from '../state';
import {base64ToTiff} from '../../../shared/hooks/showImages';
import ChooseList from '../../../components/ChooseList';
import useAxiosStore from '../../../app/store/axiosStore';
import './stepper.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ImageLoader from "../../../components/SpecificStep/ImageLoader/ImageLoader";
import Downloader from "../../../components/SpecificStep/Downloader/Downloader";
import CustomButton from "../../../components/CustomButton/CustomButton";
import SliderContainer from "../../../components/SliderContainer/SliderContainer";
import SurveyBanner from "../../../components/SurveyBanner";
import CustomTextfield from "../../../components/CustomTextfield/CustomTextfield";
import {TIFFViewer} from "react-tiff";
import TifViewer from "../../../components/TifViewer";
import TifRow from "../../../components/TifRow";

const BeadExtractor = () => {
    const state = useStateValues();
    const steps = ['Load beads', 'Segment & average beads', 'Save results'];
    const axiosStore = useAxiosStore();
    const canvasRef = useRef();
    const markBead = useBeadMark();


    const handleBeadMark = async () => {
        try {
            if (state.centerExtractBeads.length > 0) {
                for (const beadCoords of state.centerExtractBeads) {
                    await state.handleAllDrawClick(canvasRef, beadCoords.x, beadCoords.y, markBead);
                }
            } else {
                console.log('No beads to mark.');
            }
        } catch (error) {
            console.error('Error in Bead Mark:', error);
            window.alert('Error in Bead Mark: ', error.response);
        }
    };
    useEffect(() => {
        if (state.activeStep === 1) {
            handleBeadMark();
        }
    }, [state.activeStep]);

    const handleBeadExtract = async () => {
        try {
            const beadCoordsStr = state.centerExtractBeads.map(({x, y}) => `[${x}, ${y}]`).join(', ');

            const requestData = {
                select_size: state.selectSize,
                bead_coords: `[${beadCoordsStr}]`,
            };

            const response = await axiosStore.postBeadExtract(requestData);
            console.log('Response:', response);
            if (response.extracted_beads) {
                const newExtractBeads = response.extracted_beads.map((base64Data, index) => {
                    return base64ToTiff(base64Data, 'image/tiff', `extracted_bead_${index}.tiff`);
                });

                state.setExtractBeads(newExtractBeads);
                console.log(state.extractBeads);
                window.alert(`Beads extracting successfully: ${response.extracted_beads.length} beads`);
            } else {
                console.log('No extracted beads found in the response.');
                window.alert('No extracted beads found in the response.');
            }
        } catch (error) {
            console.error('Error in Bead extraction: ', error);
            window.alert('Error in Bead extraction: ' + error.response);
        }
    };

    const handleBeadAverage = async () => {
        state.setBanner({status: 'info', message: 'Bead averaging was started'});
        try {
            const requestData = {
                denoise_type: state.denoiseType,
                new_coords: null
            };

            const response = await axiosStore.calcAverageBead(requestData);
            console.log('Response:', response);
            if (response.image_show) {
                state.setBanner({status: 'success', message: 'Bead averaging was successful'});
                const newAverageBead = response.image_show.map((base64Data, index) => {
                    return base64ToTiff(base64Data, 'image/tiff', `avg_bead_${index}.tiff`);
                });
                state.setAverageBead(newAverageBead);
                if (response.projections) {
                    const newProjection = response.projections.map((base64Data, index) => {
                        return base64ToTiff(base64Data, 'image/tiff', `avg_bead_xyz_${index}.tiff`);
                    });
                    state.setAverageBeadProjection(newProjection);
                    console.log(response.projections);
                } else {
                    console.log('No average bead projection found in the response.');
                    window.alert('No average bead projection found in the response.');
                }
            } else {
                console.log('No average bead found in the response.');
                window.alert('No average bead found in the response.');
            }
        } catch (error) {
            console.error('Error in Bead Average:', error);
            window.alert('Error in Bead Average: ' + error.response);
        }
    };

    const handleBeadAutosegment = async () => {
        state.setBanner({status: 'info', message: 'Bead auto-segmentation was started'});
        try {
            const requestData = {
                max_area: state.maxArea,
            };
            const response = await axiosStore.postAutosegmentBeads(requestData);
            console.log('Response:', response);

            if (response.bead_coords) {
                state.setBanner({status: 'success', message: 'Bead auto-segmentation was successful'});
            } else {
                console.log('No bead coordinates found in the response.');
                window.alert('No bead coordinates found in the response.');
            }
        } catch (error) {
            console.error('Error in Bead Autosegmentation:', error);
            window.alert('Error in Bead Autosegmentation: ' + error.response);
        }
    };

    function getStepContent(step) {
        switch (step) {
            case steps.indexOf('Load beads'):
                return (
                    <>
                        <ImageLoader
                            state={state}
                            imageType={'beads_img'}
                            setFiles={state.setBeads}
                            getProjections={false}
                            addProjections={null}
                            isVoxel={true}
                            nameImage={'Beads image'}
                            makePreload={false}
                        />
                    </>
                );
            case steps.indexOf('Segment & average beads'):
                return (
                    <>
                        <div className="row">
                            <div className="column-1"
                                 style={{marginTop: '10px', border: `1px solid var(--button-color)`, height: '420px'}}>
                                <SliderContainer
                                    state={state}
                                    imageShow={state.beads}
                                    isScale={false}
                                />
                                <div className="btn-stack-buttons" style={{marginBottom: "5px"}}>
                                    <CustomButton
                                        nameBtn={"Undo mark"}
                                        colorBtn={'var(--button-color)'}
                                        handleProcess={state.handleUndoMark}
                                    />
                                    <CustomButton
                                        nameBtn={"Clear all marks"}
                                        colorBtn={'var(--button-color)'}
                                        handleProcess={state.handleClearMarks}
                                    />
                                </div>
                                <CustomTextfield
                                    label={"Max area"}
                                    value={state.maxArea}
                                    setValue={state.setMaxArea}
                                    placeholder={"Enter a max area"}
                                />
                                <CustomButton
                                    nameBtn={"Auto-segment beads"}
                                    colorBtn={'var(--button-color2)'}
                                    handleProcess={handleBeadAutosegment}
                                />
                                <ChooseList
                                    className="choose-list"
                                    name="Blur type"
                                    list={state.denoiseTypes}
                                    selected={state.denoiseType}
                                    onChange={state.handleDenoiseTypeChange}
                                    customTextColor={'var(--textfield-color)'}
                                />
                                <div style={{marginBottom: 'auto'}}>
                                    <CustomButton
                                        nameBtn={"Average beads"}
                                        colorBtn={'var(--button-color)'}
                                        handleProcess={handleBeadAverage}

                                    />
                                </div>
                            </div>
                            <div className="column-2" style={{zIndex: 1, marginLeft: '20px'}}>
                                {state.banner.status &&
                                    <SurveyBanner status={state.banner.status} message={state.banner.message}
                                                  onClose={state.closeBanner}/>}
                                <div className="images__preview">
                                    <TifRow
                                        tifJSXList={[<TiffExtractor
                                            img={state.beads[state.layer]}
                                            scale={1}
                                            state={state}
                                            canvasRef={canvasRef}
                                            customBorder={'var(--button-color)'}
                                        />,
                                            <TifViewer
                                                img={state.averageBead[state.layer]}
                                                scale={5}
                                                brightness={state.levelBrightness}
                                                imageProjection={state.averageBeadProjection}
                                                imageName={'Averaged bead'}
                                            />]}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                );
            case steps.indexOf('Save results'):
                return (
                    <>
                        <Downloader
                            state={state}
                            imagesShow={state.averageBead}
                            imagesSave={state.averageBeadSave}
                            imageProjection={state.averageBeadProjection[0]}
                            isScale={true}
                        />
                    </>
                );
            default:
                return "unknown step";
        }
    }

    return (
        <div>
            <StepperWrapper
                name="Bead extraction"
                stepContent={getStepContent}
                steps={steps}
                handleNextStep={state.handleNextStep}
                handlePrevStep={state.handlePrevStep}
                activeStep={state.activeStep}
                isLoad={state.isLoad}
                urlPage='/psf'
                typeRun='PSF'
            />
        </div>
    );
};

export default BeadExtractor;
