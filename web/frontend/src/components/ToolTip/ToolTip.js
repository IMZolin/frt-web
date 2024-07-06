import React from 'react';
import './tooltip.css';

const Tooltip = ({ message, visible }) => {
    return (
        <div className={`tooltip ${visible ? 'visible' : ''}`}>
            {message}
        </div>
    );
};

export default Tooltip;
