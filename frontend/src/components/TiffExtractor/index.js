import React, { useEffect } from 'react';
import TifViewer from '../TifViewer';
import useBeadMark from './hook'; 
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './tiff_extractor.css';

const TiffExtractor = ({ img, scale, state, canvasRef }) => {
  const markBead = useBeadMark(); 

  useEffect(() => {
    console.log(img);
  }, [img]);

  if (!img) {
    return null;
  }

  const handleDrawClick = async (e, canvasRef) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerCoords = await markBead(x, y, state.selectSize);
    if (centerCoords) {
      state.setCenterExtractBeads((prevCenterExtractBeads) => [
        ...prevCenterExtractBeads,
        { x: centerCoords.x, y: centerCoords.y },
      ]);
      console.log(centerCoords);
      state.drawSquare(centerCoords.x, centerCoords.y, state.selectSize, canvasRef);
    }
  };

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
          onClick={(e) => handleDrawClick(e, canvasRef)}
        />
        <TifViewer img={img} scale={scale} brightness={state.levelBrightness} />
      </div>
    </div>
  );
};

export default TiffExtractor;
