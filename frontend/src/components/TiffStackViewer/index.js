import React from 'react';
import TifViewer from '../TifViewer';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './tiff_stack.css';


const TiffStackViewer = ({ tiffList, scale, state, numImagePage }) => {
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
    beforeChange: (currentSlide, next) => state.setLayer(next),
  };

  return (
    <div className="slider-wrapper">
      <Slider {...sliderSettings}>
        {tiffList.map((tiff, index) => (
          <div className="slick-slide" key={index} style={{ marginLeft: `${state.marginTop}px`}}>
            <TifViewer img={tiff} scale={scale} brightness={state.levelBrightness} className="slick-slide-image" />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default TiffStackViewer;