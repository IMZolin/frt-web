import React from 'react';
import TiffStackViewer from '../TiffStackViewer';
import './tif_compare.css';

const TifCompare = ({ img_1, img_2, scale, state, numImagePage}) => {
  return (
    <div className="tif-container" >
      <div className="images-container">
        {img_1 ? (
          <TiffStackViewer tiffList={img_1} scale={scale} className="tif-single" state={state} numImagePage={numImagePage}/>
        ) : (
          null
        )}
        {img_2 ? (
          <TiffStackViewer tiffList={img_2} scale={scale} className="tif-single" state={state} numImagePage={numImagePage}/>
        ) : (
          null
        )}
      </div>
    </div>
  );
};

export default TifCompare;
