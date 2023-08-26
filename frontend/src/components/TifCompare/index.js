import React from 'react';
import TiffStackViewer from '../TiffStackViewer';
import './tif_compare.css';

const TifCompare = ({ files_1, files_2, scale, state, canvasRef, isExtract, numImagePage }) => {
  console.log(files_1, files_2);
  return (
    <div className="tif-container" >
      <div className="viewer-label">Before:</div>
      <div className="images-container">
        {files_1 ? (
          <TiffStackViewer tiffList={files_1} scale={scale} className="tif-single" state={state} canvasRef={canvasRef} isExtract={isExtract} numImagePage={numImagePage}/>
        ) : (
          null
        )}
        {files_2 ? (
          <TiffStackViewer tiffList={files_2} scale={scale} className="tif-single" state={state} canvasRef={canvasRef} isExtract={isExtract} numImagePage={numImagePage}/>
        ) : (
          null
        )}
      </div>
    </div>
  );
};

export default TifCompare;
