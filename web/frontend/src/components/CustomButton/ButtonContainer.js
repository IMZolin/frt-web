import React, { useState } from 'react';
import CustomButton from './CustomButton';

const ButtonContainer = ({ state }) => {
    return (
        <div className="btn-stack-buttons">
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
    );
};

export default ButtonContainer;
