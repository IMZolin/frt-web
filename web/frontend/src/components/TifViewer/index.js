import React from "react";
import { TIFFViewer } from "react-tiff";
import "./tif_viewer.css";

const TifViewer = ({ img, scale, brightness, imageProjection, imageName = null, imageDimensions }) => {
  const handleButtonClick = (e) => {
    e.preventDefault();
  };

  const isLargeImage = imageDimensions.length >= 3 && (imageDimensions[1] > 200 || imageDimensions[2] > 200);
  console.log(isLargeImage);
  const viewerStyle = {
    transform: `scale(${scale})`,
    filter: `brightness(${brightness})`,
    objectFit: 'contain',
    overflow: isLargeImage ? 'auto' : 'hidden',
    width: isLargeImage ? '300px' : '100%',
    height: isLargeImage ? '300px' : '100%'
  };

  const projectionStyle = {
    marginLeft: '40px',
    transform: `scale(0.45)`,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    overflow: 'auto'
  };

  return (
    <div className="tif-viewer-container">
      {imageName && <h4 className="image-title">{imageName}</h4>}
      <div className="tif-viewer">
        {img ? (
          <TIFFViewer
            key={img.id}
            tiff={img.data}
            paginate="bottom"
            buttonColor="#337fd6"
            onClick={handleButtonClick}
            style={viewerStyle}
          />
        ) : null}
        {imageProjection ? (
          <TIFFViewer
            key={imageProjection.id}
            tiff={imageProjection.data}
            paginate="bottom"
            buttonColor="#337fd6"
            onClick={handleButtonClick}
            style={projectionStyle}
          />
        ) : null}
      </div>
    </div>
  );
};

export default TifViewer;
