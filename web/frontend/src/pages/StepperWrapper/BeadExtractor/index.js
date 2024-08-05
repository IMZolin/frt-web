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
import TifViewer from "../../../components/TifViewer";
import TifRow from "../../../components/TifRow";
import BeadCoordinates from "../../../components/BeadCoordinates";

const BeadExtractor = () => {
    const state = useStateValues();
    const steps = ['Load beads', 'Segment & average beads', 'Save results'];
    const axiosStore = useAxiosStore();
    const canvasRef = useRef();
    const markBead = useBeadMark();
    const handleBeadAutosegment = async () => {
        state.setBanner({status: 'info', message: 'Bead auto-segmentation was started'});
        try {
            const requestData = {
                max_area: state.maxArea,
            };
            const response = await axiosStore.postAutosegmentBeads(requestData);
            console.log('Response:', response);

            if (response.bead_coords) {
                try {
                    const beadCoordsArray = JSON.parse(response.bead_coords);
                    if (Array.isArray(beadCoordsArray)) {
                        const centerExtractBeads = beadCoordsArray.map(coord => {
                            if (Array.isArray(coord) && coord.length === 2) {
                                return {x: coord[0], y: coord[1]};
                            } else {
                                console.error('Invalid bead coordinate format:', coord);
                                return null;
                            }
                        }).filter(coord => coord !== null);

                        state.setCenterExtractBeads(centerExtractBeads);
                        const drawPromises = centerExtractBeads.map(beadCoords =>
                            state.handleAllDrawClick(canvasRef, beadCoords.x, beadCoords.y, markBead)
                        );
                        await Promise.all(drawPromises);

                        state.setBanner({status: 'success', message: 'Bead auto-segmentation was successful'});
                    } else {
                        console.error('Parsed bead coordinates are not an array:', beadCoordsArray);
                        window.alert('Parsed bead coordinates are not an array.');
                    }
                } catch (error) {
                    console.error('Error parsing bead coordinates:', error);
                    window.alert('Error parsing bead coordinates.');
                }
            } else {
                console.log('No bead coordinates found in the response.');
                window.alert('No bead coordinates found in the response.');
            }
        } catch (error) {
            console.error('Error in Bead Autosegmentation:', error);
            window.alert('Error in Bead Autosegmentation: ' + error.response);
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
                            addDimensions={state.setBeadsDimensions}
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
                                        handleProcess={(e) => state.handleUndoMark(e, canvasRef)}
                                    />
                                    <CustomButton
                                        nameBtn={"Clear all marks"}
                                        colorBtn={'var(--button-color)'}
                                        handleProcess={(e) => state.handleClearMarks(e, canvasRef)}
                                    />
                                </div>
                                <CustomTextfield
                                    label={"Box size"}
                                    value={state.selectSize}
                                    setValue={state.setSelectSize}
                                    placeholder={"Enter a select size"}
                                />
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
                                        tifJSXList={[
                                            <TiffExtractor
                                                img={state.beads[state.layer]}
                                                scale={1}
                                                state={state}
                                                canvasRef={canvasRef}
                                            />,
                                            <BeadCoordinates
                                                coordinates={state.centerExtractBeads}
                                            />,
                                            <TifViewer
                                                img={state.averageBead[state.layer]}
                                                scale={3}
                                                brightness={state.levelBrightness}
                                                imageProjection={state.averageBeadProjection[0]}
                                                imageName={'Averaged bead'}
                                                imageDimensions={state.psfDimensions}
                                            />
                                        ]}
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
                            imageType={'avg_bead'}
                            imageProjection={state.averageBeadProjection[0]}
                            isScale={true}
                            nameImage={'Averaged bead'}
                            imageDimensions={state.psfDimensions}
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
