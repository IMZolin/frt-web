import React, { useRef } from 'react';
import TifViewer from '../TifViewer';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './tiff_stack.css';
// import useAxiosStore from '../../app/store/axiosStore';

const TiffStackViewer = ({ tiffList, scale, state, isExtract}) => {
  const canvasRef = useRef(null);

  if (!tiffList || tiffList.length === 0) {
    return null;
  }

  if (tiffList.length === 1) {
    return <TifViewer img={tiffList[0]} scale={scale} brightness={state.brightness} />;
  }

  const sliderSettings = {
    dots: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange: (currentSlide, next) => state.handleLayerChange(next),
  };

  return (
    <div className="slider-wrapper">
      <Slider {...sliderSettings}>
        {tiffList.map((tiff, index) => (
          <div className="slick-slide" key={index}>
            {/* {isExtract && (
              <canvas
                ref={canvasRef}
                width={state.beads[0].width}
                height={state.beads[0].height}
                // style={{ border: '1px solid black', cursor: 'crosshair' }}
                style={{
                  // position: 'absolute',
                  // top: 0,
                  // left: 0,
                  cursor: 'crosshair',
                  zIndex: 2,
                }}
                onClick={(e) => state.handleDrawClick(e, canvasRef)}
              />
            )} */}
            <TifViewer img={tiff} scale={scale} brightness={state.brightness} className="slick-slide-image"/>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default TiffStackViewer;

