import React from 'react';
import ChooseList from "../../ChooseList";
import TifCompare from "../../TifCompare";
import CustomButton from "../../CustomButton/CustomButton";
import SliderContainer from "../../SliderContainer/SliderContainer";

const PreprocessStep = ({ state, handlePreprocessing }) => {
    return (
        <div className="row">
            <div className="column-1" style={{zIndex: 2, border: `1px solid var(--button-color)`}}>
                <SliderContainer
                    state={state}
                    imageShow={state.sourceImage}
                    isScale={false}
                />
                <div className="box-parameters">
                    <ChooseList
                        className="choose-list"
                        name="Denoise type"
                        list={state.denoiseTypes}
                        selected={state.denoiseType}
                        onChange={state.handleDenoiseTypeChange}
                        customTextColor={'var(--textfield-color)'}
                    />
                </div>
                <CustomButton
                    nameBtn={"Make preprocessing"}
                    colorBtn={'var(--button-color)'}
                    handleProcess={handlePreprocessing}
                />
            </div>
            <div className="column-2">
                <div className="images__preview">
                    <TifCompare
                        img_1={state.sourceImage}
                        img_2={state.preprocImage}
                        img_1_projection={null}
                        img_2_projection={null}
                        scale={state.scale}
                        state={state}
                        isSameLength={true}
                        type='deconvolution'
                        layerColor={state.customTextColor}
                    />
                </div>
            </div>
        </div>
    );
};

export default PreprocessStep;
