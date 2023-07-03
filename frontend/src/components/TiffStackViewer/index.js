import React from 'react';
import TifViewer from '../TifViewer';
// import './TiffStackViewer.css';

const TiffStackViewer = ({ tiffList, scale, brightness }) => {
  if (tiffList.length === 1) {
    return <TifViewer img={tiffList[0]} scale={scale} brightness={brightness}/>;
  }

  return (
    <div className="tiff-stack-container">
      {tiffList.map((tiff, index) => (
        <TifViewer key={index} img={tiff} scale={scale} brightness={brightness}/>
      ))}
    </div>
  );
};

export default TiffStackViewer;

