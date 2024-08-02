import React from 'react';

const TifRow = ({ tifJSXList = [], styleList = [] }) => {
    return (
        <div className="tif-row">
            {tifJSXList.map((component, index) => (
                <div key={index} style={styleList[index] || {}}>
                    {component}
                </div>
            ))}
        </div>
    );
}

export default TifRow;
