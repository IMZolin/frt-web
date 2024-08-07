import React, { useEffect } from 'react';
import useBeadMark from './hook';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './tiff_extractor.css';
import {TIFFViewer} from "react-tiff";

const TiffExtractor = ({ img, scale, state, canvasRef}) => {
  const markBead = useBeadMark(state);

  if (!img) {
    return null;
  }

  const handleDrawClick = async (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scrollLeft = canvas.scrollLeft;
    const scrollTop = canvas.scrollTop;
    console.log(state.beadsDimensions);
    const x = (e.clientX - rect.left + scrollLeft) * (state.beadsDimensions[2] / canvas.width);
    const y = (e.clientY - rect.top + scrollTop) * (state.beadsDimensions[1] / canvas.height);

    const centerCoords = await markBead(img, x, y, state.selectSize);
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
          <h4 className="image-title">Beads image</h4>
          <div className="tiff-canvas">
              <canvas
                  ref={canvasRef}
                  width={state.beadsDimensions[2]}
                  height={state.beadsDimensions[1]}
                  style={{
                      position: 'absolute',
                      border: '1px solid black',
                      zIndex: 3,
                      cursor: 'crosshair',
                      background: 'transparent',
                      overflow: 'auto',
                      top: 0,
                      left: 0,
                  }}
                  onClick={(e) => handleDrawClick(e, canvasRef)}
              />
              <TIFFViewer
                  key={img.id}
                  tiff={img.data}
                  paginate="bottom"
                  buttonColor="#337fd6"
                  onClick={null}
              />
          </div>
      </div>

  );
};

export default TiffExtractor;