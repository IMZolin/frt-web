import React from 'react';
import './tif_row.css';

const TifRow = ({ tifJSXList = [], styleList = [] }) => {
    return (
        <div className="tif-row">
            {tifJSXList.map((component, index) => (
                <div key={index} style={styleList[index] || {}} className="tif-item">
                    {component}
                </div>
            ))}
        </div>
    );
}

export default TifRow;
