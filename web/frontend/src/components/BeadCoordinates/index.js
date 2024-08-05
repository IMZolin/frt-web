import React from 'react';
import './bead_coordinates.css';

const BeadCoordinates = ({coordinates}) => {
    return (
        <>
            <h4>Bead Coordinates (count: {coordinates.length})</h4>
            <div className="bead-coordinates-container">
                <ul className="bead-coordinates-list">
                    {coordinates.map((coord, index) => (
                        <li key={index} className="bead-coordinate-item">
                            {`[${coord.x}, ${coord.y}]`}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default BeadCoordinates;
