import React from 'react';
import './tooltip.css';

const Tooltip = ({ message, visible, x, y }) => {
    const style = {
        top: y + 10 + 'px',
        left: x + 10 + 'px',
    };

    return (
        <div className={`tooltip ${visible ? 'visible' : ''}`} style={style}>
            {message}
        </div>
    );
};

export default Tooltip;
