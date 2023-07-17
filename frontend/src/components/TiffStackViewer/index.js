import React, { useState } from 'react';
import TifViewer from '../TifViewer';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './tiff_stack.css';

const TiffStackViewer = ({ tiffList, scale, brightness }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleSlideChange = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  if (!tiffList || tiffList.length === 0) {
    return null; 
  }

  if (tiffList.length === 1) {
    return <TifViewer img={tiffList[0]} scale={scale} brightness={brightness} />;
  }

  const sliderSettings = {
    dots: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange: (currentSlide, next) => handleSlideChange(next),
  };

  return (
    <div className="slider-wrapper">
      <Slider {...sliderSettings}>
        {tiffList.map((tiff, index) => (
          <div className="slick-slide" key={index}>
            <TifViewer img={tiff} scale={scale} brightness={brightness} className="slick-slide-image" />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default TiffStackViewer;


