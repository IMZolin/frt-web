import React, { useState } from 'react';
import TifViewer from '../TifViewer';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './tiff_stack.css';
import useAxiosStore from '../../app/store/axiosStore';

const TiffStackViewer = ({ tiffList, scale, brightness }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const axiosStore = useAxiosStore();

  const handleSlideChange = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  const handleConvertImage = async (inputFiles, outputPrefix) => {
    try {
      let formData = new FormData();
      const fileObjects = inputFiles.map((file) => file.file);

      fileObjects.forEach((file) => {
        formData.append('file', file);
      });

      const requestData = {
        file: fileObjects,
        output_prefix: outputPrefix,
      };

      const response = await axiosStore.convertImage(requestData);
      console.log('Conversion successful:', response);

      const outputFiles = response.map((fileName, index) => ({
        file: fileName,
        name: `Output ${index + 1}`,
      }));
      console.log('Output files:', outputFiles);

      return (
        <div className="slider-wrapper">
          <Slider {...sliderSettings}>
            {outputFiles.map((outputFile, index) => (
              <div className="slick-slide" key={index}>
                <TifViewer
                  img={outputFile.file}
                  scale={scale}
                  brightness={brightness}
                  className="slick-slide-image"
                />
              </div>
            ))}
          </Slider>
        </div>
      );
    } catch (error) {
      console.error('Error converting image:', error);
    }
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    handleConvertImage(tiffList, 'output_prefix');
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
      <button onClick={handleButtonClick}>Convert Image</button>
    </div>
  );
};

export default TiffStackViewer;
