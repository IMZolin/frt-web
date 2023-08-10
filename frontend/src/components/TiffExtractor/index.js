import React from 'react';
import TifViewer from '../TifViewer';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './tiff_extractor.css';

const TiffExtractor = ({ img, scale, state, canvasRef}) => {
  if (!img) {
    return null;
  }
  console.log(img);

  return (
    <div className="tiff-wrapper">
      <div className="tiff-canvas">
        <canvas
          ref={canvasRef}
          width={state.resolution[2]}
          height={state.resolution[2]}
          style={{
            position: 'absolute',
            border: '1px solid black',
            zIndex: 3,
            top: 0,
            left: 0,
            cursor: 'crosshair',
            background: 'transparent',
          }}
          onClick={(e) => state.handleDrawClick(e, canvasRef)}
        />
        <TifViewer img={img} scale={scale} brightness={state.levelBrightness} />
      </div>
    </div>
  );
};

export default TiffExtractor;

