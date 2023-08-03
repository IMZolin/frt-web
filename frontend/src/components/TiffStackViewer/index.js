import React from 'react';
import TifViewer from '../TifViewer';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './tiff_stack.css';
import zIndex from '@mui/material/styles/zIndex';

const TiffStackViewer = ({ tiffList, scale, state, canvasRef, isExtract, numImagePage }) => {
  if (!tiffList || tiffList.length === 0) {
    return null;
  }

  if (tiffList.length === 1) {
    return <TifViewer img={tiffList[0]} scale={scale} brightness={state.levelBrightness} />;
  }

  const sliderSettings = {
    dots: true,
    speed: 500,
    slidesToShow: numImagePage,
    slidesToScroll: 1,
    beforeChange: (currentSlide, next) => state.handleLayerChange(next),
  };

  return (
    <div className="slider-wrapper">
      {/* <canvas
                  ref={canvasRef}
                  width={state.beads[0].width} 
                  height={state.beads[0].height}
                  style={{ border: '1px solid black', cursor: 'crosshair' }}
                  onClick={(e) => state.handleDrawClick(e, canvasRef)} 
      /> */}
      <Slider {...sliderSettings}>
        {tiffList.map((tiff, index) => (
          <div className="slick-slide" key={index}>
            {isExtract ?
              <>
                <div
                  className="canvas-wrapper"
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '360px',
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    width={state.resolution[2]}
                    height={state.resolution[1]}
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
                  <TifViewer img={tiff} scale={scale} brightness={state.levelBrightness} className="slick-slide-image" />
                </div>
              </> :
              <>
                <div
                  className="canvas-wrapper"
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '200px',
                    marginTop: `${state.marginTop}px`
                  }}
                >
                  <TifViewer img={tiff} scale={scale} brightness={state.levelBrightness} className="slick-slide-image" />
                </div>
              </>
            }
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default TiffStackViewer;
