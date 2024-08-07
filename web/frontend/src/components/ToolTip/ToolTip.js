import React from 'react';
import './tooltip.css';

const Tooltip = ({ message, visible, x, y }) => {
    const style = {
        top: y + 'px',
        left: x + 50 + 'px',
    };

    return (
        <div className={`tooltip ${visible ? 'visible' : ''}`} style={style}>
            {message}
        </div>
    );
};

export default Tooltip;
