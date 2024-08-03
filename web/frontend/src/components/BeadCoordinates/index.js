import React from 'react';
import './bead_coordinates.css';

const BeadCoordinates = ({ coordinates }) => {
  return (
    <div className="bead-coordinates-container">
      <h5>Bead Coordinates (count: {coordinates.length})</h5>
      <ul className="bead-coordinates-list">
        {coordinates.map((coord, index) => (
          <li key={index} className="bead-coordinate-item">
            {`[${coord.x}, ${coord.y}]`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BeadCoordinates;
